from django.db import models


class Service(models.Model):
    name = "Powerful tactics for achieving home ownership success."
    desc = "Discover the transformative power of proven investment strategies, offering guidance toward financial " \
           "independence and the accumulation of wealth through informed decision - making."
    service_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=512, null=False, blank=False, default=name)
    desc = models.CharField(max_length=1024, null=False, blank=False, default=desc)
    sorting_id = models.IntegerField(default=1)
    fk_user = models.ForeignKey('User', on_delete=models.CASCADE)
    url=models.CharField(max_length=512, null=False, blank=False,default="")
    service_img= models.ImageField(upload_to='service_images/', null=True, blank=True,default="webp_images/713b6961fe564b5492ed32860ddcd633.webp")

class ProfileService(models.Model):
    name = "Powerful tactics for achieving home ownership success."
    desc = "Discover the transformative power of proven investment strategies, offering guidance toward financial " \
           "independence and the accumulation of wealth through informed decision - making."
    name = models.CharField(max_length=512, null=False, blank=False, default=name)
    desc = models.CharField(max_length=1024, null=False, blank=False, default=desc)
    sorting_id = models.IntegerField(default=1)
    fk_profile = models.ForeignKey('Profiles', on_delete=models.CASCADE)
    url=models.CharField(max_length=512, null=False, blank=False,default="")
    service_img= models.ImageField(upload_to='service_images/', null=True, blank=True,default="webp_images/713b6961fe564b5492ed32860ddcd633.webp")
    fk_user = models.ForeignKey('User', on_delete=models.CASCADE, null=True, blank=True)

