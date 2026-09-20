from django.urls import path, include, re_path
from rest_framework import routers
from api import views
from django.views.generic import TemplateView

from api.views import ContactView

router = routers.DefaultRouter()
router.register(r'user_appointment', views.AdvisorAppointmentView, 'user_appointment')
router.register(r'exchange_contact', views.ExchangeContactsView, 'exchange_contact')
router.register(r'lead_generation', views.LeadGenerationView, 'lead_generation')
router.register(r'profile_gallery', views.ProfileGalleryView, 'profile_gallery')
router.register(r'profile_service', views.ProfileServiceView, 'profile_service')
router.register(r'profile_review', views.ProfileReviewView, 'profile_review')
router.register(r'user_gallery', views.AdvisorGalleryView, 'user_gallery')
router.register(r'contact_sales', views.ContactSalesView, 'contact_sales')
router.register(r'public_review', views.PublicReviewView, 'public_review')
router.register(r'note_reminder', views.NoteReminderView,'note_reminder')
router.register(r'notification', views.NotificationView, 'notification')
router.register(r'digital_card', views.DigitalCardView, 'digital_card')
router.register(r'user_profile', views.UserProfileView, 'user_profile')
router.register(r'team_gallery', views.TeamGalleryView, 'team_gallery')
router.register(r'working_hour', views.WorkingHourView, 'working_hour')
router.register(r'dynamic_date', views.DynamicDateView, 'dynamic_date')
router.register(r'user_address',views.UserAddressView,'user_address')
router.register(r'smart_card',views.NSGSmartCardView,'smart_card')
router.register(r'super_admin', views.SuperAdminView, 'super_admin')
router.register(r'team_member', views.TeamMemberView, 'team_member')
router.register(r'campain_card', views.CampainView, 'campain_card')
router.register(r'webp_gallery', views.webPGallery, 'webp_gallery')
router.register(r'mail_chimp', views.AddContactView, 'mail_chimp')
router.register(r'team_admin', views.AdminTeamView, 'team_admin')
router.register(r'billing', views.PaymentBillingView, 'billing')
router.register(r'google_pass', views.GooglePass, 'google_pass')
router.register(r'dashboard', views.DashboardView, 'dashboard')
router.register(r'apple_pass', views.AppleView, 'apple_pass')
router.register(r'stripe', views.StripeDetailsView, 'stripe')
router.register(r'timeline',views.TimelineView,'timeline')
router.register(r'contact', views.ContactView, 'contact')
router.register(r'feature', views.FeatureView, 'feature')
router.register(r'package', views.PackageView, 'package')
router.register(r'service', views.ServiceView, 'service')
router.register(r'profile', views.ProfileView, 'profile')
router.register(r'outlook',views.OutlookView,'outlook')
router.register(r'logo', views.AdvisorLogoView, 'logo')
router.register(r'review', views.ReviewView, 'review')
router.register(r'zapier',views.ZapierView,'zapier')
router.register(r'caldav',views.CalDavView,'caldav')
router.register(r'refer', views.ReferView, 'refer')
router.register(r'agent', views.AgentView, 'agent')
router.register(r'user', views.UserView, 'user')
router.register(r'profile_layout', views.ProfileLayoutViewSet, 'profile_layout ')
router.register(r'contact_info', views.ProfileContactInfoView, 'contact_info ')
router.register(r'potential_contact', views.PotentialContactView, 'potential_contact ')




urlpatterns = [
    path("", include(router.urls)),
    path('download-pass/<int:id>/', views.AppleView.as_view({'get': 'download_pass'}), name='download_pass'),
path(
    "contact/<uuid:public_id>-<slug:slug>/",
    ContactView.as_view({"get": "get_contact_by_public_id"},name='contact'),
),
path(
    "share/contact/<uuid:token>/",
    ContactView.as_view({"get": "get_shared_contact"}),
),
path("robots.txt", views.robots_txt, name="robots.txt"),
]
