from django.core.management.base import BaseCommand

from google.cloud import storage

from datetime import datetime, UTC
import uuid

from advisorapp.settings import GCP_STORAGE_BUCKET_NAME


class Command(BaseCommand):
    help = "Upload test email body to Google Cloud Storage"
    def handle(self, *args, **kwargs):
        try:
            bucket_name = GCP_STORAGE_BUCKET_NAME
            client = storage.Client()
            bucket = client.bucket(bucket_name)
            timestamp = datetime.now(UTC) .strftime("%Y%m%d_%H%M%S")
            unique_id = str(uuid.uuid4())[:8]
            sender_email = "test@example.com"
            filename = (
                f"emails/"
                f"{sender_email}/"
                f"{timestamp}_{unique_id}.txt"
            )
            blob = bucket.blob(filename)
            email_subject = "Prototype Email"
            email_body = """
Hello,
This is a prototype email body.
Testing Google Cloud Storage upload.
Regards,
Sancharika
"""
            content = f"""
Subject: {email_subject}
From: {sender_email}
Timestamp: {timestamp}
-----------------------------------
{email_body}
"""
            blob.upload_from_string(
                content,
                content_type="text/plain"
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f"Uploaded Successfully!"
                )
            )
            self.stdout.write(
                f"GCS Path: gs://{bucket_name}/{filename}"
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(str(e))
            )