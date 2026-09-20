from django.db import models





class WebPGallery(models.Model):
    webp_image = models.ImageField(upload_to='webp_images/', unique=True)
    timestamp =models.DateTimeField(auto_now_add=True)