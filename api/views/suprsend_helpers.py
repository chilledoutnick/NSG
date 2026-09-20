# yourapp/notifications/suprsend_helpers.py
import datetime
import os

from suprsend import Suprsend, Event
import logging

import jwt  # PyJWT
import time

from api.models import WorkingHour

from django.conf import settings

SUPRSEND_WORKSPACE_KEY = getattr(settings, "SUPRSEND_WORKSPACE_KEY", os.getenv("SUPRSEND_WORKSPACE_KEY", ""))
SUPRSEND_WORKSPACE_SECRET = getattr(settings, "SUPRSEND_WORKSPACE_SECRET", os.getenv("SUPRSEND_WORKSPACE_SECRET", ""))
suprsend_api_key = getattr(settings, "SUPRSEND_API_KEY", os.getenv("SUPRSEND_API_KEY", ""))
signing_key_pem = getattr(settings, "SUPRSEND_SIGNING_KEY_PEM", os.getenv("SUPRSEND_SIGNING_KEY_PEM", "")).replace("\\n", "\n").strip()
signing_key_base64 = os.getenv("SUPRSEND_SIGNING_KEY_BASE64", "")
SUPRSEND_WORKSPACE_KEY_PUBLIC_KEY = getattr(settings, "SUPRSEND_PUBLIC_KEY", os.getenv("SUPRSEND_PUBLIC_KEY", ""))



SUPRSEND_API_BASE = "https://api.suprsend.com"


logger = logging.getLogger(__name__)

# initialize client (adjust args if SDK expects different names)
client = Suprsend(
    workspace_key=SUPRSEND_WORKSPACE_KEY,
    workspace_secret=SUPRSEND_WORKSPACE_SECRET
)


def sync_user_profile(user):
    """
    Create or update a SuprSend profile for `user`.
    """
    try:
        distinct_id = str(user.id)
        schedule_data = WorkingHour.objects.filter(fk_user_id=user.id, status='active')
        if schedule_data.exists():
            user_timezone = schedule_data.first().timezone
        else:
            user_timezone = "America/New_York"

        # user.phone
        sub = client.users.get_edit_instance(distinct_id)

        # overwrite email
        if user.email:
            sub.set("email", user.email)

        # overwrite phone
        if getattr(user, "phone", None):
            sub.set("phone_number", user.phone)

        # overwrite attributes
        sub.set("Name", user.name)

        # always set timezone
        sub.set_timezone(user_timezone)

        # mark as production user
        sub.set("environment", "production")
        sub.set("type", "user")
        # update profile on SuprSend
        resp = client.users.async_edit(sub)
        return resp
    except Exception as e:
        logger.exception("SuprSend: failed to sync user %s", getattr(user, "id", None))
        raise

def save_push_subscription_on_profile(user, push_subscription: dict):
    """
    Stores push subscription (web push token / device info) on user's SuprSend profile.
    push_subscription is expected to be the raw object from browser subscription.
    """
    try:
        distinct_id = str(user.id)
        sub = client.users.get_edit_instance(distinct_id)
        # SDKs often accept device tokens or webpush subscription in attributes
        sub.set("push_subscription", push_subscription)
        # If SDK supports adding device, use client.profile.add_device(...)
        resp = client.users.async_edit(sub)
        return resp
    except Exception:
        logger.exception("SuprSend: failed to save push subscription for user %s", user.id)
        raise

def trigger_event(event_name: str, distinct_id: str, properties: dict = None):
    """
    Fire an event to SuprSend. distinct_id should be str(user.id).
    """
    try:
        # payload = {
        #     "distinct_id": str(distinct_id),
        #     "event_name": event_name,
        #     "properties": properties or {}
        # }
        event = Event(distinct_id=str(distinct_id), event_name=event_name, properties=properties)
        resp = client.track_event(event)  # using SDK event API as used earlier
        # sometimes SDK uses client.track; adjust if required by your SDK version
        # resp = client.track(payload)
        return resp
    except Exception:
        logger.exception("SuprSend: failed to fire event %s for %s", event_name, distinct_id)
        raise

def create_suprsend_user_token(distinct_id: str, ttl_seconds: int = 3600) -> str:
    """
    Creates a signed JWT token for SuprSend client authentication (enhanced security mode).
    `distinct_id` is your user’s distinct id (string).
    Returns the JWT as a string.
    """
    payload = {
        "entity_type": "subscriber",
        "entity_id": distinct_id,
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=30),
        'iat': datetime.datetime.now(datetime.timezone.utc)
    }

    # secret = base64.b64decode('your_base64_signingKey').decode('utf-8')

    signed_user_token = jwt.encode(payload, signing_key_pem, algorithm='ES256')
    # In PyJWT >= 2.x, jwt.encode returns a str; if bytes, decode to str
    if isinstance(signed_user_token, bytes):
        signed_user_token = signed_user_token.decode("utf-8")
    return signed_user_token
