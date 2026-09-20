from django.db import models
from django.db.models import Q, CheckConstraint
from django.core.exceptions import ValidationError
from api.models import User


class VideoLink(models.Model):
    title = models.TextField()
    video_link = models.URLField(null=True, blank=True)
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE, related_name='video_user')
    upload_video = models.FileField(upload_to='videos/', null=True, blank=True, default=None)


    def __str__(self):
        return f"{self.fk_user} - {self.title}"


class ProfileVideoLink(models.Model):
    fk_profile = models.ForeignKey('Profiles', on_delete=models.CASCADE, null=True, blank=True)
    title = models.TextField()
    video_link = models.URLField(null=True, blank=True)
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE, related_name='profile_video_user')
    upload_video = models.FileField(upload_to='videos/', null=True, blank=True)


    def __str__(self):
        return f"{self.fk_profile} - {self.title}"