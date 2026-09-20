from api.views.Services import get_user_from_token, validate_username, image_compressor
from django.core.exceptions import ValidationError
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from api.models import *


class ProfileGalleryView(viewsets.GenericViewSet):
    """     serializer_class = AdvisorGallerySerializer
    queryset = AdvisorGallery.objects.all() """

    @action(methods=["POST"], detail=False)
    def get_gallery(self, request):
        try:
            is_profile = False
            profile = None
    
            username = request.data.get('username')

            try:
                    validate_username(username)
            except ValidationError as e:
                    return Response({'message': str(e)},
                                    status=status.HTTP_400_BAD_REQUEST)
                    # first check if this is default profile or not
            user = User.objects.filter(username=username).first()
            if not user:
                    profile = Profiles.objects.filter(username=username).first()
                    if not profile:
                        return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
                    user = profile.fk_user
                    is_profile = True
            username = request.data.get('username')
            if user.username != username:
                is_profile = True
                profile = Profiles.objects.filter(username=username).first()
                if not profile:
                    return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

            data = []
            if is_profile:
                gallery = ProfilesGallery.objects.filter(fk_profile=profile)
                for member in gallery:
                    data += [{
                        "id":member.id,
                        "profile_picture": member.pictures.url,
                    }]
            else:
                gallery = AdvisorGallery.objects.filter(fk_user_id=user.id)
                for member in gallery:
                    data += [{
                        "id": member. gallery_id, 
                        "profile_picture": member.pictures.url,
                    }]
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)


    @action(methods=["POST"], detail=False)
    def create_update_gallery(self, request):
        try:
            user = get_user_from_token(request)
            if not user:
                return Response("Not authorized", status=status.HTTP_401_UNAUTHORIZED)

            username = request.data.get("username")
            picture_file = request.data.get("picture")
            picture_id = request.data.get("gallery_id")    # <-- FIXED
            
            if not picture_file:
                return Response({"message": "No picture uploaded"}, status=400)

            picture = image_compressor(picture_file, user)

            # ---------------------------------------------------
            # Case 1: Upload for own profile
            # ---------------------------------------------------
            if username == user.username:

                # If picture_id exists → update
                if picture_id:
                    try:
                        gallery = AdvisorGallery.objects.get(gallery_id=picture_id, fk_user_id=user.id)
                        gallery.pictures = picture
                        gallery.save()

                    except AdvisorGallery.DoesNotExist:
                        return Response({"message": "Image not found"}, status=404)

                else:
                    # Create new image
                    gallery = AdvisorGallery.objects.create(
                        pictures=picture,
                        fk_user_id=user.id
                    )

                return Response({
                    "id": gallery.gallery_id,
                    "picture": gallery.pictures.url
                }, status=200)

            # ---------------------------------------------------
            # Case 2: Upload for other profile page
            # ---------------------------------------------------
            profile = Profiles.objects.filter(username=username).first()
            if not profile:
                return Response({"message": "Profile not found"}, status=404)

            if picture_id:
                try:
                    gallery = ProfilesGallery.objects.get(id=picture_id, fk_profile=profile)
                    gallery.pictures = picture
                    gallery.save()

                except ProfilesGallery.DoesNotExist:
                    return Response({"message": "Image not found"}, status=404)

            else:
                gallery = ProfilesGallery.objects.create(
                    pictures=picture,
                    fk_profile=profile
                )

            return Response({
                "id": gallery.id,
                "picture": gallery.pictures.url
            }, status=200)

        except Exception as e:
            return Response({"message": str(e)}, status=400)


    @action(methods=["POST"], detail=False)
    def delete_gallery(self, request):  
        try:
            user = get_user_from_token(request)
            if not user:
                return Response("Not authorized",status=status.HTTP_401_UNAUTHORIZED)
            username = request.data["username"]
            gallery_id = request.data.get("gallery_id")
            if not gallery_id:
                return Response({'message': 'Gallery ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            if username==user.username:
                gallery_entry = AdvisorGallery.objects.filter(fk_user_id=user.id, gallery_id=gallery_id).first()
                if not gallery_entry:
                    return Response({'message': 'Gallery entry not found'}, status=status.HTTP_404_NOT_FOUND)

                gallery_entry.delete()
            else:
                profile = Profiles.objects.filter(username=username).first()
                if not profile:
                    return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
                gallery_entry = ProfilesGallery.objects.filter(fk_profile=profile, id=gallery_id).first()
                if not gallery_entry:
                    return Response({'message': 'Gallery entry not found'}, status=status.HTTP_404_NOT_FOUND)

                gallery_entry.delete()

            return Response({'message': 'Gallery entry deleted successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)