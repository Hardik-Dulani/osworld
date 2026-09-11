import os
import dj_database_url
from whitenoise.storage import CompressedStaticFilesStorage
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Use env variables for security
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-here')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# Allow Render domains and your Vercel frontend
ALLOWED_HOSTS = ['*'] # For now, allow all. You can restrict this to your specific Render/Vercel URLs later.

INSTALLED_APPS = [
    # cloudinary_storage MUST come before django.contrib.staticfiles
    'cloudinary_storage',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-Party Apps
    'corsheaders',
    'cloudinary',

    # Your Apps
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be at the absolute top
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Must be right after SecurityMiddleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',  # Fixes admin.E408
    'django.contrib.messages.middleware.MessageMiddleware',     # Fixes admin.E409
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': os.environ.get('CLOUDINARY_API_KEY'),
    'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET'),
}

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates', # Fixes admin.E403
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Database: Use Render's PostgreSQL if available, otherwise fallback to local SQLite
DATABASES = {
    'default': dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600
    )
}

# ----------------- STORAGE CONFIGURATION -----------------
# Static files (CSS, JS, Images for the admin panel)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files (Product uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Django 4.2+ standard for routing file storage
class SafeWhiteNoiseStorage(CompressedStaticFilesStorage):
    def _compress_path(self, *args, **kwargs):
        try:
            # Safely skips the broken hr.js file without crashing the build
            yield from super()._compress_path(*args, **kwargs)
        except Exception:
            pass
STORAGES = {
    "default": {
        "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
    },
    "staticfiles": {
        "BACKEND": "core.settings.SafeWhiteNoiseStorage",
    },
}
# You can delete these old fallback lines entirely to prevent conflicts:
# DEFAULT_FILE_STORAGE = ...
# STATICFILES_STORAGE = ...
# WHITENOISE_MANIFEST_STRICT = False

# Fallbacks for older Django versions
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'
# ---------------------------------------------------------

# Allow your Vercel frontend to talk to your Render backend
CORS_ALLOW_ALL_ORIGINS = True

# Tells Django where your urls.py file is
ROOT_URLCONF = 'core.urls'

# Tells Django where your wsgi.py file is
WSGI_APPLICATION = 'core.wsgi.application'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'