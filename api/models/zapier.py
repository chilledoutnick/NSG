from django.db import models
from api.models import User



class Zapier(models.Model):
    zapier_key = models.CharField(max_length=255, unique=True)
    timestamp =models.DateTimeField(auto_now_add=True)
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE)
