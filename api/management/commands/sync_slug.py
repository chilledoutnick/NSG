from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from api.models import Profiles, ProfileContactInfo

User = get_user_model()


class Command(BaseCommand):
    help = "Add default contact info for users and profiles if missing"

    def handle(self, *args, **kwargs):

        users_fixed = 0
        profiles_fixed = 0

        # -------- USERS --------
        for user in User.objects.all():

            if not user.main_contact_infos.exists():

                contacts = []

                if user.email:
                    contacts.append(
                        ProfileContactInfo(
                            fk_user=user,
                            contact_type="email",
                            value=user.email,
                            label="office"
                        )
                    )

                if hasattr(user, "phone") and user.phone:
                    contacts.append(
                        ProfileContactInfo(
                            fk_user=user,
                            contact_type="phone",
                            value=user.phone,
                            label="office"
                        )
                    )

                if contacts:
                    ProfileContactInfo.objects.bulk_create(contacts)
                    users_fixed += 1

        # -------- PROFILES --------
        for profile in Profiles.objects.select_related("fk_user"):

            if not profile.contact_infos.exists():

                user = profile.fk_user
                contacts = []

                if user.email:
                    contacts.append(
                        ProfileContactInfo(
                            fk_profile=profile,
                            contact_type="email",
                            value=user.email,
                            label="office"
                        )
                    )

                if hasattr(user, "phone") and user.phone:
                    contacts.append(
                        ProfileContactInfo(
                            fk_profile=profile,
                            contact_type="phone",
                            value=user.phone,
                            label="office"
                        )
                    )

                if contacts:
                    ProfileContactInfo.objects.bulk_create(contacts)
                    profiles_fixed += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Users fixed: {users_fixed} | Profiles fixed: {profiles_fixed}"
            )
        )