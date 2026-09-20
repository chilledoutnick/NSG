from django.core.validators import validate_email
from rest_framework import serializers
from api.models import *
from api.models import UserAddress, UserFCMToken, SmartCardIntent, ProfileContactInfo
from api.models import NSGSmartCard
from api.models.Campain import Campain
from api.models import AdvisorAppointment, refer, ApplePass, AdvisorLogo
from api.models import WebPGallery
from api.models.ProfileLayout import ProfileLayout
from api.models.TeamAdmin import Team_SocialHandle, TeamLink, TeamService, TeamVideoLink
from api.models.WorkingHour import AdvisorSlotTime
from api.views.Services import validate_phone


class ContactSerializer(serializers.ModelSerializer):
    contact_id = serializers.IntegerField(source='id', read_only=True)
    contact_url = serializers.SerializerMethodField()
    class Meta:
        model = Contact
        fields = '__all__'

    def get_contact_url(self, obj):
        return f"/contact/{obj.public_id}-{obj.slug}"

    def get_tags(self, obj):
        tags = ContactTag.objects.filter(fk_contact=obj).select_related("fk_tag")
        return TagSerializer([t.fk_tag for t in tags], many=True).data


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'


class UrlsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Urls
        fields = '__all__'


class ContactSalesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSales
        fields = '__all__'


class PaymentBillingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentBilling
        fields = '__all__'


class WorkingHourSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkingHour
        fields = '__all__'


class TeamGallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamGallery
        fields = '__all__'


class PublicReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicReview
        fields = '__all__'


class AdvisorGallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = AdvisorGallery
        fields = '__all__'


class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = '__all__'


class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = '__all__'


class LeadGenerationSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadGeneration
        fields = '__all__'


class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = '__all__'


class AdvisorAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdvisorAppointment
        fields = '__all__'


class DigitalCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = DigitalCard
        fields = '__all__'


class ExchangeContactsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExchangeContacts
        fields = '__all__'


class CampainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campain
        fields = '__all__'


class WebPGallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = WebPGallery
        fields = '__all__'


class ReferSerializer(serializers.ModelSerializer):
    class Meta:
        model = refer
        fields = '__all__'


class ApplePassSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplePass
        fields = '__all__'


class AdvisorSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdvisorSlotTime
        fields = '__all__'


class AdvisorLogoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdvisorLogo
        fields = '__all__'


class Team_SocialHandleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team_SocialHandle
        fields = '__all__'


class TeamServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamService
        fields = '__all__'


class TeamLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamLink
        fields = '__all__'


class TeamVideoLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamVideoLink
        fields = '__all__'


class StripeDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StripeDetails
        fields = '__all__'


class NoteReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = NoteReminder
        fields = '__all__'


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'


class TimelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Timeline
        fields = '__all__'


class UserBillingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserBillingAddress
        fields = '__all__'  # Include all fields


class UserShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserShippingAddress
        fields = '__all__'  # Include all fields


class NSGSmartCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = NSGSmartCard
        fields = '__all__'  # Include all fields


class UserFCMTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFCMToken
        fields = '__all__'  # Include all fields


class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = '__all__'  # Include all fields


class ProfileLayoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfileLayout
        fields = ["sections_order", "fk_user", "fk_profile"]

class SmartCardIntentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SmartCardIntent
        fields = '__all__'  # Include all fields

class ProfileContactInfoSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProfileContactInfo
        fields = "__all__"

        read_only_fields = ("fk_user", "fk_profile")

        def validate(self, data):
            contact_type = data.get("contact_type")
            value = data.get("value")

            # Validate value
            if contact_type == "phone":
                validate_phone(value)

            elif contact_type == "email":
                validate_email(value)

            return data
class PotentialContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = PotentialContact
        fields = '__all__'  # Include all fields