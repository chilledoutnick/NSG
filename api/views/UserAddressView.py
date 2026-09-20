from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status

from advisorapp import settings
from api.models.UserAddress import UserBillingAddress, UserShippingAddress
from api.views.Services import get_user_from_token



class UserAddressView(viewsets.GenericViewSet):
    @action(methods=['POST'], detail=False)
    def save_billing_address(self, request):
        user_id = request.data.get("fk_user")

        if not user_id:
            user = get_user_from_token(request)
            if not user:
                return Response({"error": "Invalid token or user not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
            user_id = user.id  

        try:
            address = UserBillingAddress.objects.get(fk_user=user_id)
            for key, value in request.data.items():
                setattr(address, key, value)  
            address.save()
            return Response({"message": "Billing address updated successfully"}, status=status.HTTP_200_OK)

        except UserBillingAddress.DoesNotExist:
            address = UserBillingAddress.objects.create(fk_user_id=user_id, **request.data)
            return Response({"message": "Billing address saved successfully"}, status=status.HTTP_201_CREATED)


    # ✅ Save or Update Shipping Address
    @action(methods=['POST'], detail=False)
    def save_shipping_address(self, request):
        user_id = request.data.get("fk_user")

        if not user_id:
            user = get_user_from_token(request)
            if not user:
                return Response({"error": "Invalid token or user not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
            user_id = user.id  

        try:
            address = UserShippingAddress.objects.get(fk_user=user_id)
            for key, value in request.data.items():
                setattr(address, key, value)  
            address.save()
            return Response({"message": "Shipping address updated successfully"}, status=status.HTTP_200_OK)

        except UserShippingAddress.DoesNotExist:
            address = UserShippingAddress.objects.create(fk_user_id=user_id, **request.data)
            return Response({"message": "Shipping address saved successfully"}, status=status.HTTP_201_CREATED)


    # ✅ Get Billing Address
    @action(methods=['POST'], detail=False)
    def get_billing_address(self, request):
        user_id = request.data.get("fk_user")

        if not user_id:
            user = get_user_from_token(request)
            if not user:
                return Response({"error": "Invalid token or user not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
            user_id = user.id  

        try:
            address = UserBillingAddress.objects.get(fk_user=user_id)
            return Response({
                "fk_user": address.fk_user_id,
                "name": address.name,
                "email": address.email,
                "phoneno": address.phoneno,
                "billing_zip": address.billing_zip,
                "billing_country": address.billing_country,
                "created_at": address.created_at.strftime("%Y-%m-%d %H:%M:%S")
            }, status=status.HTTP_200_OK)

        except UserBillingAddress.DoesNotExist:
            return Response({"error": "Billing address not found"}, status=status.HTTP_404_NOT_FOUND)


    # ✅ Get Shipping Address
    @action(methods=['POST'], detail=False)
    def get_shipping_address(self, request):
        user_id = request.data.get("fk_user")

        if not user_id:
            user = get_user_from_token(request)
            if not user:
                return Response({"error": "Invalid token or user not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
            user_id = user.id  

        try:
            address = UserShippingAddress.objects.get(fk_user=user_id)
            return Response({
                "fk_user": address.fk_user_id,
                "name": address.name,
                "email": address.email,
                "phoneno": address.phoneno,
                "apartment_details": address.apartment_details,
                "area_details": address.area_details,
                "province": address.province,
                "shipping_zip": address.shipping_zip,
                "shipping_country": address.shipping_country,
                "created_at": address.created_at.strftime("%Y-%m-%d %H:%M:%S")
            }, status=status.HTTP_200_OK)

        except UserShippingAddress.DoesNotExist:
            return Response({"error": "Shipping address not found"}, status=status.HTTP_404_NOT_FOUND)