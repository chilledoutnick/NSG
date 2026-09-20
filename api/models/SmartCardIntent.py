from api.models import Contact, User, upload_path
from django.utils import timezone
from django.db import models

class SmartCardIntent(models.Model):
    email = models.EmailField()
    designation = models.CharField(max_length=255, null=True)
    card_type = models.CharField(max_length=50)
    logo = models.ImageField(upload_to='advisor_logo/', null=True,
        blank=True)


    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

