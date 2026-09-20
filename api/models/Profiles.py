from datetime import timezone
from django.contrib.auth.models import AbstractUser
from django.db import models
from api.models.Services import upload_path
from datetime import datetime, timezone

class Profiles(models.Model):
    bg_black = "https://storage.googleapis.com/nsg-crm-storage-public/media/webp_images/Group_1000003406_png.webp"
    bg_black_profile = "https://storage.googleapis.com/nsg-crm-storage-public/media/webp_images/Group_1000003412_png.webp"
    name = models.CharField(max_length=1024)
    profile_picture = models.ImageField(upload_to=upload_path)
    about = models.TextField(null=True, blank=True, default=None)
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
    card_name= models.CharField(max_length=512,blank=True, null=True, default="")
    background_colour = models.CharField(max_length=512, null=True, blank=True, default='#282828')
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    fk_user = models.ForeignKey('User', on_delete=models.CASCADE)
    wlcm_message = models.JSONField(default=dict)  # {"heading": "...", "subheading": "..."}
    is_review = models.BooleanField(default=True)
    is_service= models.BooleanField(default=True)
    is_links= models.BooleanField(default=True)
    is_feature_images= models.BooleanField(default=True)
    is_feature_video= models.BooleanField(default=True)


