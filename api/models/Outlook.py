from datetime import datetime, timezone
from django.db import models
from api.models.User import User
from django.utils.timezone import now


class Outlook(models.Model):
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE, null=False, blank=False, default=1)
    accesstoken=models.TextField()
    refreshtoken=models.TextField()
    create_time = models.DateTimeField()
    expiry_time = models.DateTimeField()

    def is_expired(self):
        return datetime.now(timezone.utc) >= self.expiry_time
  

   