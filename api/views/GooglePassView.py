from uuid import uuid4

from api.models import Profiles
from api.views.Services import get_user_from_token
from api.models.demo_generic import DemoGeneric
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import viewsets, status
from django.http import JsonResponse
import os
from django.utils import timezone

class GooglePass(viewsets.GenericViewSet):
   
    @action(methods=['POST'], detail=False)
    def google_pass(self, request):
        try:
            from django.conf import settings
            if not getattr(settings, "GOOGLE_WALLET_ENABLED", False):
                return JsonResponse({
                    'status': False,
                    'message': 'Google Wallet pass is not configured in development.'
                }, status=400)

            user = get_user_from_token(request)
            username = request.data.get('username')
            if not username:
                raise TypeError("Username is required")
            if username == user.username:

                name = user.name
                company = user.company
            else:
                profile = Profiles.objects.filter(username=username).first()
                if not profile:
                    return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
                name = profile.name
                company = profile.company
            if not name:
                raise TypeError("Name is required")
            if not company:
                raise TypeError("Company Name is required")

            demo = DemoGeneric()

            issuer_id = os.environ.get("WALLET_ISSUER_ID", "3388000000022321439")
            class_suffix = os.environ.get("WALLET_CLASS_SUFFIX", "nsg_business_card")
            object_suffix = os.environ.get("WALLET_OBJECT_SUFFIX", f"nsg_business_obj_{user.id}_{username}")
            print (object_suffix)
            demo.create_class(issuer_id=issuer_id, class_suffix=class_suffix)
            #demo.update_class(issuer_id=issuer_id, class_suffix=class_suffix)
            #demo.patch_class(issuer_id=issuer_id, class_suffix=class_suffix)
            demo.create_object(issuer_id=issuer_id, class_suffix=class_suffix, object_suffix=object_suffix)
            demo.update_object(issuer_id=issuer_id, object_suffix=object_suffix,name=name,company=company,username=username)
            #demo.patch_object(issuer_id=issuer_id, object_suffix=object_suffix)
            add_to_wallet =demo.create_jwt_new_objects(issuer_id=issuer_id, class_suffix=class_suffix, object_suffix=object_suffix)
            #demo.create_jwt_existing_objects(issuer_id=issuer_id)
            #demo.batch_create_objects(issuer_id=issuer_id, class_suffix=class_suffix)
            
            return JsonResponse({'message': 'API calls completed successfully','Add to wallet':add_to_wallet}, status=200)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
