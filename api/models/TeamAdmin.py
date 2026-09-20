from datetime import datetime, timezone
from django.db import models
from api.models import User
from api.models.Services import upload_path


class AdminAdvisor(models.Model):
    code = models.CharField(max_length=20, unique=True)
    logo = models.ImageField(upload_to='team_logos/', default=None, null=True, blank=True)
    color= models.CharField(max_length=20)
    team_limit=models.IntegerField(default=0)
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE)

class TeamReferralRelationship(models.Model):
    admin_user = models.ForeignKey("User", on_delete=models.CASCADE, default=2)
    team_user = models.OneToOneField("User", on_delete=models.CASCADE, related_name='team_referred_user')

    def __str__(self):
        return self.team_user.code  # Ensure `code` exists in `user` model
    
class Team_SocialHandle(models.Model):
    instagram = models.CharField(max_length=512, null=True, blank=True,default="")
    facebook = models.CharField(max_length=512, null=True, blank=True,default="")
    linkedin = models.CharField(max_length=512, null=True, blank=True,default="")
    twitter = models.CharField(max_length=512, null=True, blank=True,default="")
    tiktok = models.CharField(max_length=512, null=True, blank=True,default="")
    youtube = models.CharField(max_length=512, null=True, blank=True,default="")
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE)

class TeamService(models.Model):
    name = "Powerful tactics for achieving home ownership success."
    desc = "Discover the transformative power of proven investment strategies, offering guidance toward financial " \
           "independence and the accumulation of wealth through informed decision - making."
    service_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=512, null=False, blank=False, default=name)
    desc = models.CharField(max_length=1024, null=False, blank=False, default=desc)
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE)


class TeamLink(models.Model):
    link = models.URLField()
    title= models.CharField(max_length=500,default="")
    description = models.CharField(max_length=1000, null=True, blank=True, default="")
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE)

class TeamVideoLink(models.Model):
    title=models.TextField()
    video_link = models.URLField()
    fk_user = models.OneToOneField("User", on_delete=models.CASCADE)

class TeamAdvisorGallery(models.Model):
    CHOICES = (
        (0, 'in_active'),
        (1, 'active')
    )
    gallery_id = models.AutoField(primary_key=True)
    timestamp = models.DateField(default=datetime.now)
    status = models.CharField(max_length=10, choices=CHOICES, null=False, default='active', blank=False)
    pictures = models.ImageField(upload_to=upload_path, default=None)
    column_number = models.IntegerField(null=False, blank=False)
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE)
