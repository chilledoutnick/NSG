from django.db import models
from django.utils import timezone
from api.models import *


class AdvisorGallery(models.Model):
    CHOICES = (
        (0, 'in_active'),
        (1, 'active')
    )
    gallery_id = models.AutoField(primary_key=True)
    timestamp = models.DateField(default=timezone.now)
    status = models.CharField(max_length=10, choices=CHOICES, null=False, default='active', blank=False)
    pictures = models.ImageField(upload_to=upload_path, default=None)
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE)
