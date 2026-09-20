from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model

from api.views.Services import calculate_weekly_growth
from api.views.suprsend_helpers import trigger_event

User = get_user_model()

MAX_EMAILS_PER_DAY = 50


class Command(BaseCommand):
    help = "Send weekly profile growth insights"

    def handle(self, *args, **options):

        sent_today = 0
        today = timezone.now().date()

        users = User.objects.all().order_by("id")

        for user in users:

            if sent_today >= MAX_EMAILS_PER_DAY:
                break

            # Skip if already sent in last 7 days
            if user.last_weekly_insight_sent_at:
                if user.last_weekly_insight_sent_at.date() >= today - timedelta(days=6):
                    continue

            growth_percentage, current_views = calculate_weekly_growth(user)

            if growth_percentage > 0:

                properties = {
                    "growth_percentage": growth_percentage,
                    "current_views": current_views,
                }

                try:
                    trigger_event("WEEKLY-INSIGHT", user.id, properties)

                    user.last_weekly_insight_sent_at = timezone.now()
                    user.last_weekly_views_count = current_views
                    user.save(update_fields=[
                        "last_weekly_insight_sent_at",
                        "last_weekly_views_count"
                    ])

                    sent_today += 1

                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f"Failed for user {user.id}: {str(e)}")
                    )

        self.stdout.write(
            self.style.SUCCESS(f"Total users triggered: {sent_today}")
        )