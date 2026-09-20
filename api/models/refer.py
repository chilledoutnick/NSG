from django.db import models
from api.models import User


class ReferralCode(models.Model):
    code = models.CharField(max_length=20, unique=True)
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE)

class ReferralRelationship(models.Model):
    host_user = models.ForeignKey("User", on_delete=models.CASCADE)
    referred_user = models.ForeignKey("User", on_delete=models.CASCADE, related_name='user_referred')
    is_rewarded = models.BooleanField(default=False)
    is_scheduled = models.BooleanField(default=False) 

    def __str__(self):
        return self.code
