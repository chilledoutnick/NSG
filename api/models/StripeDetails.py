from django.db import models
from django.utils import timezone


class StripeDetails(models.Model):
    stripe_detail_id = models.AutoField(primary_key=True)
    timestamp = models.DateField(default=timezone.now)
    status = models.BooleanField(default=True)
    product_name = models.CharField(max_length=255)
    product_id = models.CharField(max_length=255)
    desc = models.CharField(max_length=1024, null=True, blank=True)
    trial_days = models.IntegerField(null=True, blank=True, default=14)
    monthly_price = models.DecimalField(max_digits=10, null=True, blank=True, decimal_places=2, default=0.00)
    monthly_price_id = models.CharField(max_length=255, null=True, blank=True, default=None)
    yearly_price = models.DecimalField(max_digits=10, null=True, blank=True, decimal_places=2, default=0.00)
    yearly_price_id = models.CharField(max_length=255, null=True, blank=True, default=None)
    quarterly_price = models.DecimalField(max_digits=10, null=True, blank=True, decimal_places=2, default=0.00)
    quarterly_price_id = models.CharField(max_length=255, null=True, blank=True, default=None)
    one_time_price = models.DecimalField(max_digits=10, null=True, blank=True, decimal_places=2, default=0.00)
    one_time_price_id = models.CharField(max_length=255, null=True, blank=True, default=None)


