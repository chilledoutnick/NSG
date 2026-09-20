from django.db import models
from django.utils import timezone
from api.models import upload_path, User


class TeamGallery(models.Model):
    CHOICES = (
        (0, 'in_active'),
        (1, 'active')
    )
    team_gallery_id = models.AutoField(primary_key=True)
    profile_picture = models.ImageField(upload_to=upload_path, default=None)
    name = models.CharField(max_length=255)
    joined_date = models.DateField(default=timezone.now)
    heading = models.CharField(max_length=512, null=True, blank=True)
    story = models.CharField(max_length=512, null=True, blank=True)
    status = models.CharField(max_length=10, choices=CHOICES, null=False, default='active', blank=False)
    ratings = models.DecimalField(max_digits=2, null=True, blank=True, decimal_places=1)
    created_date = models.DateTimeField(default=timezone.now)
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        if not self.team_gallery_id:
            self.created_date = timezone.now()
        return super().save(*args, **kwargs)
