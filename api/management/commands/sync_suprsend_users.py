# yourapp/management/commands/sync_suprsend_users.py

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.views.suprsend_helpers import sync_user_profile
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Force sync all users to SuprSend using production DB as source of truth"

    def handle(self, *args, **options):

        users = User.objects.all()

        total = 0
        success = 0
        failed = 0

        for user in users.iterator():

            total += 1

            try:
                # force overwrite profile
                sync_user_profile(user)

                success += 1
                self.stdout.write(
                    self.style.SUCCESS(f"✔ Synced user {user.id} ({user.email})")
                )

            except Exception as e:
                failed += 1
                logger.exception(f"Failed syncing user {user.id}")
                self.stdout.write(
                    self.style.ERROR(f"✘ Failed for {user.id}: {str(e)}")
                )

        self.stdout.write("\n")
        self.stdout.write(self.style.SUCCESS("Sync completed"))
        self.stdout.write(f"Total Users: {total}")
        self.stdout.write(self.style.SUCCESS(f"Success: {success}"))
        self.stdout.write(self.style.ERROR(f"Failed: {failed}"))