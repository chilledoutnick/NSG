# advisorapp/storage_backends.py

from django.conf import settings
from storages.backends.gcloud import GoogleCloudStorage

class PublicMediaStorage(GoogleCloudStorage):
    bucket_name = getattr(settings, "GCP_STORAGE_BUCKET_NAME", "nsg-crm-storage")
    location = "media"
    file_overwrite = False
    querystring_auth = False

class StaticStorage(GoogleCloudStorage):
    bucket_name = getattr(settings, "GCP_STORAGE_BUCKET_NAME", "nsg-crm-storage")
    location = 'static'
