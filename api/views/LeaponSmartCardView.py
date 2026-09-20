from datetime import timedelta, datetime

from django.utils import timezone
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.decorators import action

from api.models import SmartCardIntent, AdvisorLogo
from api.models.AdvisorLogo import AdvisorLogo

from api.models.SmartCard import SmartCard, NSGSmartCard
from api.views.Services import get_user_from_token, webp_convertor


class NSGSmartCardView(viewsets.GenericViewSet):

    @action(methods=['POST'], detail=False)
    def card_purchase_status(self, request):
        user = get_user_from_token(request)
        has_smart_card = request.data.get("has_smart_card")

        # Convert string values ("true" or "false") to boolean
        if isinstance(has_smart_card, str):
            has_smart_card = has_smart_card.lower() == "true"

        if not isinstance(has_smart_card, bool):  # Ensure it's a boolean
            return Response({"error": "Invalid value for has_smart_card"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            smart_card, created = NSGSmartCard.objects.get_or_create(fk_user=user)
            smart_card.has_smart_card = has_smart_card
            smart_card.save()

            return Response({
                "message": "Updated successfully" if not created else "Created successfully",
                "has_smart_card": smart_card.has_smart_card
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=["POST"], detail=False)
    def save_smart_card(self, request):
        email = request.data.get("email")
        designation = request.data.get("designation")
        card_type = request.data.get("card_type")
        logo = request.FILES['logo'] if 'logo' in request.FILES else None

        try:
            intent = SmartCardIntent.objects.create(
                email=email,
                designation=designation,
                card_type=card_type,
                logo=webp_convertor(logo) if logo else None,
                expires_at=timezone.now() + timedelta(hours=24)
            )

            data = {
                "email": intent.email,
                "designation": intent.designation,
                "card_type": intent.card_type,
                "logo": intent.logo.url if intent.logo else None,
            }

            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def update_smart_card(self, request):
        email = request.data.get("email")
        user_id = request.data.get("user_id")

        try:
            intent = SmartCardIntent.objects.filter(email=email).first()
            logo = None
            if intent.logo:
                logo = AdvisorLogo.objects.create(fk_user_id=user_id, logo=intent.logo, timestamp=datetime.now())
            data = {
                "email": intent.email,
                "designation": intent.designation,
                "card_type": intent.card_type,
                "logo": logo.logo.url if intent.logo else None,
            }

            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Backward-compatible and clean aliases
SmartCardView = NSGSmartCardView
LeaponSmartCardView = NSGSmartCardView
