
from django.db import models
from api.models import Profiles, User


class AdvisorLogo(models.Model):
    logo = models.ImageField(upload_to='advisor_logo/', unique=True)
    timestamp =models.DateTimeField(auto_now_add=True)
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE)

class AdvisorProfileLogo(models.Model):
    logo = models.ImageField(upload_to='profile_logo/', unique=True)
    timestamp =models.DateTimeField(auto_now_add=True)
    fk_profile = models.ForeignKey("Profiles", on_delete=models.CASCADE)