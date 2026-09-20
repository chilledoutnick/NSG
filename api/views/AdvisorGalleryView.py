from api.views.Services import get_user_from_token, validate_username, image_compressor
from django.core.exceptions import ValidationError
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from api.models import *


class AdvisorGalleryView(viewsets.GenericViewSet):
    """     serializer_class = AdvisorGallerySerializer
    queryset = AdvisorGallery.objects.all() """

    @action(methods=["POST"], detail=False)
    def get_gallery(self, request):
        try:
            try:
                user = get_user_from_token(request)
            except Exception as e:
                str(e)
                username = request.data["username"]
                try:
                    validate_username(username)
                except ValidationError as e:
                    return Response({'message': str(e)},
                                    status=status.HTTP_400_BAD_REQUEST)
                user = User.objects.filter(username=username).first()
            data = []
            gallery = AdvisorGallery.objects.filter(fk_user_id=user.id).order_by('column_number')
            for member in gallery:
                data += [{
                    "team_gallery_id": member.gallery_id,
                    "profile_picture": member.pictures.url,
                    "column_number": member.column_number
                }]
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def create_update_gallery(self, request):
        try:
            user = get_user_from_token(request)
            picture_file = request.data["picture"]
            picture = image_compressor(picture_file, user)
            column_number = request.data["column_number"]
            gallery = AdvisorGallery.objects.filter(fk_user_id=user.id).filter(
                column_number=column_number).first()
            if gallery is None:
                gallery = AdvisorGallery.objects.create(
                    pictures=picture,
                    column_number=column_number,
                    fk_user_id=user.id
                )
            else:
                gallery.column_number = column_number
                gallery.pictures = picture
                gallery.save()
            data = {"picture": gallery.pictures.url, "gallery_id": gallery.gallery_id}
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)


    @action(methods=["POST"], detail=False)
    def delete_gallery(self, request):  
        try:
            user = get_user_from_token(request)
            if not user:
                return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

            gallery_id = request.data.get("gallery_id")
            if not gallery_id:
                return Response({'message': 'Gallery ID is required'}, status=status.HTTP_400_BAD_REQUEST)

            gallery_entry = AdvisorGallery.objects.filter(fk_user_id=user.id, gallery_id=gallery_id).first()
            if not gallery_entry:
                return Response({'message': 'Gallery entry not found'}, status=status.HTTP_404_NOT_FOUND)

            gallery_entry.delete()

            return Response({'message': 'Gallery entry deleted successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)