from django.db import models


class MigrationTracker(models.Model):

    source_url = models.TextField()
    destination_url = models.TextField()
    checksum_source = models.CharField(max_length=128)
    checksum_destination = models.CharField(max_length=128)
    status = models.CharField(max_length=50)
    migrated_at = models.DateTimeField(auto_now_add=True)
    is_deleted_from_source = models.BooleanField(default=False)