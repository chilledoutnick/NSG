from django.db import models
from django.utils import timezone
from api.models import User


class ExchangeContacts(models.Model):
    exchange_contact_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=False)
    phone = models.CharField(max_length=30)
    comment = models.CharField(max_length=1024, null=True, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE)

