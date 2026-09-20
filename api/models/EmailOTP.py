from django.db import models
from django.conf import settings

# from api.models.User import User


class EmailOTP(models.Model):
    otpId = models.AutoField(primary_key=True)
    otp = models.CharField(max_length=8, blank=False, null=False)
    email = models.EmailField(default="abc@xyz.com")
    name = models.CharField(max_length=255, blank=True, null=True)
    create_time = models.DateTimeField()
    expiry_time = models.DateTimeField()
    verified = models.BooleanField(blank=False, null=False, default=False)
    used = models.BooleanField(blank=False, null=False, default=False)

    def __str__(self):
        return self.otpId



class RedemptionCode(models.Model):
    # The actual unique redemption code
    code = models.CharField(max_length=20, unique=True, db_index=True)

    # Tracking status
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    redeemed_at = models.DateTimeField(null=True, blank=True)

    # Link it to the user who redeems it
    redeemed_by = models.ForeignKey(
        "User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="redemptions"
    )

    def __str__(self):
        return f"{self.code} - {'Used' if self.is_used else 'Active'}"