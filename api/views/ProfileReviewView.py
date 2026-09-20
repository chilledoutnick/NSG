from api.views.Services import get_user_from_token, ask_for_review, send_feedback_mail, validate_username
from django.core.validators import RegexValidator, validate_email
from django.core.exceptions import ValidationError
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from api.models import Review, User, Profiles, ProfilesReview
import datetime
from api.models.Review import UserFeedback


class ProfileReviewView(viewsets.GenericViewSet):

    @action(methods=['POST'], detail=False)
    def get_review_by_user(self, request):
        try:
            username = request.data.get('username')
            # first check if this is default profile or not
            user = User.objects.filter(username=username).first()
            if user:

                reviews = Review.objects.filter(fk_user=user).order_by('-update_date')
                review_data = []
                n = len(reviews)
                stars = sum(review.ratings for review in reviews)
                avg_rating = round(stars / n, 1) if n > 0 else 0
                for review in reviews:
                    review_data.append({
                        "name": review.fk_contact.name if review.fk_contact else review.name,
                        "review_id": review.review_id,
                        "ratings": review.ratings,
                        "comments": review.comments,
                        "create_date": review.create_date,
                        "update_date": review.update_date,
                    })

                return Response({'data': review_data, 'avg_rating': avg_rating})
            else:
                profile = Profiles.objects.filter(username=username).first()
                if not profile:
                    return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
                reviews = ProfilesReview.objects.filter(fk_profile=profile).order_by('-update_date')
                review_data = []
                n = len(reviews)
                stars = sum(review.ratings for review in reviews)
                avg_rating = round(stars / n, 1) if n > 0 else 0
                for review in reviews:
                    review_data.append({
                        "name": review.fk_contact.name if review.fk_contact else review.name,
                        "review_id": review.id,
                        "ratings": review.ratings,
                        "comments": review.comments,
                        "create_date": review.create_date,
                        "update_date": review.update_date,
                    })

                return Response({'data': review_data, 'avg_rating': avg_rating})


        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def ask_for_review(self, request):
        try:
            token = get_user_from_token(request)
            if not token:
                return Response({'message': 'User is not authorized'}, status=status.HTTP_401_UNAUTHORIZED)
            username = request.data.get('username')
            if not username:
                return Response({'message': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                validate_username(username)
            except ValidationError as e:
                return Response({'message': str(e)},
                                status=status.HTTP_400_BAD_REQUEST)
            try:
                user = User.objects.filter(username=username).first()
            except Exception as e:
                user = None
            name = request.data.get('name')
            email = request.data.get('email',"").strip()

            message = request.data.get('message')
            msg = "Email sent successfully"
            try:
                validate_email(email)
            except ValidationError:
                return Response({'message': 'Invalid email format'}, status=status.HTTP_400_BAD_REQUEST)
            data = {
                'name': name,
                'email': email,

            }
            if user:
                user_name = user.username
                try:
                    ask_for_review(name, email, message, user_name, username)
                except Exception as e:
                    msg = str(e)

                data['email_msg'] = msg

            else:
                profile = Profiles.objects.filter(username=username).first()
                if not profile:
                    return Response({'message': 'Profile not found for this user'}, status=status.HTTP_404_NOT_FOUND)
                username = profile.username
                user_name = profile.name
                try:
                        ask_for_review(name, email, message, user_name, username)
                except Exception as e:
                    msg = str(e)

                data['email_msg'] = msg
            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def post_review_user(self, request):
        try:
            username = request.data.get('username')
            ratings = request.data['rating']
            name = request.data['name']
            comment = request.data['comment']
            email = request.data.get('email',"").strip()
            try:
                validate_email(email)
            except ValidationError:
                return Response({'message': 'Invalid email format'},
                                status=status.HTTP_400_BAD_REQUEST)
            create_date = datetime.datetime.now()
            update_date = datetime.datetime.now()
            # first check if this is default profile or not
            user = User.objects.filter(username=username).first()
            if user:

                try:
                    # Save data to the database
                    review = Review.objects.create(
                        ratings=ratings,
                        name=name,
                        create_date=create_date,
                        update_date=update_date,
                        fk_user=user,
                        comments=comment,
                        email=email
                    )

                except Exception as e:
                    return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            else:
                profile = Profiles.objects.filter(username=username).first()
                if not profile:
                    return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

                try:
                    # Save data to the database
                    review = ProfilesReview.objects.create(
                        ratings=ratings,
                        name=name,
                        create_date=create_date,
                        update_date=update_date,
                        fk_profile=profile,
                        comments=comment,
                        email=email
                    )

                except Exception as e:
                    return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

            return Response({"message": "Profile Review Created",
                            "data":{
                "ratings": review.ratings,
                "name": review.name,
                "create_date": review.create_date,
                "update_date": review.update_date,
                "comments": review.comments,
                "email": review.email,
                "username": username
            }}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    # @action(methods=["POST"], detail=False)
    # def user_feedback(self, request):
    #     try:
    #         try:
    #             user_id = request.data.get("user_id")
    #             if user_id:
    #                 user = User.objects.filter(id=user_id).first()
    #                 if not user:
    #                     return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    #         except Exception as e:
    #             str(e)
    #             user = get_user_from_token(request)
    #         create_date = datetime.datetime.now()
    #         emoji = request.data.get('emoji')
    #         comment = request.data.get('comment')
    #         if not emoji:
    #             return Response({"message": "Emoji is required"}, status=status.HTTP_400_BAD_REQUEST)
    #         if not comment:
    #             return Response({"message": "Comment is required"}, status=status.HTTP_400_BAD_REQUEST)
    #         try:
    #             # Save data to the database
    #             UserFeedback.objects.create(
    #                 emoji=emoji,
    #                 create_date=create_date,
    #                 fk_user=user,
    #                 comments=comment
    #             )
    #             try:
    #                 send_feedback_mail(emoji, comment, user)
    #             except Exception as e:
    #                 return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    #             return Response({"message": "Feedback Created"}, status=status.HTTP_200_OK)
    #         except Exception as e:
    #             return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    #     except Exception as e:
    #         return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def update_review_user(self, request):
        try:
            review_id = request.data.get('review_id')
            username = request.data.get('username')
            ratings = request.data.get('rating')
            name = request.data.get('name')
            comment = request.data.get('comment')
            email = request.data.get('email', '').strip()

            if not review_id:
                return Response({"message": "Review ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                validate_email(email)
            except ValidationError:
                return Response({'message': 'Invalid email format'}, status=status.HTTP_400_BAD_REQUEST)

            update_date = datetime.datetime.now()

            user = User.objects.filter(username=username).first()
            if user:
                review = Review.objects.filter(id=review_id, fk_user=user).first()
                if not review:
                    return Response({"message": "User review not found"}, status=status.HTTP_404_NOT_FOUND)

                review.ratings = ratings
                review.name = name
                review.comments = comment
                review.email = email
                review.update_date = update_date
                review.save()

            else:
                profile = Profiles.objects.filter(username=username).first()
                if not profile:
                    return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

                review = ProfilesReview.objects.filter(id=review_id, fk_profile=profile).first()
                if not review:
                    return Response({"message": "Profile review not found"}, status=status.HTTP_404_NOT_FOUND)

                review.ratings = ratings
                review.name = name
                review.comments = comment
                review.email = email
                review.update_date = update_date
                review.save()

            return Response({"message": "Review updated successfully",
                             "data":{
                                 "ratings":review.ratings,
            "name": review.name,
            "create_date": review.create_date,
            "update_date": review.update_date,
            "comments": review.comments,
            "email": review.email,
            "username": username
                             }}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(methods=['POST'], detail=False)
    def delete_review(self, request):
        try:
            review_id = request.data.get('review_id')
            username = request.data.get('username')

            if not review_id:
                return Response({"message": "Review ID is required"}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.filter(username=username).first()
            if user:
                review = Review.objects.filter(review_id=review_id, fk_user=user).first()
                if not review:
                    return Response({"message": "User review not found"}, status=status.HTTP_404_NOT_FOUND)

                review.delete()

            else:
                profile = Profiles.objects.filter(username=username).first()
                if not profile:
                    return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

                review = ProfilesReview.objects.filter(id=review_id, fk_profile=profile).first()
                if not review:
                    return Response({"message": "Profile review not found"}, status=status.HTTP_404_NOT_FOUND)

                review.delete()

            return Response({"message": "Review deleted successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)