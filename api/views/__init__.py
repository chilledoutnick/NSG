"""
api.views - Safe and fault-tolerant view module loader.

Safely imports CRM viewsets and endpoints so that missing third-party packages
or external service credentials never crash Django startup or route registration.
"""

import importlib
import logging
from rest_framework import viewsets, status
from rest_framework.response import Response

logger = logging.getLogger(__name__)


def _make_unavailable_viewset(view_name, exc):
    logger.warning("Optional view %s is unavailable: %s", view_name, exc)

    class _Unavailable(viewsets.GenericViewSet):
        def dispatch(self, request, *args, **kwargs):
            return Response(
                {
                    "error": f"Integration endpoint '{view_name}' is unavailable in this environment.",
                    "details": str(exc),
                    "status": "unavailable",
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

    _Unavailable.__name__ = view_name
    return _Unavailable


_VIEWS = [
    ('AdvisorAppointmentView', 'AdvisorAppointmentView'),
    ('ExchangeContactsView', 'ExchangeContactsView'),
    ('PaymentBillingView', 'PaymentBillingView'),
    ('AdvisorGalleryView', 'AdvisorGalleryView'),
    ('LeadGenerationView', 'LeadGenerationView'),
    ('StripeDetailsView', 'StripeDetailsView'),
    ('ContactSalesView', 'ContactSalesView'),
    ('PublicReviewView', 'PublicReviewView'),
    ('NoteReminderView', 'NoteReminderView'),
    ('UserProfileView', 'UserProfileView'),
    ('WorkingHourView', 'WorkingHourView'),
    ('TeamGalleryView', 'TeamGalleryView'),
    ('DigitalCardView', 'DigitalCardView'),
    ('AdvisorLogoView', 'AdvisorLogoView'),
    ('SuperAdminView', 'SuperAdminView'),
    ('TeamMemberView', 'TeamMemberView'),
    ('AddContactView', 'MailChimpView'),
    ('AdminTeamView', 'AdminTeamView'),
    ('GooglePass', 'GooglePassView'),
    ('TimelineView', 'TimelineView'),
    ('FeatureView', 'FeatureView'),
    ('PackageView', 'PackageView'),
    ('ContactView', 'ContactView'),
    ('ServiceView', 'ServiceView'),
    ('CampainView', 'CampainView'),
    ('AppleView', 'ApplePassView'),
    ('webPGallery', 'WebPGallery'),
    ('ReviewView', 'ReviewView'),
    ('ZapierView', 'ZapierView'),
    ('ReferView', 'ReferView'),
    ('UserView', 'UserView'),
    ('MetaView', 'MetaView'),
    ('OutlookView', 'OutlookView'),
    ('CalDavView', 'CalDavView'),
    ('UserAddressView', 'UserAddressView'),
    ('NSGSmartCardView', 'NSGSmartCardView'),
    ('NotificationView', 'NotificationView'),
    ('DashboardView', 'DashboardView'),
    ('DynamicDateView', 'DynamicDateView'),
    ('ProfileView', 'ProfileView'),
    ('ProfileReviewView', 'ProfileReviewView'),
    ('ProfileGalleryView', 'ProfileGalleryView'),
    ('ProfileServiceView', 'ProfileServiceView'),
    ('AgentView', 'AgentView'),
    ('ProfileLayoutViewSet', 'ProfileLayoutView'),
    ('ProfileContactInfoView', 'ProfileContactInfoView'),
    ('robots_txt', 'robots_txt'),
    ('PotentialContactView', 'PotentialContactView'),
    ('IntegrationsStatusView', 'SystemStatusView'),
]

__all__ = [class_name for class_name, _ in _VIEWS]

for class_name, module_name in _VIEWS:
    try:
        mod = importlib.import_module(f".{module_name}", package=__name__)
        cls = getattr(mod, class_name)
        globals()[class_name] = cls
    except Exception as exc:
        globals()[class_name] = _make_unavailable_viewset(class_name, exc)
