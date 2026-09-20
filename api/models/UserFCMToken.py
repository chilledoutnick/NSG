from django.db import models

from api.models import User


# models.py
class UserFCMToken(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="fcm_tokens")
    token = models.TextField()
    device_info = models.CharField(max_length=255, null=True, blank=True, default=None)
    ip_address = models.GenericIPAddressField(null=True, blank=True, default=None)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'ip_address')

    def __str__(self):
        return self.token
