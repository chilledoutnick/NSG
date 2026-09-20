from django.db import models

from api.models import User


class ReferralEmail(models.Model):
    referral_email = models.EmailField(blank=True )
    timestamp =models.DateTimeField(auto_now_add=True)
    referral_coupon_users=models.CharField(max_length=120,default="")
    referral_coupon_friends=models.CharField(max_length=120,default="")
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE)
