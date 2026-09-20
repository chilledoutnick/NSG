from django.core.management.base import BaseCommand
from django.utils.timezone import now
from api.models.User import User
from api.models.Outlook import Outlook
from api.views.Services import sync_google_calendar, sync_outlook_emails, sync_outlook_calendar


class Command(BaseCommand):
    help = "Sync contacts from Google/Outlook emails and calendar"

    def handle(self, *args, **kwargs):
        users = User.objects.exclude(google_access_token__isnull=True).exclude(google_access_token='')
        # users = User.objects.filter(email="sancharikadebnath@gmail.com")

        for user in users:
            try:
                # sync_google_calendar(user)

                outlook = Outlook.objects.filter(fk_user=user).first()
                if outlook:
                    # sync_outlook_emails(user, outlook)
                    sync_outlook_calendar(user, outlook)
                
                else:
                    # sync_google_emails(user)
                    sync_google_calendar(user)

                self.stdout.write(self.style.SUCCESS(f"Synced user {user.email}"))

            except Exception as e:
                print(f"Error syncing {user.email}: {str(e)}")
