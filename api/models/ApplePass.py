from django.db import models
from api.models import User


class ApplePass(models.Model):
    applepass = models.FileField(upload_to='applepasses/',unique=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE)
    username = models.CharField(max_length=120)


    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['fk_user', 'username'], name='unique_user_username')
        ]

    def save(self, *args, **kwargs):
        # If username is not provided, default to fk_user.username
        if not self.username and self.fk_user:
            self.username = self.fk_user.username
        super().save(*args, **kwargs)