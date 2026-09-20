from django.core.exceptions import ObjectDoesNotExist
from api.models import PublicReview, User
from api.serializers import PublicReviewSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status

class PublicReviewView(viewsets.GenericViewSet):


    @action(methods=['POST'], detail=False)
    def get_public_review(self, request):
        try:
            reviews = PublicReview.objects.all().order_by('-update_date')
            n = len(reviews)
            stars = sum(review.ratings for review in reviews)
            avg_rating = round(stars / n, 1) if n > 0 else 0
            data = []
            for review in reviews:
                try:
                    user_profile = User.objects.get(email=review.email)
                    #user_profile = user_profile.objects.get(fk_user=user_profile)
                    company = user_profile.company if user_profile else ""
                    profile_picture = user_profile.profile_picture.url if user_profile.profile_picture else ""
                except ObjectDoesNotExist:
                    company = ""
                    profile_picture = "https://storage.googleapis.com/nsg-crm-storage-public/media/img/NSG/user_profile_picture.png"
                data.append({
                    'public_review_id': review.public_review_id,
                    'email': review.email,
                    'name': review.name,
                    'ratings': review.ratings,
                    'comments': review.comments,
                    'create_date': review.create_date,
                    'profile_picture': profile_picture,
                    'company': company 
                })
            final_data = {
                "reviews": data,
                "review_count": n,
                "avg_rating": avg_rating
            }
            return Response(data=final_data)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)



    @action(methods=['POST'], detail=False)
    def post_review(self, request):
        try:
           
            serializer = PublicReviewSerializer(data=request.data)  
            if serializer.is_valid():  
                serializer.save()  
                return Response(serializer.data, status=status.HTTP_201_CREATED)  
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  

        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
