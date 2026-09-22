"""
Django settings for NSG CRM (advisorapp) project.
"""
import os
from pathlib import Path
from advisorapp.env_loader import load_env, get_env

# Load environment variables from .env if present
load_env()

BASE_DIR = Path(__file__).resolve().parent.parent

# Application Metadata
APP_NAME = get_env("APP_NAME", "NSG CRM")
COMPANY_NAME = get_env("COMPANY_NAME", "Network Sales & Growth")
BRAND_NAME = get_env("BRAND_NAME", "NSG")
SUPPORT_EMAIL = get_env("SUPPORT_EMAIL", "support@nsgcrm.com")
DEFAULT_FROM_EMAIL = get_env("DEFAULT_FROM_EMAIL", f"{APP_NAME} <noreply@nsgcrm.com>")

# Base URLs
API_URL = get_env("API_URL", "http://127.0.0.1:8000")
FRONTEND_URL = get_env("FRONTEND_URL", "http://localhost:3000")
BACKEND_URL = get_env("BACKEND_URL", "http://127.0.0.1:8000")
REDIRECT_DOMAIN = get_env("REDIRECT_DOMAIN", f"{FRONTEND_URL}/")

# Security & Debug Settings
DEBUG = get_env("DEBUG", True, cast=bool)
if 'DJANGO_SETTINGS_MODULE' in os.environ and os.environ['DJANGO_SETTINGS_MODULE'] == 'advisorapp.settings.production':
    DEBUG = False

SECRET_KEY = get_env("SECRET_KEY", "")
if not SECRET_KEY:
    if DEBUG:
        # Development fallback only
        SECRET_KEY = "django-insecure-nsg-crm-local-dev-fallback-key-do-not-use-in-prod"
    else:
        from django.core.exceptions import ImproperlyConfigured
        raise ImproperlyConfigured("Missing required environment variable: SECRET_KEY")


allowed_hosts_val = get_env("ALLOWED_HOSTS", "*")
if allowed_hosts_val == "*":
    ALLOWED_HOSTS = ["*"]
else:
    ALLOWED_HOSTS = [h.strip() for h in allowed_hosts_val.split(",") if h.strip()]

# Application definition
INSTALLED_APPS = [
    "whitenoise.runserver_nostatic",
    "django.contrib.staticfiles",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "api",
    "corsheaders",
    "rest_framework",
    "mailer",
    "celery",
    "storages",
    "django_celery_results",
    "django_celery_beat",
    "django.contrib.sites",
    "drf_spectacular",
    "django.contrib.sitemaps",
]
SITE_ID = 1

REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "advisorapp.middleware.remove_xframe_middleware.AllowIframeAndYouTubeMiddleware",
]

ROOT_URLCONF = "advisorapp.urls"

# Frontend build directory resolution
FRONTEND_BUILD_DIR = os.path.join(BASE_DIR, "frontend", "build")
if not os.path.exists(FRONTEND_BUILD_DIR):
    FRONTEND_BUILD_DIR = os.path.join(BASE_DIR, "frontend", "public")

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [
            BASE_DIR / "templates",
            FRONTEND_BUILD_DIR,
        ],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

X_FRAME_OPTIONS = "ALLOWALL"
WSGI_APPLICATION = "advisorapp.wsgi.application"

# Database Configuration
import dj_database_url

database_url = get_env("DATABASE_URL")
if database_url:
    DATABASES = {
        "default": dj_database_url.parse(
            database_url,
            conn_max_age=600,
        )
    }
    if "mysql" in DATABASES["default"].get("ENGINE", ""):
        DATABASES["default"].setdefault("OPTIONS", {})["init_command"] = 'SET sql_mode="STRICT_ALL_TABLES"'
else:
    db_engine = get_env("DB_ENGINE", "django.db.backends.postgresql")
    db_name = get_env("DB_NAME", "nsg_crm")
    db_user = get_env("DB_USER", "postgres")
    db_password = get_env("DB_PASSWORD", "")
    db_host = get_env("DB_HOST", "127.0.0.1")
    db_port = get_env("DB_PORT", "5432")
    db_ssl_mode = get_env("DB_SSL_MODE", "prefer")

    db_options = {}
    if "mysql" in db_engine:
        db_options["init_command"] = 'SET sql_mode="STRICT_ALL_TABLES"'
        if db_ssl_mode.upper() == "REQUIRED":
            db_options["ssl"] = {"ssl_mode": "REQUIRED"}
    elif "postgres" in db_engine and db_ssl_mode.lower() != "disable":
        db_options["sslmode"] = db_ssl_mode

    DATABASES = {
        "default": {
            "ENGINE": db_engine,
            "NAME": db_name,
            "USER": db_user,
            "PASSWORD": db_password,
            "HOST": db_host,
            "PORT": db_port,
            "OPTIONS": db_options,
        }
    }

if os.getenv("PROD") == "TRUE":
    if os.getenv("HOST"):
        DATABASES["default"]["HOST"] = os.getenv("HOST")
    if os.getenv("PASSWORD"):
        DATABASES["default"]["PASSWORD"] = os.getenv("PASSWORD")

# Storage Configuration
GCP_STORAGE_BUCKET_NAME = get_env("GCP_STORAGE_BUCKET_NAME", "nsg-crm-storage")
GS_QUERYSTRING_AUTH = False

GOOGLE_APPLICATION_CREDENTIALS = get_env("GOOGLE_APPLICATION_CREDENTIALS", "")
credentials_path = GOOGLE_APPLICATION_CREDENTIALS
NEW_GOOGLE_APPLICATION_CREDENTIALS = credentials_path
if credentials_path and os.path.exists(credentials_path):
    try:
        from google.oauth2 import service_account
        GS_CREDENTIALS = service_account.Credentials.from_service_account_file(credentials_path)
    except Exception:
        GS_CREDENTIALS = None
else:
    GS_CREDENTIALS = None

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

USE_S3 = get_env("USE_S3", False, cast=bool)

if USE_S3:
    GCP_STORAGE_BUCKET_NAME = get_env("GCP_STORAGE_BUCKET_NAME", GCP_STORAGE_BUCKET_NAME) + "-public"
    GCP_DEFAULT_ACL = None
    GCP_GCS_CUSTOM_DOMAIN = f"storage.googleapis.com/{GCP_STORAGE_BUCKET_NAME}"
    GCP_GCS_OBJECT_PARAMETERS = {"CacheControl": "max-age=86400"}
    PUBLIC_MEDIA_LOCATION = "media"
    MEDIA_URL = f"https://{GCP_GCS_CUSTOM_DOMAIN}/{PUBLIC_MEDIA_LOCATION}/"
    DEFAULT_FILE_STORAGE = "advisorapp.storage_backends.PublicMediaStorage"
else:
    MEDIA_URL = get_env("MEDIA_URL", "/media/")
    MEDIA_ROOT = os.path.join(BASE_DIR, "mediafiles")

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_ROOT = os.path.join(PROJECT_DIR, "static")
STATIC_URL = "static/"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = "api.User"
CORS_ALLOW_CREDENTIALS = True
WHITENOISE_USE_FINDERS = True
CORS_ORIGIN_ALLOW_ALL = True

# Email Configuration
EMAIL_HOST_USER = get_env("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = get_env("EMAIL_HOST_PASSWORD", "")
# Default to console backend if SMTP credentials are not configured
default_email_backend = (
    "django.core.mail.backends.smtp.EmailBackend"
    if (EMAIL_HOST_USER and EMAIL_HOST_PASSWORD)
    else "django.core.mail.backends.console.EmailBackend"
)
EMAIL_BACKEND = get_env("EMAIL_BACKEND", default_email_backend)
EMAIL_USE_TLS = get_env("EMAIL_USE_TLS", True, cast=bool)
EMAIL_HOST = get_env("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = get_env("EMAIL_PORT", 587, cast=int)
DATE_FORMAT = "%Y-%m-%d"

MAILER_EMAIL_BACKEND = EMAIL_BACKEND
MAILER_EMAIL_MAX_BATCH = 1000
MAILER_EMAIL_THROTTLE = 3600

DATA_UPLOAD_MAX_MEMORY_SIZE = 1024 * 1024 * 1024

# Celery & Broker Configuration
CELERY_BROKER_URL = get_env("CELERY_BROKER_URL", "")
# If broker is not configured, execute tasks eagerly in-process so background jobs do not fail
CELERY_TASK_ALWAYS_EAGER = get_env(
    "CELERY_TASK_ALWAYS_EAGER",
    not bool(CELERY_BROKER_URL),
    cast=bool,
)
CELERY_TASK_EAGER_PROPAGATES = True
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_TASK_TRACK_STARTED = True
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
CELERY_TASK_ACKS_LATE = True
BROKER_TRANSPORT_OPTIONS = {"visibility_timeout": 300}
CELERY_TASK_TIME_LIMIT = 600
CELERY_TASK_SOFT_TIME_LIMIT = 540
CELERY_RESULT_BACKEND = "django-db"

# Redis Cache Configuration (fallback to in-memory LocMemCache if Redis is not configured)
REDIS_URL = get_env("REDIS_URL", "")
if REDIS_URL:
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": REDIS_URL,
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
            },
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "nsg-crm-locmem-cache",
        }
    }

# Stripe Configuration (Empty = Free Mode active)
STRIPE_SECRET_KEY = get_env("STRIPE_SECRET_KEY", "")
STRIPE_PUBLISHABLE_KEY = get_env("STRIPE_PUBLISHABLE_KEY", "")
STRIPE_WEBHOOK_SECRET = get_env("STRIPE_WEBHOOK_SECRET", "")
STRIPE_FREE_MODE = not bool(STRIPE_SECRET_KEY)

# OAuth Configuration
GOOGLE_CLIENT_ID = get_env("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = get_env("GOOGLE_CLIENT_SECRET", "")

OUTLOOK_CLIENT_ID = get_env("OUTLOOK_CLIENT_ID", "")
OUTLOOK_CLIENT_SECRET = get_env("OUTLOOK_CLIENT_SECRET", "")

# LinkedIn OAuth & Data Integration
LINKEDIN_CLIENT_ID = get_env("LINKEDIN_CLIENT_ID", "")
LINKEDIN_CLIENT_SECRET = get_env("LINKEDIN_CLIENT_SECRET", "")
PROXYCURL_API_KEY = get_env("PROXYCURL_API_KEY", "")

# Twilio Communications
TWILIO_ACCOUNT_SID = get_env("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = get_env("TWILIO_AUTH_TOKEN", "")
TWILIO_PHONE_NUMBER = get_env("TWILIO_PHONE_NUMBER", get_env("TWILIO_FROM_NUMBER", ""))

# Mailchimp Configuration
MAILCHIMP_API_KEY = get_env("MAILCHIMP_API_KEY", "")
MAILCHIMP_AUDIENCE_ID = get_env("MAILCHIMP_AUDIENCE_ID", "")
MAILCHIMP_DC = get_env("MAILCHIMP_DC", "us10")

# SuprSend Notification Infrastructure
SUPRSEND_WORKSPACE_KEY = get_env("SUPRSEND_WORKSPACE_KEY", "")
SUPRSEND_WORKSPACE_SECRET = get_env("SUPRSEND_WORKSPACE_SECRET", "")
SUPRSEND_API_KEY = get_env("SUPRSEND_API_KEY", "")
SUPRSEND_SIGNING_KEY_PEM = get_env("SUPRSEND_SIGNING_KEY_PEM", "")
SUPRSEND_PUBLIC_KEY = get_env("SUPRSEND_PUBLIC_KEY", "")

# Google Workspace / Firebase / Sheets / Gemini
FIREBASE_CREDENTIALS_PATH = get_env("FIREBASE_CREDENTIALS_PATH", get_env("GOOGLE_APPLICATION_CREDENTIALS", ""))
GOOGLE_SHEET_ID = get_env("GOOGLE_SHEET_ID", "")
GEMINI_API_KEY = get_env("GEMINI_API_KEY", "")

STATICFILES_DIRS = []
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
WHITENOISE_ROOT = FRONTEND_BUILD_DIR

# Encryption & Tokens
FERNET_KEY = get_env("FERNET_KEY", "")
if not FERNET_KEY:
    if DEBUG:
        # Development fallback: 32 url-safe base64-encoded bytes
        FERNET_KEY = "dGVzdGluZ2RldmtleWZvcmZlcm5ldDEyMzQ1Njc4OTA="
    else:
        from django.core.exceptions import ImproperlyConfigured
        raise ImproperlyConfigured("Missing required environment variable: FERNET_KEY")

JWT_SECRET = get_env("JWT_SECRET", SECRET_KEY)
SENDER_TOKEN = get_env("SENDER_TOKEN", "")

csrf_origins = get_env("CSRF_TRUSTED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:4000")
CSRF_TRUSTED_ORIGINS = [o.strip() for o in csrf_origins.split(",") if o.strip()]

# Wallet Defaults (Google Wallet & Apple Wallet)
WALLET_ISSUER_ID = get_env("WALLET_ISSUER_ID", "")
WALLET_CLASS_SUFFIX = get_env("WALLET_CLASS_SUFFIX", "nsg_business_card")
WALLET_OBJECT_SUFFIX = get_env("WALLET_OBJECT_SUFFIX", "nsg_business_obj")
APPLE_PASS_PASSWORD = get_env("APPLE_PASS_PASSWORD", "")
APPLE_PASS_ORG_NAME = get_env("APPLE_PASS_ORG_NAME", "NSG Business Card")
APPLE_PASS_TYPE_IDENTIFIER = get_env("APPLE_PASS_TYPE_IDENTIFIER", "pass.crm.nsg.card")
APPLE_TEAM_IDENTIFIER = get_env("APPLE_TEAM_IDENTIFIER", "")
APPLE_CERTIFICATE_PATH = get_env("APPLE_CERTIFICATE_PATH", "")
APPLE_WWDR_PATH = get_env("APPLE_WWDR_PATH", "")
APPLE_PASS_AUTH_TOKEN = get_env("APPLE_PASS_AUTH_TOKEN", "")

# ------------------------------------------------------------------------------
# Feature Flags for Optional Third-Party Integrations
# ------------------------------------------------------------------------------
STRIPE_ENABLED = bool(STRIPE_SECRET_KEY and STRIPE_SECRET_KEY.strip())
STRIPE_FREE_MODE = not STRIPE_ENABLED

GOOGLE_OAUTH_ENABLED = bool(
    GOOGLE_CLIENT_ID
    and GOOGLE_CLIENT_SECRET
    and GOOGLE_CLIENT_ID.strip()
    and GOOGLE_CLIENT_SECRET.strip()
)
GOOGLE_CALENDAR_ENABLED = GOOGLE_OAUTH_ENABLED

OUTLOOK_ENABLED = bool(
    OUTLOOK_CLIENT_ID
    and OUTLOOK_CLIENT_SECRET
    and OUTLOOK_CLIENT_ID.strip()
    and OUTLOOK_CLIENT_SECRET.strip()
)

LINKEDIN_ENABLED = bool(
    LINKEDIN_CLIENT_ID
    and LINKEDIN_CLIENT_SECRET
    and LINKEDIN_CLIENT_ID.strip()
    and LINKEDIN_CLIENT_SECRET.strip()
)
PROXYCURL_ENABLED = bool(PROXYCURL_API_KEY and PROXYCURL_API_KEY.strip())

TWILIO_ENABLED = bool(
    TWILIO_ACCOUNT_SID
    and TWILIO_AUTH_TOKEN
    and TWILIO_ACCOUNT_SID.strip()
    and TWILIO_AUTH_TOKEN.strip()
)

MAILCHIMP_ENABLED = bool(
    MAILCHIMP_API_KEY
    and MAILCHIMP_AUDIENCE_ID
    and MAILCHIMP_API_KEY.strip()
    and MAILCHIMP_AUDIENCE_ID.strip()
)

SUPRSEND_ENABLED = bool(
    SUPRSEND_WORKSPACE_KEY
    and SUPRSEND_WORKSPACE_SECRET
    and SUPRSEND_WORKSPACE_KEY.strip()
    and SUPRSEND_WORKSPACE_SECRET.strip()
)

GOOGLE_WALLET_ENABLED = bool(
    FIREBASE_CREDENTIALS_PATH
    and WALLET_ISSUER_ID
    and os.path.exists(FIREBASE_CREDENTIALS_PATH)
)

APPLE_WALLET_ENABLED = bool(
    APPLE_CERTIFICATE_PATH
    and APPLE_WWDR_PATH
    and os.path.exists(APPLE_CERTIFICATE_PATH)
    and os.path.exists(APPLE_WWDR_PATH)
)

REDIS_ENABLED = bool(REDIS_URL and REDIS_URL.strip())
CELERY_ENABLED = bool(CELERY_BROKER_URL and CELERY_BROKER_URL.strip())
SMTP_ENABLED = bool(
    EMAIL_HOST_USER
    and EMAIL_HOST_PASSWORD
    and EMAIL_HOST_USER.strip()
    and EMAIL_HOST_PASSWORD.strip()
)
GCP_STORAGE_ENABLED = bool(USE_S3 and GCP_STORAGE_BUCKET_NAME and FIREBASE_CREDENTIALS_PATH)

# Fail-Fast Production Security Validation
if not DEBUG:
    from django.core.exceptions import ImproperlyConfigured
    required_prod_vars = [
        ("SECRET_KEY", SECRET_KEY),
        ("FERNET_KEY", FERNET_KEY),
    ]
    for var_name, var_value in required_prod_vars:
        if not var_value:
            raise ImproperlyConfigured(f"Missing required environment variable: {var_name}")

