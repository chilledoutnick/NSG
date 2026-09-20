from django.db import models

from api.models.Profiles import Profiles
from api.models.User import User

class ProfileLayout(models.Model):
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE, null=True, blank=True, related_name="user_layout"
    )
    fk_profile = models.ForeignKey("Profiles", on_delete=models.CASCADE, null=True, blank=True, related_name="profile_layout"
    )

    sections_order = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(fk_user__isnull=False, fk_profile__isnull=True)
                    | models.Q(fk_user__isnull=True, fk_profile__isnull=False)
                ),
                name="only_one_fk_must_exist",
            )
        ]

    def __str__(self):
        return f"Layout for {self.fk_user or self.fk_profile}"
