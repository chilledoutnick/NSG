from django.db import models
from api.models import User


class WorkingHour(models.Model):
    DAY_CHOICES = (
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    )
    working_hour_id = models.AutoField(primary_key=True)
    dayName = models.IntegerField(choices=DAY_CHOICES)
    status = models.CharField(max_length=10, choices=[('inactive', 'inactive'), ('active', 'active')],
                              null=True, default='active', blank=False)
    working_hour = models.JSONField(default=list)
    timezone = models.CharField(max_length=50, default='UTC')
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE)


class AdvisorSlotTime(models.Model):
    slot_time = models.JSONField(default=list)
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE)
