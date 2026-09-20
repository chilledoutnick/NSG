from datetime import datetime, timedelta

import pytz
from django.db import migrations, models


def backfill_appointment_datetimes(apps, schema_editor):
    Appointment = apps.get_model("api", "Appointment")

    for appointment in Appointment.objects.all().iterator():
        if appointment.appointment_start_at:
            continue

        timezone_name = appointment.timezone or "UTC"
        tz = pytz.timezone(timezone_name)
        local_start = tz.localize(
            datetime.combine(appointment.appointment_date, appointment.appointment_time)
        )
        start_utc = local_start.astimezone(pytz.utc)
        appointment.appointment_start_at = start_utc
        appointment.appointment_end_at = start_utc + timedelta(minutes=appointment.duration or 0)
        appointment.save(update_fields=["appointment_start_at", "appointment_end_at"])


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0271_alter_user_google_access_token_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="appointment",
            name="appointment_end_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="appointment",
            name="appointment_start_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.RunPython(backfill_appointment_datetimes, migrations.RunPython.noop),
    ]
