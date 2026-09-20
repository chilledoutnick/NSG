from django.http import HttpResponse

def robots_txt(request):
    lines = [
        "User-Agent: *",
        "Allow: /",
        "Sitemap: {{ API_URL }}/sitemap.xml",
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain")