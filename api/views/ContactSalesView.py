from django.core.validators import validate_email, RegexValidator
from django.core.exceptions import ValidationError
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from api.views.Services import get_user_from_token, validate_phone, notify_team_about_new_lead
from api.serializers import ContactSalesSerializer
from api.models import ContactSales
from django.db.models import Q


class ContactSalesView(viewsets.GenericViewSet):

    @action(methods=['POST'], detail=False)
    def get_contact_sales(self, request):
        try:
            user = get_user_from_token(request)
            if not user.is_superuser:
                return Response({'message': 'Dont have access'},
                                status=status.HTTP_401_UNAUTHORIZED)

            search_query = request.data.get('search', '').strip()

            contact_sales_qs = ContactSales.objects.all()

            if search_query:
                contact_sales_qs = contact_sales_qs.filter(
                    Q(first_name__icontains=search_query) |
                    Q(last_name__icontains=search_query) |
                    Q(email__icontains=search_query)
                )

            contact_sales_qs = contact_sales_qs.order_by('-contact_sales_id')
            serializer = ContactSalesSerializer(contact_sales_qs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['POST'], detail=False)
    def create_sales_contact(self, request):
        try:
            first_name = request.data.get('first_name', "")
            email = request.data['email'].strip()
            phone = request.data.get('phone', "")
            message = request.data.get('message', "")
            last_name = request.data.get('last_name', "")
            try:
                validate_email(email)
            except ValidationError:
                return Response({'message': 'Invalid email format'},
                                status=status.HTTP_400_BAD_REQUEST)
            try:
                phone = validate_phone(phone)
            except ValidationError as e:
                return Response({'message': e.message},
                                status=status.HTTP_400_BAD_REQUEST)
            contact_sale = ContactSales.objects.create(first_name=first_name, last_name=last_name, email=email,
                                                       phone=phone, message=message)

            # Send notification to internal team
            notify_team_about_new_lead({
                'first_name': first_name,
                'last_name': last_name,
                'phone': phone,
                'contact_sales_id': contact_sale.contact_sales_id,
                'email': email,
                'message': message
            })
            data = {'first_name': first_name, 'last_name': last_name, 'phone': phone,
                    'contact_sales_id': contact_sale.contact_sales_id, 'email': email,
                    'message': message}
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def delete_sales_contact(self, request):
        try:
            user = get_user_from_token(request)
            if not user.is_superuser:
                return Response({'message': 'Dont have access'},
                                status=status.HTTP_401_UNAUTHORIZED)

            contact_sales_id = request.data['contact_sales_id']
            id_validator = RegexValidator(
                regex=r'^\d{1,6}$',
                message='Invalid Id format.'
            )
            try:
                id_validator(contact_sales_id)
            except ValidationError:
                return Response({'message': 'Invalid Id format'},
                                status=status.HTTP_400_BAD_REQUEST)

            contact_sale = ContactSales.objects.filter(contact_sales_id=contact_sales_id).first()
            if not contact_sale:
                return Response({'message': 'Contact not found'}, status=status.HTTP_404_NOT_FOUND)

            contact_sale.delete()
            return Response({"message": "contact deleted"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
