from django.db import models
from django.utils import timezone


class LeadGeneration(models.Model):
    generation_id = models.AutoField(primary_key=True)
    timestamp = models.DateField(default=timezone.now)
    status = models.BooleanField(default=True)
    is_read = models.BooleanField(default=False)
    email = models.EmailField()
    location = models.CharField(max_length=512, null=False, blank=False)
    device = models.CharField(max_length=512, null=False, blank=False)

