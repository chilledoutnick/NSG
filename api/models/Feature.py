from django.db import models
from django.utils import timezone


class Feature(models.Model):
    CHOICES = (
        (0, 'in_active'),
        (1, 'active')
    )
    feature_id = models.AutoField(primary_key=True)
    timestamp = models.DateField(default=timezone.now)
    status = models.CharField(max_length=10, choices=CHOICES, null=False, default='active', blank=False)
    feature_name = models.CharField(max_length=512, null=False, blank=False)

