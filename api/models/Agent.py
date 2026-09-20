from django.db import models


class Agent(models.Model):
    info = models.CharField(max_length=1024, null=False, blank=False)
    fk_user = models.ForeignKey('User', on_delete=models.CASCADE, null=True, blank=True)
    agent_id=models.CharField(max_length=512, null=False, blank=False,default="")
    client_name=models.CharField(max_length=512, null=False, blank=False,default="")
    agent_username=models.CharField(max_length=512, null=False, blank=False,default="")
    secret_key=models.CharField(max_length=1024, null=False, blank=False,default="")
    owner = models.CharField(max_length=1024, null=False, blank=False,default="")
    voice_id = models.CharField(max_length=100)
    prompt = models.TextField()
    language = models.CharField(max_length=20, default="en-US")

    twilio_number = models.CharField(max_length=20, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
