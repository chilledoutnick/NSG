from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site
from django.conf import settings
from api.models import Package, StripeDetails

class Command(BaseCommand):
    help = "Seeds essential initial lookup and configuration records for a fresh NSG CRM database."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Initializing default system records for NSG CRM..."))

        # 1. Initialize Default Django Site
        site, created = Site.objects.get_or_create(
            id=getattr(settings, "SITE_ID", 1),
            defaults={
                "domain": "localhost:8000",
                "name": getattr(settings, "APP_NAME", "NSG CRM")
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"  [+] Created default Site: {site.name} ({site.domain})"))
        else:
            site.name = getattr(settings, "APP_NAME", "NSG CRM")
            site.save()
            self.stdout.write(self.style.SUCCESS(f"  [*] Updated default Site: {site.name} ({site.domain})"))

        # 2. Seed Default Subscription Packages if table is empty
        try:
            if not Package.objects.exists():
                default_packages = [
                    {"name": "Free Plan", "price": 0, "status": "active"},
                    {"name": "NSG Monthly Pro", "price": 29, "status": "active"},
                    {"name": "NSG Annual Pro", "price": 290, "status": "active"},
                    {"name": "NSG LifeTime Plan", "price": 499, "status": "active"},
                ]
                for pkg in default_packages:
                    Package.objects.create(name=pkg["name"], price=pkg["price"], status=pkg["status"])
                self.stdout.write(self.style.SUCCESS(f"  [+] Seeded {len(default_packages)} default subscription packages."))
            else:
                self.stdout.write(self.style.SUCCESS("  [*] Subscription packages already initialized."))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"  [!] Skipping packages seeding: {e}"))

        self.stdout.write(self.style.SUCCESS("\n[✓] Initial system data seeded successfully for NSG CRM!"))

