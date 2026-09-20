from django.db import models
from django.utils import timezone


class Package(models.Model):
    CHOICES = (
        (0, 'in_active'),
        (1, 'active')
    )
    package_id = models.AutoField(primary_key=True)
    timestamp = models.DateField(default=timezone.now)
    status = models.CharField(max_length=10, choices=CHOICES, null=False, default='active', blank=False)
    package_name = models.CharField(max_length=214)
