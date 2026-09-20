from django.core.management.base import BaseCommand
from django.db.models import Q, Max, OuterRef, Subquery
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from api.models import Contact, Timeline
import time

from api.views.suprsend_helpers import trigger_event

User = get_user_model()


class Command(BaseCommand):
    help = "Send weekly re-engagement emails. Cooldown: 7 days if no action, 30 days if action taken."

    def handle(self, *args, **options):
        now = timezone.now()

        # Thresholds
        seven_days_ago = now - timedelta(days=7)  # Weekly nudge
        fifteen_days_ago = now - timedelta(days=15)  # Eligibility start

        total_sent = 0

        # Only users who have active contacts
        users = (
            User.objects.filter(contacts__is_archived=False)
            .filter(
                Q(last_reengagement_email_sent_at__isnull=True) |
                Q(last_reengagement_email_sent_at__lte=seven_days_ago)
            )
            .distinct()
            .order_by("id")[:30]
        )

        for user in users:
            # 1. Subquery for REAL activity
            # We exclude the "You added..." system note by filtering out that specific string
            # and potentially excluding any entry that matches the contact's creation exactly.
            real_activity_subquery = Timeline.objects.filter(
                fk_contact_id=OuterRef("pk"),
                fk_user_id=user.id,
                note_id__isnull=False  # Ensure note_id exists
            ).exclude(
                content__icontains="You added"  # Exclude system-generated text
            ).values('fk_contact_id').annotate(
                latest=Max('timestamp')
            ).values('latest')

            # 2. Filter contacts
            eligible_contacts = (
                Contact.objects.filter(
                    owner=user,
                    is_archived=False,
                    date_added__lte=seven_days_ago #7 days minimum old contact
                )
                .exclude(email="nikhil@nsgcrm.com")
                .annotate(last_real_action_at=Subquery(real_activity_subquery))
                .filter(
                    # CONDITION A: No real action in the last 15 days
                    Q(last_real_action_at__isnull=True) |
                    Q(last_real_action_at__lte=fifteen_days_ago)
                )
                .filter(
                    # CONDITION B: No re-engagement email sent in the last 7 days
                    Q(last_reengagement_sent_at__isnull=True) |
                    Q(last_reengagement_sent_at__lte=seven_days_ago)
                )
                .order_by("last_reengagement_sent_at", "-date_added")[:3]
            )

            if not eligible_contacts.exists():
                continue

            contacts_data = []
            for contact in eligible_contacts:
                contacts_data.append({
                    "name": contact.name,
                    "url": f"https://nsgcrm.com/contact/{contact.public_id}-{contact.slug}/"
                })

                contact.last_reengagement_sent_at = now
                contact.save(update_fields=["last_reengagement_sent_at"])
            contact_count = eligible_contacts.model.objects.filter(
                owner=user,
                is_archived=False
            ).count()

            properties = {
                "contacts": contacts_data,
                "contact_count": contact_count,
            }

            try:
                trigger_event("contact", user.id, properties)

                user.last_reengagement_email_sent_at = now
                user.save(update_fields=["last_reengagement_email_sent_at"])
                self.stdout.write(self.style.SUCCESS(f"User {user.id} matched: {[c['name'] for c in contacts_data]}"))
                total_sent += 1
                # time.sleep(0.55)

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error for user {user.id}: {str(e)}"))

        self.stdout.write(self.style.SUCCESS(f"Total users processed: {total_sent}"))

