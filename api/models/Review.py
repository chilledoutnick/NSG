from django.db import models

from api.models import Contact
from api.models.Services import upload_path


class Review(models.Model):
    CHOICES = (
        (0, 'in_active'),
        (1, 'active')
    )
    review_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=512, null=True, blank=True)
    ratings = models.DecimalField(max_digits=2, null=False, blank=False, decimal_places=1)
    comments = models.CharField(max_length=512, null=False, blank=False)
    create_date = models.DateField()
    update_date = models.DateField()
    status = models.CharField(max_length=10, choices=CHOICES, null=False, default='active', blank=False)
    fk_user = models.ForeignKey('User', on_delete=models.CASCADE)
    fk_contact = models.ForeignKey('Contact', on_delete=models.CASCADE,null=True,blank=True)
    email = models.CharField(max_length=512, null=True, blank=True)

class UserFeedback(models.Model):
    feedback_id = models.AutoField(primary_key=True)
    emoji = models.CharField(max_length=512, null=False, blank=False)
    comments = models.CharField(max_length=512, null=False, blank=False)
    create_date = models.DateField()
    fk_user = models.ForeignKey('User', on_delete=models.CASCADE)


