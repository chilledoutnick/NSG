from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from api.models import User

class UserProfileSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.8
    protocol = "https"

    def items(self):
        return User.objects.filter(is_active=True)

    def location(self, obj):
        return f"/{obj.username}/"

    def lastmod(self, obj):
        return obj.updated_at

# class UserSectionSitemap(Sitemap):
#     changefreq = "weekly"
#     priority = 0.6
#     protocol = "https"
#
#     sections = ["about", "services", "portfolio", "contact"]
#
#     def items(self):
#         users = User.objects.filter(is_active=True)
#         urls = []
#         for user in users:
#             for section in self.sections:
#                 urls.append((user, section))
#         return urls
#
#     def location(self, item):
#         user, section = item
#         return f"{user.username}/{section}/"
#
#     def lastmod(self, item):
#         user, section = item
#         return user.updated_at
