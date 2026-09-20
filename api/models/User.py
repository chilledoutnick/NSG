from datetime import timezone
from django.contrib.auth.models import AbstractUser
from django.db import models
from api.models.Services import upload_path
from datetime import datetime, timezone


class User(AbstractUser):
    bg_black = "https://storage.googleapis.com/nsg-crm-storage-public/media/webp_images/Group_1000003406_png.webp"
    bg_black_profile = "https://storage.googleapis.com/nsg-crm-storage-public/media/webp_images/Group_1000003412_png.webp"
    CHOICES = (
        (0, 'monthly'),
        (1, 'yearly')
    )

    name = models.CharField(max_length=1024)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, null=True, blank=True)
    profile_picture = models.ImageField(upload_to=upload_path)
    password = models.CharField(max_length=255)
    USERNAME_FIELDS = ['email']
    REQUIRED_FIELDS = []
    is_advisor = models.BooleanField(default=True)  # True= Advisor && False = Client
    surname = models.CharField(max_length=1024, default="Mr.", null=True, blank=True)
    address = models.CharField(max_length=1024, null=True, blank=True)
    marketing = models.BooleanField(default=False)
    fk_payment_billing = models.ForeignKey('api.PaymentBilling', on_delete=models.CASCADE, default=1)
    about = models.TextField(null=True, blank=True, default=None)
    meet_url = models.CharField(max_length=512, null=True, blank=True)
    is_team_member = models.BooleanField(default=False)
    fk_package = models.ForeignKey('api.Package', on_delete=models.CASCADE, default=5)
    app_password = models.CharField(max_length=16, null=False, blank=True, default="")
    instagram = models.CharField(max_length=512, null=True, blank=True, default="")
    facebook = models.CharField(max_length=512, null=True, blank=True, default="")
    linkedin = models.CharField(max_length=512, null=True, blank=True, default="")
    twitter = models.CharField(max_length=512, null=True, blank=True, default="")
    tiktok = models.CharField(max_length=512, null=True, blank=True, default="")
    youtube = models.CharField(max_length=512, null=True, blank=True, default="")
    background_pattern = models.CharField(max_length=512, null=True, blank=True, default=bg_black)
    background_pattern_profile = models.CharField(max_length=512, null=True, blank=True, default=bg_black_profile)
    company = models.CharField(max_length=1024, null=True, blank=True, default="")
    designation = models.CharField(max_length=1024, null=True, blank=True, default="")
    logo = models.ImageField(upload_to=upload_path, default=None, null=True, blank=True)
    platform = models.CharField(max_length=100, null=True, blank=True, default='gmail')
    source = models.CharField(max_length=512, null=True, blank=True)
    organization_size = models.CharField(max_length=512, null=True, blank=True)
    purpose = models.TextField(blank=True, null=True, default=[])
    google_access_token = models.TextField(null=True, blank=True, default='')
    google_refresh_token = models.TextField(null=True, blank=True)
    google_token_expiry_time = models.DateTimeField(null=True, blank=True)
    scheduling = models.BooleanField(default=False)
    is_review = models.BooleanField(default=True)
    custom_username = models.CharField(max_length=150, default='')
    background_colour = models.CharField(max_length=512, null=True, blank=True, default='#282828')
    payment_status = models.BooleanField(default=False)
    is_team_admin = models.BooleanField(default=False)
    payment_plan = models.CharField(max_length=10, choices=CHOICES, null=True, blank=True, default="")
    team_member_count = models.CharField(max_length=10, null=True, blank=True, default=0)
    account_status = models.IntegerField(choices=[(0, 'Free'), (1, 'Paid')], default=0)
    fcm_token = models.JSONField(default=list)  # Store multiple FCM tokens
    fcm_permission = models.IntegerField(choices=[(-1, 'Default'), (0, 'False'), (1, 'True')], default=-1)
    google_meet = models.BooleanField(default=False)
    availability_added_first_time = models.BooleanField(default=False)
    user_meta_data = models.JSONField(default=dict)
    substack = models.CharField(max_length=512, null=True, blank=True, default="")
    wlcm_message = models.JSONField(default=dict)  # {"heading": "...", "subheading": "..."}
    is_service= models.BooleanField(default=True)
    is_links= models.BooleanField(default=True)
    is_feature_images= models.BooleanField(default=True)
    is_feature_video= models.BooleanField(default=True)
    last_weekly_insight_sent_at = models.DateTimeField(null=True, blank=True)
    last_weekly_views_count = models.IntegerField(default=0)
    last_reengagement_email_sent_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    def is_expired(self):
        return datetime.now(timezone.utc) >= self.google_token_expiry_time


class ProfileProgress(models.Model):
    is_open = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE)  # Changed to OneToOneField

    class Meta:
        app_label = 'api'
