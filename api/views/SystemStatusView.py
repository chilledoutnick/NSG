from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.conf import settings


class IntegrationsStatusView(APIView):
    """
    Public endpoint exposing the operational status of optional third-party integrations.
    Allows frontend clients to conditionally hide or disable unconfigured services.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            "environment": "development" if settings.DEBUG else "production",
            "stripe": getattr(settings, "STRIPE_ENABLED", False),
            "google_oauth": getattr(settings, "GOOGLE_OAUTH_ENABLED", False),
            "google_calendar": getattr(settings, "GOOGLE_CALENDAR_ENABLED", False),
            "outlook": getattr(settings, "OUTLOOK_ENABLED", False),
            "linkedin": getattr(settings, "LINKEDIN_ENABLED", False),
            "proxycurl": getattr(settings, "PROXYCURL_ENABLED", False),
            "twilio": getattr(settings, "TWILIO_ENABLED", False),
            "mailchimp": getattr(settings, "MAILCHIMP_ENABLED", False),
            "suprsend": getattr(settings, "SUPRSEND_ENABLED", False),
            "google_wallet": getattr(settings, "GOOGLE_WALLET_ENABLED", False),
            "apple_wallet": getattr(settings, "APPLE_WALLET_ENABLED", False),
            "redis": getattr(settings, "REDIS_ENABLED", False),
            "celery": getattr(settings, "CELERY_ENABLED", False),
            "smtp": getattr(settings, "SMTP_ENABLED", False),
            "gcp_storage": getattr(settings, "GCP_STORAGE_ENABLED", False),
        })

