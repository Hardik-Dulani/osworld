from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from api.api import api

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api.urls),
]

# This line allows Django to serve your uploaded images and videos locally!
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)