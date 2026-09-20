from django.db import models

from api.models import User



class CalDav(models.Model):
    platform = models.CharField(max_length=100,default="")
    url = models.URLField()
    username = models.CharField(max_length=100)
    password = models.TextField()
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)