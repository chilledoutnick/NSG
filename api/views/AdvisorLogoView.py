import uuid
from api.models import *
from api.models.TeamAdmin import AdminAdvisor, TeamReferralRelationship
from api.views.Services import get_user_from_token, webp_convertor
from api.models.AdvisorLogo import AdvisorLogo, AdvisorProfileLogo
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from datetime import datetime

class AdvisorLogoView(viewsets.GenericViewSet):

    @action(methods=['POST'], detail=False)
    def upload_logo(self, request):
        try:
            user = get_user_from_token(request)
            if not user:
                return Response({'message': 'User not authorized'}, status=status.HTTP_401_UNAUTHORIZED)
            username = request.data.get("username")
            if 'logo' not in request.FILES:
                return Response({'success': False, 'message': 'Invalid request. Missing "logo" in the request.'},
                                status=status.HTTP_400_BAD_REQUEST)

            logo = request.FILES['logo']
            logo_webp = webp_convertor(logo)

            if username==user.username:
                # Check if AdvisorLogo already exists
                existing_logo = AdvisorLogo.objects.filter(fk_user=user).first()

                if existing_logo:
                    # Delete the existing logo
                    existing_logo.logo.delete()
                    existing_logo.delete()

                # Create a new AdvisorLogo entry
                AdvisorLogo.objects.create(fk_user=user, logo=logo_webp, timestamp=datetime.now())
            else:
                profile=Profiles.objects.filter(username=username)
                if profile.logo:
                    existing_logo = AdvisorProfileLogo.objects.filter(fk_profile=profile).first()
                    if existing_logo:
                        existing_logo.logo.delete()
                        existing_logo.delete()
                    AdvisorProfileLogo.objects.create(fk_profile=profile, logo=logo_webp, timestamp=datetime.now())
                else:
                    return Response({'success': False, 'message': 'Profile not found.'},
                                status=status.HTTP_404_NOT_FOUND)

            return Response({'success': True, 'message': 'Image processed and saved successfully.'},
                            status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'success': False, 'message': str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

    @action(methods=['POST'], detail=False)
    def get_logo(self, request):
        try:
            
            username = request.data.get("username", "")
            try:
                user = User.objects.filter(username=username).first()
            except:
                user = None
            if user:
            # Check if the user is part of a team
                team_relationship = TeamReferralRelationship.objects.filter(team_user=user).first()
                if team_relationship:
                    # If part of a team, get the admins logo
                    admin_user = AdminAdvisor.objects.filter(fk_user=team_relationship.admin_user).first()
                    if admin_user:
                        if admin_user.logo:
                            logo_url = request.build_absolute_uri(admin_user.logo.url)
                            return Response({'logo': logo_url, 'id': admin_user.id}, status=status.HTTP_200_OK)
                        else:
                            return Response({'message': 'Admin user Logo not found'}, status=status.HTTP_404_NOT_FOUND)

                    else:
                        return Response({'message': 'Admin user not found'}, status=status.HTTP_404_NOT_FOUND)

                # Check if the user is an admin
                admin_user = AdminAdvisor.objects.filter(fk_user=user).first()
                if admin_user:
                    if admin_user.logo:
                        logo_url = request.build_absolute_uri(admin_user.logo.url)
                        return Response({'logo': logo_url, 'id': admin_user.id}, status=status.HTTP_200_OK)
                    else:
                        return Response({'message': 'Admin user Logo not found'}, status=status.HTTP_404_NOT_FOUND)

                # If not part of a team or an admin, get the user's own logo
                logo = AdvisorLogo.objects.filter(fk_user=user).first()
                if logo:
                    logo_url = request.build_absolute_uri(logo.logo.url)
                    return Response({'logo': logo_url, 'id': logo.id}, status=status.HTTP_200_OK)
                else:
                    return Response({'message': 'Logo not found'}, status=status.HTTP_404_NOT_FOUND)
            else:
                profile=Profiles.objects.filter(username=username).first()
                team_relationship = TeamReferralRelationship.objects.filter(team_user=profile.fk_user).first()
                if team_relationship:
                    # If part of a team, get the admins logo
                    admin_user = AdminAdvisor.objects.filter(fk_user=team_relationship.admin_user).first()
                    if admin_user:
                        if admin_user.logo:
                            logo_url = request.build_absolute_uri(admin_user.logo.url)
                            return Response({'logo': logo_url, 'id': admin_user.id}, status=status.HTTP_200_OK)
                        else:
                            return Response({'message': 'Admin user Logo not found'}, status=status.HTTP_404_NOT_FOUND)

                    else:
                        return Response({'message': 'Admin user not found'}, status=status.HTTP_404_NOT_FOUND)

                # Check if the user is an admin
                admin_user = AdminAdvisor.objects.filter(fk_user=profile.fk_user).first()
                if admin_user:
                    if admin_user.logo:
                        logo_url = request.build_absolute_uri(admin_user.logo.url)
                        return Response({'logo': logo_url, 'id': admin_user.id}, status=status.HTTP_200_OK)
                    else:
                        return Response({'message': 'Admin user Logo not found'}, status=status.HTTP_404_NOT_FOUND)

                # If not part of a team or an admin, get the user's own logo
                logo = AdvisorProfileLogo.objects.filter(fk_profile=profile).first()
                if logo:
                    logo_url = request.build_absolute_uri(logo.logo.url)
                    return Response({'logo': logo_url, 'id': logo.id}, status=status.HTTP_200_OK)
                else:
                    return Response({'message': 'Logo not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)