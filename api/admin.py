from django.contrib import admin
from api.models import *
from api.models import NSGSmartCard
from api.models.Outlook import Outlook


# Register your models here.

class AdvisorAdmin(admin.ModelAdmin):
    list_display = ('advisor_id', 'about', 'fk_user', 'meet_url',
                    "instagram", "linkedin", "facebook", 'fk_package', 'platform',
                    "source", "purpose", "organization_size")

class ReviewAdmin(admin.ModelAdmin):
    list_display = ('review_id', 'fk_contact', 'fk_user', 'ratings', 'comments', 'status')


class ServiceAdmin(admin.ModelAdmin):
    list_display = ('service_id', 'fk_user', 'name', 'desc')


class UserAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'username', 'is_advisor', 'profile_picture', 'surname', 'address',
                    'phone', 'marketing', 'fk_payment_billing')


class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('appointment_id', 'create_date', 'create_time', 'update_date', 'update_time', 'appointment_date',
                    'appointment_time', 'appointment_start_at', 'appointment_end_at', 'status', 'fk_contact', 'duration', 'appointment_name', 'guests',
                    'meet_link')


class ContactSalesAdmin(admin.ModelAdmin):
    list_display = ('contact_sales_id', 'message', 'first_name',
                    'last_name', 'email', 'phone')


class PaymentBillingAdmin(admin.ModelAdmin):
    list_display = ('billing_id', 'amount', 'set_up_intent_id', 'stripe_customer_id', 'stripe_subscription_id', 'email')


class WorkingHourAdmin(admin.ModelAdmin):
    list_display = ('working_hour_id', 'fk_user', 'working_hour', 'dayName')


class TeamGalleryAdmin(admin.ModelAdmin):
    list_display = ('team_gallery_id', 'fk_user', 'profile_picture', 'name', 'joined_date', 'ratings', 'story',
                    'status', 'created_date', 'heading')


class PublicReviewAdmin(admin.ModelAdmin):
    list_display = ('public_review_id', 'name', 'email', 'ratings', 'comments')


class AdvisorGalleryAdmin(admin.ModelAdmin):
    list_display = ('gallery_id', 'fk_user', 'pictures', 'status')


class FeatureAdmin(admin.ModelAdmin):
    list_display = ('feature_id', 'feature_name', 'status', 'timestamp')


class PackageAdmin(admin.ModelAdmin):
    list_display = ('package_id', 'package_name', 'status', 'timestamp')


class LeadGenerationAdmin(admin.ModelAdmin):
    list_display = ('generation_id', 'is_read', 'status', 'timestamp', 'email', 'location', 'device')


class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ('team_member_id', 'fk_user_member', 'fk_user')


class AdvisorAppointmentAdmin(admin.ModelAdmin):
    list_display = ('advisor_appointment_id', 'fk_user', 'fk_appointment', 'status', 'timestamp', "owner")


class DigitalCardAdmin(admin.ModelAdmin):
    list_display = ('card_id', 'name', 'status', 'timestamp', 'email', 'website', 'phone', 'device', 'issues')


class ExchangeContactsAdmin(admin.ModelAdmin):
    list_display = ('exchange_contact_id', 'fk_user', 'name', 'email', 'phone', 'comment',
                    'timestamp')


class AdminAdvisorAdmin(admin.ModelAdmin):
    list_display = ('id', 'fk_user', 'code', 'logo', 'color', 'limit')


class TeamReferralRelationshipAdmin(admin.ModelAdmin):
    list_display = ('id', 'team_advisor', 'admin_advisor')


class StripeDetailsAdmin(admin.ModelAdmin):
    list_display = ('stripe_detail_id', 'timestamp', 'status', 'product_name', 'desc', 'trial_days', 'monthly_price',
                    'monthly_price_id', 'yearly_price', 'yearly_price_id')


class OutlookAdmin(admin.ModelAdmin):
    list_display = ('fk_user', 'accesstoken', 'refreshtoken', 'create_time', 'expiry_time')


class UserBillingAddressAdmin(admin.ModelAdmin):
    list_display = ('fk_user', 'name', 'email', 'phoneno', 'billing_zip', 'billing_country', 'created_at')
    search_fields = ('name', 'email', 'billing_zip', 'fk_user__id')
    list_filter = ('billing_country', 'created_at')


class UserShippingAddressAdmin(admin.ModelAdmin):
    list_display = (
        'fk_user', 'name', 'email', 'phoneno', 'apartment_details', 'area_details', 'province', 'shipping_zip',
        'shipping_country', 'created_at')
    search_fields = ('name', 'email', 'shipping_zip', 'fk_user__id')
    list_filter = ('province', 'shipping_country', 'created_at')


class NSGSmartCardAdmin(admin.ModelAdmin):
    list_display = ('fk_user', 'has_smart_card')


admin.site.register(Review, ReviewAdmin)
admin.site.register(User, UserAdmin)
admin.site.register(Service, ServiceAdmin)
admin.site.register(Appointment, AppointmentAdmin)
admin.site.register(ContactSales, ContactSalesAdmin)
admin.site.register(PaymentBilling, PaymentBillingAdmin)
admin.site.register(WorkingHour, WorkingHourAdmin)
admin.site.register(TeamGallery, TeamGalleryAdmin)
admin.site.register(PublicReview, PublicReviewAdmin)
admin.site.register(AdvisorGallery, AdvisorGalleryAdmin)
admin.site.register(Feature, FeatureAdmin)
admin.site.register(Package, PackageAdmin)
admin.site.register(LeadGeneration, LeadGenerationAdmin)
admin.site.register(TeamMember, TeamMemberAdmin)
admin.site.register(AdvisorAppointment, AdvisorAppointmentAdmin)
admin.site.register(StripeDetails, StripeDetailsAdmin)
admin.site.register(DigitalCard, DigitalCardAdmin)
admin.site.register(ExchangeContacts, ExchangeContactsAdmin)
admin.site.register(Outlook, OutlookAdmin)
admin.site.register(UserShippingAddress, UserShippingAddressAdmin)
admin.site.register(UserBillingAddress, UserBillingAddressAdmin)
admin.site.register(NSGSmartCard, NSGSmartCardAdmin)
