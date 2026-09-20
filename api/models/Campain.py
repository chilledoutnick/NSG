from django.db import models

class Campain(models.Model):
    # Your model fields go here
    firstname = models.CharField(max_length=100, blank=True )
    lastname = models.CharField(max_length=100, blank=True )
    company = models.CharField(max_length=100, blank=True )
    emailid = models.EmailField(blank=True)
    timestamp =models.DateTimeField(auto_now_add=True)
    logo = models.ImageField(upload_to='campain_logos/', null=True, blank=True)

class Coupon(models.Model):
    coupon_code = models.CharField(max_length=100, blank=True )
    emailid = models.EmailField(blank=True )
    timestamp =models.DateTimeField(auto_now_add=True)






    