import re

from advisorapp.settings import GCP_STORAGE_BUCKET_NAME, NEW_GOOGLE_APPLICATION_CREDENTIALS
from api.models.EmailOTP import RedemptionCode
import secrets


def upload_path(instance, filename):
    try:
        return '/'.join(['img', re.sub('[^a-zA-Z0-9]]', '', str(instance.name)), filename])
    except AttributeError:
        return '/'.join(['img', str('Blog'), filename])


def contact_upload_path(instance, filename):
    user_name = re.sub('[^a-zA-Z0-9]', '', str(instance.owner.name))

    # Clean the contact name to remove special characters
    contact_name = re.sub('[^a-zA-Z0-9]', '', str(instance.name))

    # Return the upload path in the format user_name/contacts/contact_name/pictures/filename
    return f'img/{user_name}/contacts/{contact_name}_{instance.id}/pictures/{filename}'

def notes_upload_path(instance, filename):
    user_name = re.sub('[^a-zA-Z0-9]', '', str(instance.fk_note_reminder.fk_user.name))

    # Clean the contact name to remove special characters
    contact_name = re.sub('[^a-zA-Z0-9]', '', str(instance.fk_note_reminder.fk_contact.name))

    # Return the upload path in the format user_name/contacts/contact_name/notes/filename
    return f'img/{user_name}/contacts/{contact_name}_{instance.fk_note_reminder.fk_contact.id}/notes/{filename}'




def generate_redemption_codes(count=500, prefix="DM-"):
    """
    Generates a batch of unique, random redemption codes and saves them to the DB.
    Returns a list of the generated codes.
    """
    # Exclude easily confused characters: O, 0, I, 1, l
    allowed_chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    generated_codes = []

    while len(generated_codes) < count:
        # Generate an 8-character random string
        random_suffix = ''.join(secrets.choice(allowed_chars) for _ in range(8))
        full_code = f"{prefix}{random_suffix}"

        # Ensure global uniqueness in the DB
        if not RedemptionCode.objects.filter(code=full_code).exists():
            RedemptionCode.objects.create(code=full_code)
            generated_codes.append(full_code)

    return generated_codes








import gzip
import hashlib
import json
import mimetypes
import os
import tempfile
from io import BytesIO

try:
    from google.cloud import storage
except ImportError:
    storage = None


class GCSService:

    def __init__(self, view):
        self.bucket_name = GCP_STORAGE_BUCKET_NAME + "-" + view
        self.client = storage.Client.from_service_account_json(
            NEW_GOOGLE_APPLICATION_CREDENTIALS
        )
        self.bucket = self.client.bucket(self.bucket_name)

    # =========================
    # Upload File
    # =========================

    def upload_file(
        self,
        source_file,
        destination_blob_name,
        content_type=None,
        skip_if_exists=True
    ):
        print("bucket_name: ",self.bucket_name)

        blob = self.bucket.blob(destination_blob_name)

        # DUPLICATE CHECK

        if skip_if_exists and blob.exists():
            return {
                "uploaded": False,
                "url": f"https://storage.googleapis.com/{self.bucket_name}/{destination_blob_name}",
                "message": "File already exists"
            }
        if not content_type:
            content_type = mimetypes.guess_type(destination_blob_name)[0]
        blob.upload_from_file(
            source_file,
            content_type=content_type
        )

        return {
            "uploaded": True,
            "url": f"https://storage.googleapis.com/{self.bucket_name}/{destination_blob_name}",
            "message": "Uploaded successfully"
        }


    # =========================
    # Upload Local Path
    # =========================

    def upload_local_file(
        self,
        local_path,
        destination_blob_name,
        make_public=True
    ):

        blob = self.bucket.blob(destination_blob_name)

        blob.upload_from_filename(local_path)

        if make_public:
            blob.make_public()

        return blob.public_url

    # =========================
    # Upload JSON GZIP
    # =========================

    def upload_json_gz(
        self,
        data,
        destination_blob_name,
        make_public=False
    ):

        json_bytes = json.dumps(
            data,
            default=str,
            ensure_ascii=False
        ).encode("utf-8")

        compressed_buffer = BytesIO()

        with gzip.GzipFile(
            fileobj=compressed_buffer,
            mode="wb"
        ) as gz_file:
            gz_file.write(json_bytes)

        compressed_buffer.seek(0)

        blob = self.bucket.blob(destination_blob_name)

        blob.upload_from_file(
            compressed_buffer,
            content_type="application/gzip"
        )

        if make_public:
            blob.make_public()

        return blob.public_url

    # =========================
    # Delete File
    # =========================

    def delete_file(self, blob_name):

        blob = self.bucket.blob(blob_name)

        if blob.exists():
            blob.delete()
            return True

        return False

    # =========================
    # Check Exists
    # =========================

    def file_exists(self, blob_name):

        blob = self.bucket.blob(blob_name)

        return blob.exists()

    # =========================
    # Download File
    # =========================

    def download_file(self, blob_name):

        blob = self.bucket.blob(blob_name)

        return blob.download_as_bytes()

    # =========================
    # Generate SHA256 Checksum
    # =========================

    def generate_checksum(self, file_obj):

        sha256 = hashlib.sha256()

        file_obj.seek(0)

        for chunk in iter(lambda: file_obj.read(4096), b""):
            sha256.update(chunk)

        file_obj.seek(0)

        return sha256.hexdigest()

    # =========================
    # Generate Checksum from Path
    # =========================

    def generate_checksum_from_path(self, path):

        sha256 = hashlib.sha256()

        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                sha256.update(chunk)

        return sha256.hexdigest()

    # =========================
    # Extract Blob Name
    # =========================

    def extract_blob_name_from_url(self, url):

        if "storage.googleapis.com" in url:
            parts = url.split(f"{self.bucket_name}/")
            if len(parts) > 1:
                return parts[1]

        return None