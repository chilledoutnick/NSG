from api.views.Services import get_user_from_token, validate_username, image_compressor
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from api.models import *


class TeamGalleryView(viewsets.GenericViewSet):


    @action(methods=["POST"], detail=False)
    def get_tm_photo(self, request):
        try:
            try:
                user = get_user_from_token(request)
                username = user.username
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
            team_gallery = TeamGallery.objects.filter(fk_user_id=user.id)
            for member in team_gallery:
                data += [{
                    "team_gallery_id": member.team_gallery_id,
                    "profile_picture": member.profile_picture.url,
                    "name": member.name,
                    "joined_date": member.joined_date,
                    "ratings": member.ratings,
                    "story": member.story,
                    "heading": member.heading
                }]
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def create_tm(self, request):
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
            if "profile_picture" in request.data:
                user.tm_photo = True
                user.save()
            name = request.data['name']
            joined_date = request.data['joined_date']
            ratings = request.data.get('ratings', 0)
            story = request.data.get('story', "")
            heading = request.data.get('heading', "")
            date_validator = RegexValidator(
                regex=r'^\d{4}\-\d{2}\-\d{2}$',
                message='Invalid Date format. It should be YYYY-MM-DD'
            )
            try:
                date_validator(joined_date)
            except ValidationError:
                return Response({'message': 'Invalid Date format. It should be YYYY-MM-DD'},
                                status=status.HTTP_400_BAD_REQUEST)
            ratings_validator = RegexValidator(
                regex=r'^(10(\.0)?|[0-9](\.[0-9])?)$',
                message='Invalid Date format. It should be YYYY-MM-DD'
            )
            try:
                ratings_validator(ratings)
            except ValidationError:
                return Response({'message': 'Invalid ratings format. It should be between 0 to 10'},
                                status=status.HTTP_400_BAD_REQUEST)
            if user.tm_photo:
                team_gallery = TeamGallery.objects.create(
                    # profile_picture=profile_picture,
                    fk_user_id=user.id,
                    name=name,
                    joined_date=joined_date,
                    ratings=ratings,
                    story=story,
                    heading=heading
                )
                profile_picture = request.FILES['profile_picture']
                profile_picture_file = image_compressor(profile_picture, user)
                team_gallery.profile_picture.save(profile_picture_file.name, profile_picture_file)
                # updated_fields['logo'] = user.profile_picture.url
                return Response({"team_gallery_id": team_gallery.team_gallery_id,
                                 "profile_picture": team_gallery.profile_picture.url,
                                 "name": team_gallery.name,
                                 "joined_date": team_gallery.joined_date,
                                 "team_photo": user.tm_photo,
                                 "ratings": team_gallery.ratings,
                                 "story": team_gallery.story,
                                 "heading": team_gallery.heading}, status=status.HTTP_200_OK)
            else:
                return Response({"team_photo": user.tm_photo}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def update_tm(self, request):
        try:
            user = get_user_from_token(request)
            username = user.username
            try:
                validate_username(username)
            except ValidationError as e:
                return Response({'message': str(e)},
                                status=status.HTTP_400_BAD_REQUEST)
            user = User.objects.filter(username=username).first()
            updated_field = {}
            team_gallery_id = request.data["team_gallery_id"]
            id_validator = RegexValidator(
                regex=r'^\d{1,6}$',
                message='Invalid Id format.'
            )
            try:
                id_validator(team_gallery_id)
            except ValidationError:
                return Response({'message': 'Invalid Id format'},
                                status=status.HTTP_400_BAD_REQUEST)
            try:
                team_gallery = TeamGallery.objects.filter(team_gallery_id=team_gallery_id).first()
            except KeyError:
                return Response({"message": "Incorrect Data"}, status=status.HTTP_400_BAD_REQUEST)
            if "profile_picture" in request.data:
                profile_picture = request.data["profile_picture"]
                profile_picture_file = image_compressor(profile_picture, user)
                team_gallery.profile_picture = profile_picture_file
                team_gallery.save()
                updated_field['profile_picture'] = team_gallery.profile_picture.url
            if "name" in request.data:
                team_gallery.name = request.data["name"]
                updated_field['name'] = team_gallery.name
            if "joined_date" in request.data:
                team_gallery.joined_date = request.data["joined_date"]
                date_validator = RegexValidator(
                    regex=r'^\d{4}\-\d{2}\-\d{2}$',
                    message='Invalid Date format. It should be YYYY-MM-DD'
                )
                try:
                    date_validator(team_gallery.joined_date)
                except ValidationError:
                    return Response({'message': 'Invalid Date format. It should be YYYY-MM-DD'},
                                    status=status.HTTP_400_BAD_REQUEST)
                updated_field['joined_date'] = team_gallery.joined_date
            if "story" in request.data:
                team_gallery.story = request.data["story"]
                updated_field['story'] = team_gallery.story
            if "heading" in request.data:
                team_gallery.heading = request.data["heading"]
                updated_field['heading'] = team_gallery.heading
            if "ratings" in request.data:
                team_gallery.ratings = request.data["ratings"]
                ratings_validator = RegexValidator(
                    regex=r'^(10(\.0)?|[0-9](\.[0-9])?)$',
                    message='Invalid Date format. It should be YYYY-MM-DD'
                )
                try:
                    ratings_validator(team_gallery.ratings)
                except ValidationError:
                    return Response({'message': 'Invalid ratings format. It should be between 0 to 10'},
                                    status=status.HTTP_400_BAD_REQUEST)
                updated_field['ratings'] = team_gallery.ratings
            team_gallery.save()
            return Response({"team_gallery_id": team_gallery.team_gallery_id,
                             "name": team_gallery.name,
                             "joined_date": team_gallery.joined_date,
                             "profile_picture": team_gallery.profile_picture.url,
                             "ratings": team_gallery.ratings,
                             "story": team_gallery.story,
                             "heading": team_gallery.heading
                             }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def get_story_by_user(self, request):
        try:
            user_id = request.data['user_id']
            id_validator = RegexValidator(
                regex=r'^\d{1,6}$',
                message='Invalid Id format.'
            )
            try:
                id_validator(user_id)
            except ValidationError:
                return Response({'message': 'Invalid Id format'},
                                status=status.HTTP_400_BAD_REQUEST)
            reviews = TeamGallery.objects.filter(fk_user_id=user_id)
            data = []
            for review in reviews:
                data += [{
                    "team_gallery_id": review.team_gallery_id,
                    "name": review.name,
                    "ratings": review.ratings,
                    "story": review.story,
                    "create_date": review.joined_date,
                    "heading": review.heading
                }]
            return Response(data=data)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

    @action(methods=['POST'], detail=False)
    def delete_team_gallery(self, request):
        try:

            team_gallery_id = request.data.get('team_gallery_id')
            if not team_gallery_id:
                return Response({'message': 'team_gallery_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            team_gallery = TeamGallery.objects.filter(team_gallery_id=team_gallery_id).first()
            if not team_gallery:
                return Response({'message': 'team_gallery not found'}, status=status.HTTP_404_NOT_FOUND)
            
            team_gallery.delete()
            return Response({'message': 'team_gallery deleted successfully'}, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

