from django.db import models



class UserBillingAddress(models.Model):
    fk_user = models.ForeignKey('User', on_delete=models.CASCADE) 
    name=models.CharField(max_length=50)
    email=models.EmailField(max_length=50)
    phoneno=models.CharField(max_length=20)
    billing_zip = models.CharField(max_length=20)
    billing_country = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)


class UserShippingAddress(models.Model):
    fk_user = models.ForeignKey('User', on_delete=models.CASCADE)  # Assuming user identification by ID
    name=models.CharField(max_length=50)
    email=models.EmailField(max_length=50)
    phoneno=models.CharField(max_length=20)
    apartment_details = models.TextField()
    area_details=models.CharField(max_length=100)
    province=models.CharField(max_length=100)
    shipping_zip = models.CharField(max_length=20)
    shipping_country = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
