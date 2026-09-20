from django.core.paginator import Paginator, EmptyPage
from django.db.models import Q

from api.views.Services import send_coupon, get_user_from_token
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from api.models.Campain import Campain, Coupon
from api.serializers import CampainSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from datetime import datetime


class CampainView(viewsets.GenericViewSet):

    @action(methods=["POST"], detail=False)
    def campain_card(self, request):
        try:
            name = request.data["name"]
            company = request.data["company"]
            email_id = request.data["emailid"].strip()
            logo = request.data.get("logo")
            Campain.objects.create(
                firstname=name.split(" ")[0],
                lastname=name.split(" ")[-1],
                company=company,
                emailid=email_id,
                timestamp=datetime.now(),
                logo=logo
            )

            return Response({"message": "Data saved successfully"}, status=status.HTTP_201_CREATED)

        except KeyError as e:
            return Response({"message": f"Missing required field: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def send_coupon(self, request):
        try:
            email_id = request.data.get("emailid").strip()
            coupon_code = request.data.get("couponcode")

            try:
                validate_email(email_id)
            except ValidationError:
                return Response({'message': 'Invalid email format'}, status=status.HTTP_400_BAD_REQUEST)
            Coupon.objects.create(
                coupon_code=coupon_code,
                emailid=email_id,
                timestamp=datetime.now(),
            )
            data = {
                'couponcode': coupon_code,
                'emailid': email_id,
            }

            try:
                send_coupon(email_id, coupon_code)
                msg = "Email sent successfully"
            except Exception as e:
                msg = str(e)

            data['email_msg'] = msg
            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def get_all_campain_card(self, request):
        try:
            # Pagination & search inputs with defaults
            page = int(request.data.get('page', 1))
            page_size = int(request.data.get('page_size', 10))
            search_query = request.data.get('search', '').strip()

            # Base queryset
            queryset = Campain.objects.all()

            # Search filter
            if search_query:
                queryset = queryset.filter(
                    Q(firstname__icontains=search_query) |
                    Q(lastname__icontains=search_query) |
                    Q(emailid__icontains=search_query)
                )

            # Ordering
            queryset = queryset.order_by('-id')

            # Paginator
            paginator = Paginator(queryset, page_size)
            try:
                paginated_data = paginator.page(page)
            except EmptyPage:
                return Response({'message': 'Page out of range'}, status=status.HTTP_404_NOT_FOUND)

            # Serialization
            serializer = CampainSerializer(paginated_data, many=True)

            return Response({
                "current_page": paginated_data.number,
                "total_pages": paginator.num_pages,
                "total_items": paginator.count,
                "page_size": page_size,
                "data": serializer.data,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['POST'], detail=False)
    def delete_campain_card(self, request):
        try:
            user = get_user_from_token(request)
            if not user.is_superuser:
                return Response({'message': 'Dont have access'},
                                status=status.HTTP_401_UNAUTHORIZED)

            card_id = request.data.get('id')
            if not card_id:
                return Response({'message': 'Card ID is required'}, status=status.HTTP_400_BAD_REQUEST)

            # Assuming you have a Lead model, and you want to delete based on generation_id
            Card = Campain.objects.filter(id=card_id).first()
            if not Card:
                return Response({'message': 'Card not found'}, status=status.HTTP_404_NOT_FOUND)

            Card.delete()
            return Response({'message': 'Card deleted successfully'}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
