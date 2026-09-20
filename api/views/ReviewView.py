from api.views.Services import get_user_from_token, ask_for_review, send_feedback_mail
from django.core.validators import RegexValidator, validate_email
from django.core.exceptions import ValidationError
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from api.models import Review, User
import datetime
from api.models.Review import UserFeedback


class ReviewView(viewsets.GenericViewSet):

    @action(methods=['POST'], detail=False)
    def get_review_by_user(self, request):
        try:
            try:
                user = get_user_from_token(request)
                print(user.id)
            except Exception as e:
                str(e)
                user_id = request.data['user_id']

                id_validator = RegexValidator(
                    regex=r'^\d{1,6}$',
                    message='Invalid Id format.'
                )

                try:
                    id_validator(user_id)
                except ValidationError:
                    return Response({'message': 'Invalid Id format'}, status=status.HTTP_400_BAD_REQUEST)
                user = User.objects.get(id=user_id)

            reviews = Review.objects.filter(fk_user_id=user).order_by('-update_date')
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

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def ask_for_review(self, request):
        try:
            user = get_user_from_token(request)
            user_name = user.name
            username = user.username

            name = request.data.get('name')
            email = request.data.get('email').strip()

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
            user_id = request.data["user_id"]
            user = User.objects.filter(id=user_id).first()
            ratings = request.data['rating']
            name = request.data['name']
            comment = request.data['comment']
            email = request.data.get('email').strip()
            try:
                validate_email(email)
            except ValidationError:
                return Response({'message': 'Invalid email format'},
                                status=status.HTTP_400_BAD_REQUEST)
            create_date = datetime.datetime.now()
            update_date = datetime.datetime.now()
            try:
                # Save data to the database
                Review.objects.create(
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

            return Response({"message": "Review Created"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    @action(methods=["POST"], detail=False)
    def user_feedback(self, request):
        try:
            try:
                user_id = request.data.get("user_id")
                if user_id:
                    user = User.objects.filter(id=user_id).first()
                if not user:
                    return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)   
            except:
                user = get_user_from_token(request)
            create_date = datetime.datetime.now()
            emoji = request.data.get('emoji')
            comment = request.data.get('comment')
            if not emoji:
                return Response({"message": "Emoji is required"}, status=status.HTTP_400_BAD_REQUEST)
            if not comment:
                return Response({"message": "Comment is required"}, status=status.HTTP_400_BAD_REQUEST)
            try:
                # Save data to the database
                UserFeedback.objects.create(
                    emoji=emoji,
                    create_date=create_date,
                    fk_user=user,
                    comments=comment
                )
                try:
                    send_feedback_mail(emoji, comment, user)
                except Exception as e:
                    return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                return Response({"message": "Feedback Created"}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
