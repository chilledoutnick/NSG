from django.db import models
from django.utils import timezone
from api.models import *


class ProfilesGallery(models.Model):
    CHOICES = (
        (0, 'in_active'),
        (1, 'active')
    )
    timestamp = models.DateField(default=timezone.now)
    status = models.CharField(max_length=10, choices=CHOICES, null=False, default='active', blank=False)
    pictures = models.ImageField(upload_to=upload_path, default=None)
    fk_profile = models.ForeignKey("Profiles", on_delete=models.CASCADE)
