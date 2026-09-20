from django.db import models
from api.models.User import User


class OTP(models.Model):
    otpId = models.AutoField(primary_key=True)
    otp = models.CharField(max_length=8, blank=False, null=False)
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE, null=False, blank=False, default=1)
    email = models.EmailField(default="abc@xyz.com")
    create_time = models.DateTimeField()
    expiry_time = models.DateTimeField()
    verified = models.BooleanField(blank=False, null=False, default=False)
    used = models.BooleanField(blank=False, null=False, default=False)

    def __str__(self):
        return self.otpId
