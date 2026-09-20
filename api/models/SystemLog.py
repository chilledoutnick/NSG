from django.db import models
from django.conf import settings


class SystemLog(models.Model):

    LOG_LEVELS = (
        ("INFO", "INFO"),
        ("WARNING", "WARNING"),
        ("ERROR", "ERROR"),
        ("CRITICAL", "CRITICAL"),
    )

    level = models.CharField(max_length=20, choices=LOG_LEVELS)

    message = models.TextField()

    endpoint = models.TextField(null=True, blank=True)

    request_method = models.CharField(max_length=10, null=True, blank=True)

    user_agent = models.TextField(null=True, blank=True)

    ip_address = models.CharField(max_length=100, null=True, blank=True)

    gcs_file_url = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    fk_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )