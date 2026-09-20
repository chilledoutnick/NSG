# /management/commands/send_email.py
from datetime import datetime

from django.core.management.base import BaseCommand
from django.utils import timezone

from api.models import SmartCardIntent
from api.views.suprsend_helpers import trigger_event


class Command(BaseCommand):
    help = 'Delete expired pending smart card intents'

    def handle(self, *args, **options):
        expired_intents = SmartCardIntent.objects.filter(
            expires_at__lt=timezone.now()
        )

        count = expired_intents.count()
        expired_intents.delete()

        self.stdout.write(
            self.style.SUCCESS(f'{count} expired smart card intents deleted.')
        )
