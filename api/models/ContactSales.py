from django.db import models
from api.models.Services import upload_path
from api.models.User import User


class ContactSales(models.Model):
    contact_sales_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=255, null=True, blank=True)
    last_name = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(unique=False)
    phone = models.CharField(max_length=15, null=True, blank=True)
    message = models.CharField(max_length=1024, null=True, blank=True)
