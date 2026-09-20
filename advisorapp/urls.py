"""advisor app URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import to include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include, re_path

from advisorapp import settings
# from advisorapp.AgentView import AgentView
from . import views, AgentView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.contrib.sitemaps.views import sitemap
from advisorapp.sitemaps import UserProfileSitemap

sitemaps = {
    'profiles': UserProfileSitemap,
    # 'sections': UserSectionSitemap,
}

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include('api.urls')),
    path("sitemap.xml", sitemap, {"sitemaps": sitemaps}, name="sitemap"),

    # ✅ ADD THIS (VERY IMPORTANT - before regex)
    path("signup/onboarding/sync", views.index, name='sync'),

    # Existing routes
    # path("", views.index),

    re_path(
        r"^share/contact/(?P<token>[0-9a-f\-]+)/?$",
        views.contact_view,
        name="contact-share",
    ),

    # 👇 KEEP THIS BELOW (order matters)
    re_path(r'^(?P<username>[\w-]+)(?:/(?P<section>[\w-]+))?/?$', views.index, name='index'),

    re_path(r'^$', views.index, name='index'),

    path("agent/", AgentView.post, name="agent"),
    path("robots.txt", views.robots_txt, name="robots.txt"),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]
if not settings.USE_S3 and settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
