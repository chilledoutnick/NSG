from django.db import models
from django.utils import timezone
import datetime
import pytz
import ast


class Appointment(models.Model):
    appointment_id = models.AutoField(primary_key=True)
    create_date = models.DateField(auto_now_add=True)
    create_time = models.TimeField(auto_now_add=True)
    update_date = models.DateField(auto_now=True)
    update_time = models.TimeField(auto_now=True)
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    status = models.CharField(max_length=10, choices=[('deleted', 'deleted'), ('active', 'active'),
                                                      ('completed', 'completed'),("canceled","canceled"),('reschedule','reschedule')],
                              null=False, default='active', blank=False)
    duration = models.IntegerField(default=15)
    appointment_name = models.CharField(max_length=255, default="Brief Discussion")
    guests = models.TextField(blank=True, null=True, default=[])
    meet_link = models.CharField(max_length=512, null=True, blank=True)
    timezone = models.CharField(max_length=60, default='UTC')
    appointment_start_at = models.DateTimeField(null=True, blank=True)
    appointment_end_at = models.DateTimeField(null=True, blank=True)
    fk_contact = models.ForeignKey('Contact', on_delete=models.CASCADE, null=True, blank=True)
    contacts = models.ManyToManyField('Contact', related_name='appointments', blank=True)  # For group meetings
    reschedule_time = models.DateTimeField(null=True, blank=True)  # When the appointment was rescheduled
    deleted_at = models.DateTimeField(null=True, blank=True)  # When the appointment was soft deleted
    eventId=models.CharField(max_length=512, null=True, blank=True)
    is_archived = models.BooleanField(default=False)
    gcs_file_url = models.TextField(null=True, blank=True)
    archived_at = models.DateTimeField(null=True, blank=True)

    def soft_delete(self):
        """Soft delete the appointment."""
        self.status = 'deleted'
        self.deleted_at = timezone.now()
        self.save()

    def reschedule(self, new_date, new_time):
        """Reschedule the appointment to a new date and time."""
        self.appointment_date = new_date
        self.appointment_time = new_time
        self.sync_start_end_from_local(self.timezone or "UTC")
        self.reschedule_time = timezone.now()
        self.save()

    def sync_start_end_from_local(self, timezone_name=None):
        timezone_name = timezone_name or self.timezone or "UTC"
        tz = pytz.timezone(timezone_name)
        naive_start = datetime.datetime.combine(self.appointment_date, self.appointment_time)
        localized_start = tz.localize(naive_start) if naive_start.tzinfo is None else naive_start.astimezone(tz)
        self.appointment_start_at = localized_start.astimezone(pytz.utc)
        self.appointment_end_at = self.appointment_start_at + datetime.timedelta(minutes=self.duration or 0)

    def sync_legacy_fields_from_start(self):
        if not self.appointment_start_at:
            return
        start_at_utc = self.appointment_start_at
        if timezone.is_naive(start_at_utc):
            start_at_utc = timezone.make_aware(start_at_utc, datetime.timezone.utc)
        local_start = timezone.localtime(start_at_utc, pytz.timezone(self.timezone or "UTC"))
        self.appointment_date = local_start.date()
        self.appointment_time = local_start.time().replace(microsecond=0)

        if not self.appointment_end_at and self.duration is not None:
            self.appointment_end_at = start_at_utc + datetime.timedelta(minutes=self.duration)

    def save(self, *args, **kwargs):
        if self.appointment_start_at:
            self.sync_legacy_fields_from_start()
        elif self.appointment_date and self.appointment_time:
            self.sync_start_end_from_local(self.timezone or "UTC")
        super().save(*args, **kwargs)

    def get_guests_list(self):
        guests_list = ast.literal_eval(str(self.guests))
        return guests_list

    def set_guests_list(self, guests_list):
        self.guests = ','.join(guests_list)

    def __str__(self):
        return str(self.appointment_id)
