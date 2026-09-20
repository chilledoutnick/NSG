
import os
from rest_framework.response import Response
import requests
from rest_framework import viewsets, status
from rest_framework.decorators import action
from django.core.files.uploadedfile import TemporaryUploadedFile, InMemoryUploadedFile
from django.core.files.base import ContentFile
import stripe
from api.models import *
from api.models import NSGSmartCard
from api.models import AdvisorLogo
from api.models.AdvisorLogo import AdvisorProfileLogo,AdvisorLogo
from api.models.TeamAdmin import AdminAdvisor, TeamReferralRelationship
from api.serializers import ProfileContactInfoSerializer
from api.utils.logo import get_final_logo
from api.views.Services import *
from api.models.Link import UserLink
from datetime import datetime

class ProfileView(viewsets.GenericViewSet):

    @action(methods=["POST"], detail=False)
    def create_profile(self, request):
        try:
            #we will create a new profile here or update an existing one
            user = get_user_from_token(request)
            if user is None:
                return Response({"message": "User Not found"},status=status.HTTP_401_UNAUTHORIZED)
            user_data = None
            name = request.data.get('name', "")
            about = request.data.get('about', "")
            instagram = request.data.get('instagram', "")
            facebook = request.data.get('facebook', "")
            linkedin = request.data.get('linkedin', "")
            twitter = request.data.get('twitter', "")
            tiktok = request.data.get('tiktok', "")
            youtube = request.data.get('youtube', "")
            company = request.data.get('company', "")
            designation = request.data.get('designation', "")
            card_name = request.data.get('card_name', "")
            background_colour = request.data.get('background_colour', '#282828')
            username = request.data.get('username', "")
            logo = request.FILES['logo'] if 'logo' in request.FILES else None
            # Welcome message
            wlcm_heading = request.data.get('wlcm_heading', "")
            wlcm_subheading = request.data.get('wlcm_subheading', "")
            wlcm_message = {
                "heading": wlcm_heading,
                "subheading": wlcm_subheading
            }
            profile_picture = request.FILES['profile_picture'] if 'profile_picture' in request.FILES else None
            # Check if profile with the same username
            profile= Profiles.objects.filter(username=username).first()
            if profile:
                    user_data = {
                        'message': """Profile with this username already exists. Please choose a different username.
                                        """
                    }
                    return Response(user_data, status=status.HTTP_400_BAD_REQUEST)
            user_username = User.objects.filter(username=username).first()
            if user_username:
                user_data = {
                    'message': """Profile with this username already exists. Please choose a different username.
                                                        """
                }
                return Response(user_data, status=status.HTTP_400_BAD_REQUEST)
            else:
                # Create new profile
                profile = Profiles.objects.create(
                    name=name,
                    about=about,
                    instagram=instagram,
                    facebook=facebook,
                    linkedin=linkedin,
                    twitter=twitter,
                    tiktok=tiktok,
                    youtube=youtube,
                    company=company,
                    designation=designation,
                    card_name=card_name,
                    background_colour=background_colour,
                    username=username,
                    wlcm_message=wlcm_message,
                    fk_user=user
                )
                if profile_picture:
                    profile_picture_file = image_compressor(profile_picture, profile)
                    profile.profile_picture = profile_picture_file
                else:
                    profile_picture_file = "webp_images/Left_grey_png.webp"
                    profile.profile_picture = profile_picture_file
                profile.save()
                if logo:
                    logo_webp = webp_convertor(logo)
                    logo=AdvisorProfileLogo.objects.create(fk_profile=profile, logo=logo_webp, timestamp=datetime.now())
                #default contact info
                data = []

                if user.email:
                    data.append({
                        "contact_type": "email",
                        "value": user.email,
                        "label": "office"
                    })

                if user.phone:
                    data.append({
                        "contact_type": "phone",
                        "value": user.phone,
                        "label": "office"
                    })
                serializer = ProfileContactInfoSerializer(data=data, many=True)

                if serializer.is_valid():
                    serializer.save(fk_profile=profile)
                name_parts = (profile.name or "").strip().split(" ")
                first_name = name_parts[0] if name_parts else ""
                last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""
                user_data = {
                    "id": profile.id,
                    "firstName":first_name,
                    "lastName":last_name,
                    "name": profile.name,
                    "username": profile.username,
                    "displayPic": profile.profile_picture.url if profile.profile_picture else None,
                    "logo": logo.logo.url if logo else None,
                    "about": profile.about,
                    "instagram": profile.instagram,
                    "facebook": profile.facebook,
                    "linkedin": profile.linkedin,
                    "twitter": profile.twitter,
                    "tiktok": profile.tiktok,
                    "youtube": profile.youtube,
                    "company": profile.company,
                    "designation": profile.designation,
                    "cardName": profile.card_name,
                    "backgroundColor": profile.background_colour,
                    "wlcm_message": profile.wlcm_message,
                }
            return Response(user_data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def update_profile(self, request):
        try:
            user = get_user_from_token(request)
            if user is None:
                return Response({"message": "User Not found"}, status=status.HTTP_401_UNAUTHORIZED)
            username = request.data.get('username')
            #first check if this is default profile or not
            if not username:
                return Response({"message": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)

            logo_url = None
            if username == user.username:
                updated_fields = {}

                # update normal text fields
                for field in (
                    "name", "about", "background_pattern",
                    "background_pattern_profile", "background_colour",
                    "company", "wlcm_heading", "wlcm_subheading"
                ):
                    if field in request.data:
                        setattr(user, field, request.data[field])
                        updated_fields[field] = getattr(user, field)
          
                if "profile_picture" in request.FILES:
                    profile_picture = request.FILES["profile_picture"]
                    profile_picture = image_compressor(profile_picture, user)
                    user.profile_picture = profile_picture

                # scheduling flag
                if "scheduling" in request.data:
                    scheduling_value = request.data["scheduling"].lower()
                    if scheduling_value == "true":
                        user.scheduling = True
                    elif scheduling_value == "false":
                        user.scheduling = False
                    else:
                        return Response(
                            {'message': 'Invalid value for scheduling. Please provide either "true" or "false".'},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                # review flag
                if "is_review" in request.data:
                    is_review_value = request.data["is_review"].lower()
                    if is_review_value == "true":
                        user.is_review = True
                    elif is_review_value == "false":
                        user.is_review = False
                    else:
                        return Response(
                            {'message': 'Invalid value for is_review. Please provide either "true" or "false".'},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                # designation
                if "designation" in request.data:
                    user.designation = request.data['designation']

                # Google Meet
                if "is_google_meet" in request.data:
                    is_google_meet_value = request.data["is_google_meet"]
                    if isinstance(is_google_meet_value, str):
                        is_google_meet_value = is_google_meet_value.lower() == "true"
                    user.google_meet = is_google_meet_value
                try:
                    logo = AdvisorLogo.objects.filter(fk_user=user).first()
                    logo_url = logo.logo.url
                except:
                    logo_url=None
                if "logo" in request.FILES:
                    logo = request.FILES['logo']
                    logo_webp = image_compressor(logo, user)
                    existing_logo = AdvisorLogo.objects.filter(fk_user=user).first()
                    if existing_logo:
                        existing_logo.logo = logo_webp
                        existing_logo.timestamp = datetime.now()
                        existing_logo.save()
                        saved_logo = existing_logo.logo
                    else:
                        new_logo = AdvisorLogo.objects.create(
                            fk_user=user, logo=logo_webp, timestamp=datetime.now()
                        )
                        saved_logo = new_logo.logo
                    logo_url = saved_logo.url
                if request.data.get("delete_logo") == "true":
                    # 🚫 Block team members from deleting
                    team_relationship = TeamReferralRelationship.objects.filter(team_user=user).first()
                    if team_relationship:
                        return Response(
                            {'message': 'Team members do not have permission to delete logo'},
                            status=status.HTTP_403_FORBIDDEN
                        )
                    # 1️⃣ Check if user is Admin
                    admin_user = AdminAdvisor.objects.filter(fk_user=user).first()

                    if admin_user:
                        # Delete admin logo
                        if admin_user.logo:
                                admin_user.logo.delete(save=False)  # delete file from storage
                                admin_user.logo = None
                                admin_user.save()

                    else:
                        # 2️⃣ Not admin → delete normal advisor logo
                        existing_logo = AdvisorLogo.objects.filter(fk_user=user).first()
                        if existing_logo:
                                existing_logo.logo.delete(save=False)
                                existing_logo.delete()

                # welcome message
                wlcm_heading = request.data.get("wlcm_heading")
                wlcm_subheading = request.data.get("wlcm_subheading")
                if wlcm_heading or wlcm_subheading:
                    user.wlcm_message = {
                        "heading": wlcm_heading or "",
                        "subheading": wlcm_subheading or ""
                    }

                if "new_username" in request.data:
                    new_username = request.data["new_username"].strip()
                    if new_username != user.username:
                        # Check if new username is already taken
                        if User.objects.filter(username=new_username).exists():
                            return Response(
                                {"message": "Username already taken. Please choose a different username."},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                        user.username = new_username

                # social media
                user.instagram = request.data.get('instagram', user.instagram)
                user.facebook = request.data.get('facebook', user.facebook)
                user.linkedin = request.data.get('linkedin', user.linkedin)
                user.twitter = request.data.get('twitter', user.twitter)
                user.tiktok = request.data.get('tiktok', user.tiktok)
                user.youtube = request.data.get('youtube', user.youtube)

                user.save()
                name_parts = (user.name or "").strip().split(" ")
                first_name = name_parts[0] if name_parts else ""
                last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

                # ✅ Send full structured response
                user_data = {
                    "id": user.id,
                    "firstName":first_name,
                    "lastName":last_name,
                    "name": user.name,
                    "username": user.username,
                    "displayPic": user.profile_picture.url if user.profile_picture else "https://storage.googleapis.com/nsg-crm-storage-public/media/webp_images/Left_grey_png.webp",
                    "logo": get_final_logo(user),
                    "about": user.about,
                    "instagram": user.instagram,
                    "facebook": user.facebook,
                    "linkedin": user.linkedin,
                    "twitter": user.twitter,
                    "tiktok": user.tiktok,
                    "youtube": user.youtube,
                    "company": user.company,
                    "designation": user.designation,
                    "cardName": "Main Profile",  # if exists
                    "backgroundColor": user.background_colour,
                    "wlcm_message": user.wlcm_message,
                    "scheduling": getattr(user, "scheduling", False),
                    "is_review": getattr(user, "is_review", False),
                    "is_google_meet": getattr(user, "google_meet", False),
                }

                return Response(user_data, status=status.HTTP_202_ACCEPTED)

            else:
                profile = Profiles.objects.filter(username=username).first()
                if not profile:
                    return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
                # Update fields
                profile.name = request.data.get('name', profile.name)
                profile.about = request.data.get('about', profile.about)
                profile.instagram = request.data.get('instagram', profile.instagram)
                profile.facebook = request.data.get('facebook', profile.facebook)
                profile.linkedin = request.data.get('linkedin', profile.linkedin)
                profile.twitter = request.data.get('twitter', profile.twitter)
                profile.tiktok = request.data.get('tiktok', profile.tiktok)
                profile.youtube = request.data.get('youtube', profile.youtube)
                profile.company = request.data.get('company', profile.company)
                profile.designation = request.data.get('designation', profile.designation)

                # Welcome message for profile
                wlcm_heading = request.data.get("wlcm_heading")
                wlcm_subheading = request.data.get("wlcm_subheading")
                if wlcm_heading or wlcm_subheading:
                    profile.wlcm_message = {
                        "heading": wlcm_heading or "",
                        "subheading": wlcm_subheading or ""
                    }
                #update profile picture
                if "profile_picture" in request.FILES:
                    # If React sends it as a real file
                    profile_picture = request.FILES["profile_picture"]
                    profile_picture = image_compressor(profile_picture, profile)
                    profile.profile_picture = profile_picture
                try:
                    logo = AdvisorProfileLogo.objects.filter(fk_profile=profile).first()
                    logo_url = logo.logo.url
                except:
                    logo_url=None
                if "logo" in request.FILES:
                    logo = request.FILES['logo']
                    logo_webp = image_compressor(logo,profile)
                    # Check if AdvisorProfileLogo already exists
                    existing_logo = AdvisorProfileLogo.objects.filter(fk_profile=profile).first()
                    if existing_logo:
                        existing_logo.logo=logo_webp
                        existing_logo.save()
                        saved_logo = existing_logo.logo
                    else:
                        new_logo=AdvisorProfileLogo.objects.create(fk_profile=profile, logo=logo_webp, timestamp=datetime.now())
                        saved_logo = new_logo.logo
                    logo_url = saved_logo.url

                if request.data.get("delete_logo") == "true":
                    existing_logo = AdvisorProfileLogo.objects.filter(fk_profile=profile).first()
                    if existing_logo:
                        existing_logo.logo.delete(save=False)
                        existing_logo.delete()

                card_name = request.data.get('card_name')
                if card_name:
                    profile.card_name = card_name

                background_colour = request.data.get('background_colour')
                if background_colour:
                    profile.background_colour = background_colour
                background_pattern = request.data.get('background_pattern')
                if background_pattern:
                    profile.background_pattern = background_pattern
                background_pattern_profile = request.data.get('background_pattern_profile')
                if background_pattern_profile:
                    profile.background_pattern_profile = background_pattern_profile

                if "new_username" in request.data:
                    new_username = request.data["new_username"].strip()
                    if new_username != profile.username:
                        # Check if new username is already taken
                        if Profiles.objects.filter(username=new_username).exists() or User.objects.filter(username=new_username).exists():
                            return Response(
                                {"message": "Username already taken. Please choose a different username."},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                        profile.username = new_username
                if "card_name" in request.data:
                    profile.card_name = request.data["card_name"]
                # Save the updated profile
                profile.save()
                name_parts = (profile.name or "").strip().split(" ")
                first_name = name_parts[0] if name_parts else ""
                last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""
                user_data = {
                    "id": profile.id,
                    "firstName":first_name,
                    "lastName":last_name,
                    "name": profile.name,
                    "username": profile.username,
                    "displayPic": profile.profile_picture.url if profile.profile_picture else None,
                    "logo": get_final_logo(user, profile),
                    "about": profile.about,
                    "instagram": profile.instagram,
                    "facebook": profile.facebook,
                    "linkedin": profile.linkedin,
                    "twitter": profile.twitter,
                    "tiktok": profile.tiktok,
                    "youtube": profile.youtube,
                    "company": profile.company,
                    "designation": profile.designation,
                    "cardName": profile.card_name,
                    "backgroundColor": profile.background_colour,
                    "wlcm_message": profile.wlcm_message,

                }
                return Response(user_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(methods=["POST"], detail=False)
    def get_all_profiles(self, request):
        try:
            user = get_user_from_token(request)
            if not user:
                return Response({"message": "Invalid user token"}, status=status.HTTP_401_UNAUTHORIZED)

            profile_data = []

            # -------- SAFE PROFILE PICTURE --------
            profile_picture = (
                user.profile_picture.url
                if user.profile_picture and user.profile_picture.name
                else "https://storage.googleapis.com/nsg-crm-storage-public/media/webp_images/Left_grey_png.webp"
            )

            # Defaults
            background_colour = user.background_colour
            logo_admin_url = None
            is_team_member = False

            # -------- TEAM / ADMIN LOOKUP --------
            team_relationship = TeamReferralRelationship.objects.filter(team_user=user).first()
            if team_relationship:
                is_team_member = True
                admin_user = AdminAdvisor.objects.filter(fk_user=team_relationship.admin_user).first()
            else:
                admin_user = AdminAdvisor.objects.filter(fk_user=user).first()

            # -------- SAFE ADMIN LOGO --------
            if admin_user:
                if getattr(admin_user, "color", None):
                    background_colour = admin_user.color

                if getattr(admin_user, "logo", None):
                    if admin_user.logo and admin_user.logo.name:
                        logo_admin_url = admin_user.logo.url

            # -------- SAFE USER LOGO --------
            logo = AdvisorLogo.objects.filter(fk_user=user).first()

            if logo and getattr(logo, "logo", None) and logo.logo.name:
                logo_url = logo.logo.url
            else:
                logo_url = logo_admin_url

            # -------- PLAN TYPE --------
            if user.fk_package_id in [4, 6]:
                plan_type = "Pro"
            elif user.account_status == 0:
                plan_type = "Free"
            else:
                plan_type = "Pro"
                if NSGSmartCard.objects.filter(fk_user=user, has_smart_card=True).exists():
                    plan_type += " + Smart Business Card"

            # -------- MAIN PROFILE --------
            default_profile = {
                "profile_type": "default",
                "user_id": user.id,
                "email": user.email,
                "name": user.name,
                "username": user.username,
                "phone": user.phone,
                "about": user.about,
                "profile_picture": profile_picture,
                "meet_url": user.meet_url,
                "company": user.company,
                "background_pattern": user.background_pattern,
                "background_pattern_profile": user.background_pattern_profile,
                "scheduling": user.scheduling,
                "is_review": user.is_review,
                "background_colour": background_colour,
                "payment_status": user.payment_status,
                "account_status": plan_type,
                "is_team_member": is_team_member,
                "Designation": user.designation,
                "is_team_admin": user.is_team_admin,
                "wlcm_message": user.wlcm_message,
                "youtube": user.youtube,
                "tiktok": user.tiktok,
                "twitter": user.twitter,
                "linkedin": user.linkedin,
                "facebook": user.facebook,
                "instagram": user.instagram,
                "logo": logo_url,
                "card_name": "Main Profile",
                "is_service": user.is_service,
                "is_video": user.is_feature_video,
                "is_feature_images": user.is_feature_images,
                "is_links": user.is_links,
                "is_reviews": user.is_review,
            }
            profile_data.append(default_profile)

            # -------- ADDITIONAL PROFILES --------
            profiles = Profiles.objects.filter(fk_user=user)

            for profile in profiles:

                # -------- SAFE PROFILE LOGO --------
                logo_url = None
                profile_logo = AdvisorProfileLogo.objects.filter(fk_profile=profile).first()

                if profile_logo and getattr(profile_logo, "logo", None) and profile_logo.logo.name:
                    logo_url = request.build_absolute_uri(profile_logo.logo.url)

                # -------- OVERRIDE WITH ADMIN LOGO IF EXISTS --------
                profile_bg_colour = profile.background_colour
                is_team_member = False

                team_relationship = TeamReferralRelationship.objects.filter(team_user=profile.fk_user).first()
                if team_relationship:
                    is_team_member = True
                    admin_user = AdminAdvisor.objects.filter(fk_user=team_relationship.admin_user).first()
                else:
                    admin_user = AdminAdvisor.objects.filter(fk_user=user).first()

                if admin_user:
                    if getattr(admin_user, "color", None):
                        profile_bg_colour = admin_user.color

                    if getattr(admin_user, "logo", None) and admin_user.logo.name:
                        logo_url = admin_user.logo.url

                # -------- PROFILE DATA --------
                profile_info = {
                    "id": profile.id,
                    "name": profile.name,
                    "username": profile.username,
                    "profile_picture": (
                        profile.profile_picture.url
                        if profile.profile_picture and profile.profile_picture.name
                        else "https://storage.googleapis.com/nsg-crm-storage-public/media/webp_images/Left_grey_png.webp"
                    ),
                    "about": profile.about,
                    "instagram": profile.instagram,
                    "facebook": profile.facebook,
                    "linkedin": profile.linkedin,
                    "twitter": profile.twitter,
                    "tiktok": profile.tiktok,
                    "youtube": profile.youtube,
                    "company": profile.company,
                    "designation": profile.designation,
                    "logo": logo_url,
                    "card_name": profile.card_name,
                    "background_colour": profile_bg_colour,
                    "wlcm_message": profile.wlcm_message,
                    "is_review": profile.is_review,
                    "is_service": profile.is_service,
                    "is_video": profile.is_feature_video,
                    "is_feature_images": profile.is_feature_images,
                    "is_links": profile.is_links,
                }
                profile_data.append(profile_info)

            return Response(profile_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def add_link(self, request):
        try:
            user = get_user_from_token(request)
            if not user:
                return Response({"Not authorized"}, status=status.HTTP_401_UNAUTHORIZED)
            username = request.data.get("username")  # username can be default user or profile
            link = request.data.get("link")
            title = request.data.get("title")
            description = request.data.get("description")
            if not username:
                return Response({"message": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
            try:
                validate_https_url(link)
            except ValidationError:
                return Response({'message': 'Invalid URL format. Only https:// links allowed.'},
                                status=status.HTTP_400_BAD_REQUEST)

            # check if username belongs to User or Profile
            if username==user.username:
                link_obj = UserLink.objects.create(
                    fk_user=user,
                    link=link,
                    title=title,
                    description=description
                )
            else:
                profile = Profiles.objects.filter(username=username, fk_user=user).first()
                if not profile:
                    return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
                link_obj = UserLink.objects.create(
                    fk_profile=profile,
                    link=link,
                    title=title,
                    description=description
                )
            link_data={
                "link_id":link_obj.id,
                "username": username,
                "link": link_obj.link,
                "title": link_obj.title,
                "description": link_obj.description,
            }

            return Response({"links":link_data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def get_links(self, request):
        try:
            username = request.data.get('username')
            if not username:
                return Response({"message": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)

            # Find user/profile
            user = User.objects.filter(username=username).first()
            profile = None
            if not user:
                profile = Profiles.objects.filter(username=username).first()
                if not profile:
                    return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

            if user:
                links = UserLink.objects.filter(fk_user=user).order_by('sorting_id')
            else:
                links = UserLink.objects.filter(fk_profile=profile).order_by('sorting_id')

            link_data = [{
                "link_id": link.id,
                "link": link.link,
                "title": link.title,
                "description": link.description,
                "sorting_id": link.sorting_id
            } for link in links]

            return Response(data={"links": link_data})
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    

    @action(methods=["POST"], detail=False)
    def update_link(self, request):
        try:
            user = get_user_from_token(request)
            username = request.data.get("username")
            link_id = request.data.get("link_id")

            if not username:
                return Response({"message": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)

            if not link_id:
                return Response({"message": "link_id is required"}, status=status.HTTP_400_BAD_REQUEST)

            # Identify user or profile target
            target_user = None
            target_profile = None

            if user and user.username == username:
                target_user = user
            else:
                target_profile = Profiles.objects.filter(username=username).first()
                if not target_profile:
                    return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

            # Find link object
            if target_user:
                link_obj = UserLink.objects.filter(fk_user=target_user, id=link_id).first()
            else:
                link_obj = UserLink.objects.filter(fk_profile=target_profile, id=link_id).first()

            if not link_obj:
                return Response({"message": "Link not found"}, status=status.HTTP_404_NOT_FOUND)

            # Update fields if provided
            updated_fields = {}
            if "title" in request.data:
                link_obj.title = request.data["title"]
                updated_fields["name"] = link_obj.title

            if "description" in request.data:
                link_obj.description = request.data["description"]
                updated_fields["description"] = link_obj.description

            if "link" in request.data:
                link_obj.link = request.data["link"]
                updated_fields["link"] = link_obj.link

            # Optional: handle image update
            if "img" in request.FILES:
                img = request.FILES["img"]
                link_obj.img = img
                updated_fields["img"] = link_obj.img.url if link_obj.img else None

            link_obj.save()

            updated_fields["link_id"] = link_obj.id
            updated_fields["sorting_id"] = link_obj.sorting_id

            return Response(updated_fields, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)


    @action(methods=["POST"], detail=False)
    def delete_link(self, request):
        try:
            user = get_user_from_token(request)
            username = request.data.get("username")
            link_id = request.data.get("link_id")

            if not username or not link_id:
                return Response({"message": "Username and link_id are required"}, status=status.HTTP_400_BAD_REQUEST)

            if username == user.username:
                link = UserLink.objects.get(id=link_id, fk_user=user)
            else:
                profile = Profiles.objects.filter(username=username, fk_user=user).first()
                if not profile:
                    return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
                link = UserLink.objects.get(id=link_id, fk_profile=profile)

            link.delete()
            return Response({"message": "Link deleted successfully"}, status=status.HTTP_200_OK)

        except UserLink.DoesNotExist:
            return Response({"message": "Link not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(methods=["POST"], detail=False)
    def sort_links(self, request):
        try:
            user = get_user_from_token(request)
            username = request.data.get("username")
            link_id = request.data.get("link_id")
            new_sorting_id = request.data.get("new_sorting_id")

            if not username or not link_id or new_sorting_id is None:
                return Response({"message": "username, link_id, and new_sorting_id are required"}, status=status.HTTP_400_BAD_REQUEST)

            # Find user/profile
            if username == user.username:
                link = UserLink.objects.filter(id=link_id, fk_user=user).first()
                links_qs = UserLink.objects.filter(fk_user=user)
            else:
                profile = Profiles.objects.filter(username=username, fk_user=user).first()
                if not profile:
                    return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
                link = UserLink.objects.filter(id=link_id, fk_profile=profile).first()
                links_qs = UserLink.objects.filter(fk_profile=profile)

            if not link:
                return Response({"message": "Link not found"}, status=status.HTTP_404_NOT_FOUND)

            old_sorting_id = link.sorting_id
            new_sorting_id = int(new_sorting_id)

            # Find the link currently at the new_sorting_id
            swap_link = links_qs.filter(sorting_id=new_sorting_id).first()
            if swap_link:
                swap_link.sorting_id = old_sorting_id
                swap_link.save()

            link.sorting_id = new_sorting_id
            link.save()

            return Response({link.sorting_id}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def update_profile_settings(self, request):
        try:
            user = get_user_from_token(request)
            username = request.data.get("username")
            if "is_links" in request.data:
                is_links = request.data.get("is_links")
            if "is_service" in request.data:
                is_service = request.data.get("is_service")
            if "is_video" in request.data:
                is_video = request.data.get("is_video")
            if "is_feature_images" in request.data:
                is_feature_images = request.data.get("is_feature_images")
            if "is_reviews" in request.data:
                is_reviews= request.data.get("is_reviews")
            
            if not username:
                return Response({"message": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)

            # Identify user or profile target
            target_user = None
            target_profile = None
            updated_fields = {}

            if user and user.username == username:
                target_user = user
            else:
                target_profile = Profiles.objects.filter(username=username).first()
                if not target_profile:
                    return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

            # Update show_in_preview field
            if target_user:
                target_user.is_links = is_links if 'is_links' in request.data else target_user.is_links
                target_user.is_service = is_service if 'is_service' in request.data else target_user.is_service
                target_user.is_feature_video = is_video if 'is_video' in request.data else target_user.is_feature_video
                target_user.is_feature_images = is_feature_images if 'is_feature_images' in request.data else target_user.is_feature_images
                target_user.is_review = is_reviews if 'is_reviews' in request.data else target_user.is_review
                target_user.save()
                updated_fields = {
                    "is_links": target_user.is_links,
                    "is_service": target_user.is_service,
                    "is_feature_video": target_user.is_feature_video,
                    "is_feature_images": target_user.is_feature_images,
                    "is_review": target_user.is_review,
                }

            else:
                target_profile.is_links = is_links if 'is_links' in request.data else target_profile.is_links
                target_profile.is_service = is_service if 'is_service' in request.data else target_profile.is_service
                target_profile.is_feature_video = is_video if 'is_video' in request.data else target_profile.is_feature_video
                target_profile.is_feature_images = is_feature_images if 'is_feature_images' in request.data else target_profile.is_feature_images
                target_profile.is_review = is_reviews if 'is_reviews' in request.data else target_profile.is_review
                target_profile.save()
                updated_fields = {
                    "is_links": target_profile.is_links,
                    "is_service": target_profile.is_service,
                    "is_feature_video": target_profile.is_feature_video,
                    "is_feature_images": target_profile.is_feature_images,
                    "is_review": target_profile.is_review,
                }

            return Response(updated_fields, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["DELETE"], detail=False)
    def delete_profile(self, request):
        try:
            user = get_user_from_token(request)
            if user is None:
                return Response(
                    {"message": "User not found"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            username = request.data.get("username")

            if not username:
                return Response(
                    {"message": "Username is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            profile = Profiles.objects.filter(
                username=username,
                fk_user=user
            ).first()

            if not profile:
                return Response(
                    {"message": "Profile not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # delete related logo
            AdvisorProfileLogo.objects.filter(fk_profile=profile).delete()

            # delete contact info
            ProfileContactInfo.objects.filter(fk_profile=profile).delete()

            # delete profile
            profile.delete()

            return Response(
                {"message": "Profile deleted successfully"},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"message": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )



