from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from api.models import Profiles, User
from api.views.Services import get_user_from_token
from django.shortcuts import get_object_or_404
from django.http import FileResponse, JsonResponse
from django.core.files.base import ContentFile
from rest_framework.decorators import action
from api.models.ApplePass import ApplePass
from rest_framework import viewsets, status
from django.utils import timezone
from django.urls import reverse
import subprocess
import logging
import os

logger = logging.getLogger(__name__)

class AppleView(viewsets.GenericViewSet):

    

    @action(methods=['POST'], detail=False)
    def generate_pass(self, request):
        try:
            from django.conf import settings
            if not getattr(settings, "APPLE_WALLET_ENABLED", False):
                return JsonResponse({
                    'status': False,
                    'message': 'Apple Wallet pass is not configured in development.'
                }, status=400)

            user_id = request.data.get('user_id', None)
            user = User.objects.filter(id=user_id).first()

            if not user_id:
                user = get_user_from_token(request)
            username = request.data.get('username', user.username if user else None)
            if not username:
                raise TypeError("Username is required")
            pkpass_file_path = "api/models/NSG.pkpass"

            if user:
                if username == user.username:

                    name = user.name
                    company = user.company
                else:
                    profile = Profiles.objects.filter(username=username).first()
                    if not profile:
                        return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
                    name = profile.name
                    company = profile.company
                # Run subprocess with error handling
                result = subprocess.run(
                    ["python", "api/models/main.py", name, company, username],
                    check=True,
                    capture_output=True,
                    text=True
                )
                print(f"Subprocess output: {result.stdout}")

                # Verify the pkpass file was generated
                if not os.path.exists(pkpass_file_path):
                    raise FileNotFoundError(f"Pass file not generated: {pkpass_file_path}")

                # Load and save pkpass data
                with open(pkpass_file_path, 'rb') as pkpass_file:
                    pkpass_data = pkpass_file.read()

                pass_file_name = f'NSG_{user.id}_{username}_{timezone.now().strftime("%Y%m%d%H%M%S")}.pkpass'
                existing_pass = ApplePass.objects.filter(fk_user=user,username=username).first()
                if existing_pass:
                    existing_pass.applepass.save(pass_file_name, ContentFile(pkpass_data))
                    existing_pass.timestamp = timezone.now()
                    existing_pass.save()
                    file_download_url = reverse('download_pass', kwargs={'id': existing_pass.id})
        
                else:
                    apple_pass_instance = ApplePass.objects.create(
                        applepass=ContentFile(pkpass_data, name=pass_file_name),
                        timestamp=timezone.now(),
                        fk_user=user,
                        username=username,
                    )
                    file_download_url = reverse('download_pass', kwargs={'id': apple_pass_instance.id})

                return JsonResponse({'download_url': file_download_url})

        except subprocess.CalledProcessError as e:
            logger.error(f"Subprocess failed: {e.stderr}")
            return JsonResponse({'error': 'Error generating the pass.'}, status=500)
        except FileNotFoundError as e:
            logger.error(e)
            return JsonResponse({'error': str(e)}, status=500)
        except Exception as e:
            logger.error(f"An unexpected error occurred: {e}")
            return JsonResponse({'error': f'An error occurred while generating the pass., {e}'}, status=500)

    def download_pass(self, request, id=None):
        apple_pass_instance = get_object_or_404(ApplePass, id=id)
        return FileResponse(apple_pass_instance.applepass.open('rb'), as_attachment=True)
