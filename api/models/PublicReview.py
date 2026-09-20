from django.db import models


class PublicReview(models.Model):
    public_review_id = models.AutoField(primary_key=True)
    ratings = models.DecimalField(max_digits=2, null=True, blank=True, decimal_places=1)
    comments = models.CharField(max_length=512, null=True, blank=True)
    create_date = models.DateField()
    update_date = models.DateField()
    name = models.CharField(max_length=255)
    email = models.EmailField()