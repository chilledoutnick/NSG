from django.db import models


class Urls(models.Model):
    url_id = models.AutoField(primary_key=True)
    url = models.CharField(max_length=25)
