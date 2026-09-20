import os
from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings
from api.models import User, Profiles

def index(request, username=None, section=None):
    app_name = getattr(settings, "APP_NAME", "NSG CRM")
    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
    api_url = getattr(settings, "API_URL", "http://127.0.0.1:8000")

    if username:
        user = User.objects.filter(username=username).first()
        profile = None

        if not user:
            profile = Profiles.objects.filter(username=username).first()

        obj = user if user else profile

        if obj:
            if obj.designation and obj.company:
                og_title = f"{obj.name} - {obj.designation} at {obj.company} | {app_name}"
            elif obj.designation:
                og_title = f"{obj.name} - {obj.designation} | {app_name}"
            elif obj.company:
                og_title = f"{obj.name} - {obj.company} | {app_name}"
            else:
                og_title = f"{obj.name} | {app_name}"

            og_image = ""
            if hasattr(obj, "profile_picture") and obj.profile_picture:
                try:
                    og_image = request.build_absolute_uri(obj.profile_picture.url)
                except Exception:
                    og_image = ""

            context = {
                'profile': obj,
                'og_name': obj.name,
                'og_username': username,
                'og_description': getattr(obj, "about", f"{obj.name}'s digital card on {app_name}"),
                'og_image': og_image,
                'og_url': f"{frontend_url}/{username}",
                'og_title': og_title,
                'api_url': api_url,
                'app_name': app_name,
            }

            return render(request, 'index.html', context)

        else:
            # fallback OG
            context = {
                'og_name': app_name,
                'og_url': frontend_url,
                'og_title': f"Check out my digital business card on {app_name}!",
                'og_description': f"{app_name} — Network Sales & Growth smart networking card and CRM.",
                'og_image': f"{api_url}/static/nsg_logo.png",
                'api_url': api_url,
                'app_name': app_name,
            }
            return render(request, 'index.html', context)

    else:
        context = {
            'og_name': app_name,
            'og_url': frontend_url,
            'og_title': f"Check out my digital business card on {app_name}!",
            'og_description': f"{app_name} — Network Sales & Growth smart networking card and CRM.",
            'og_image': f"{api_url}/static/nsg_logo.png",
            'api_url': api_url,
            'app_name': app_name,
        }
        return render(request, 'index.html', context)

def contact_view(request, token=None):
    app_name = getattr(settings, "APP_NAME", "NSG CRM")
    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
    api_url = getattr(settings, "API_URL", "http://127.0.0.1:8000")

    context = {
        "og_name": f"{app_name} | Shared contact",
        "og_title": "Check out my Shared contact!",
        "og_description": f"View this contact and save it to your {app_name} account",
        "og_image": f"{api_url}/static/nsg_logo.png",
        "og_url": f"{frontend_url}/share/contact/{token}",
        "api_url": api_url,
        "share_token": token,
        "app_name": app_name,
    }

    return render(request, "index.html", context)

def robots_txt(request):
    api_url = getattr(settings, "API_URL", "http://127.0.0.1:8000")
    lines = [
        "User-Agent: *",
        "Allow: /",
        f"Sitemap: {api_url}/sitemap.xml",
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain")