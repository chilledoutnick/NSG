from django.db import models
from django.conf import settings


class ArchivedData(models.Model):
    ARCHIVE_TYPES = (
        ("text_field", "text_field"),
        ("full_record", "full_record"),
        ("log", "log"),
    )

    model_name = models.CharField(max_length=255)
    object_id = models.BigIntegerField()

    field_name = models.CharField(max_length=255, null=True, blank=True)

    archive_type = models.CharField(max_length=50, choices=ARCHIVE_TYPES)

    gcs_url = models.TextField()

    checksum = models.CharField(max_length=128)

    archived_at = models.DateTimeField(auto_now_add=True)

    scheduled_delete_at = models.DateTimeField(null=True, blank=True)

    is_deleted_from_db = models.BooleanField(default=False)

    fk_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    class Meta:
        indexes = [
            models.Index(fields=["model_name", "object_id"]),
        ]