from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = "Daily scheduled tasks"

    def handle(self, *args, **options):

        call_command("reengage_contacts")
        call_command("weekly_profile_insight")
        call_command("auto_charge_remaining")

        self.stdout.write(self.style.SUCCESS("Daily cron completed"))
