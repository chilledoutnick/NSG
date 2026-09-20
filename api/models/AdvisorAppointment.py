from django.db import models
from django.utils import timezone
from api.models import *


class AdvisorAppointment(models.Model):
    advisor_appointment_id = models.AutoField(primary_key=True)
    timestamp = models.DateField(default=timezone.now)
    status = models.CharField(max_length=10,null=False, default='active', blank=False)
    fk_appointment = models.ForeignKey("Appointment", on_delete=models.CASCADE)
    owner = models.BooleanField(default=False)
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["fk_appointment", "fk_user"], name="unique_key_appointment_user")

        ]
