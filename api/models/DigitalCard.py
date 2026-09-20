from django.db import models
from django.utils import timezone
from api.models import User


class DigitalCard(models.Model):
    card_id = models.AutoField(primary_key=True)
    timestamp = models.DateField(default=timezone.now)
    status = models.BooleanField(default=True)
    name = models.CharField(max_length=255)
    profession = models.CharField(max_length=255 , null=True, blank=True)
    email = models.EmailField(unique=False)
    phone = models.CharField(max_length=30, null=True, blank=True)
    device = models.CharField(max_length=512, null=False, blank=False)
    website = models.CharField(max_length=512, null=True, blank=True)
    issues = models.CharField(max_length=512, null=False, blank=False)

class DigitalCardEmail(models.Model):
    sender_name = models.CharField(max_length=255)
    message = models.TextField(blank=True)
    user_email = models.EmailField()
    timestamp = models.DateTimeField(auto_now_add=True)
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE, default=2)

    def __str__(self):
        return f"DigitalCardEmail from {self.sender_name} ({self.user_email})"
    
class BusinessCardEmail(models.Model):
    receiver_name = models.CharField(max_length=255)
    message = models.TextField(blank=True)
    receiver_email = models.EmailField()
    timestamp = models.DateTimeField(auto_now_add=True)
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE, default=2)


class ReceiveCardEmail(models.Model):
    receiver_email = models.EmailField()
    timestamp = models.DateTimeField(auto_now_add=True)
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE)
