import os
import dj_database_url
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Use env variables for security
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-here')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# Allow Render domains and your Vercel frontend
ALLOWED_HOSTS = ['*'] # For now, allow all. You can restrict this to your specific Render/Vercel URLs later.

INSTALLED_APPS = [
    # ... your existing apps
    'corsheaders', # Ensure this is here
    'django.contrib.staticfiles',
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # MUST BE AT THE TOP
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # ADD THIS EXACTLY HERE
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ... rest of your middleware
]

# Database: Use Render's PostgreSQL if available, otherwise fallback to local SQLite
DATABASES = {
    'default': dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600
    )
}

# Static files (Whitenoise needs this to serve CSS/JS in production)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Allow your Vercel frontend to talk to your Render backend
CORS_ALLOW_ALL_ORIGINS = True