from django.db import models
from api.models import User

class ProfileVisit(models.Model):
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE, null=True, blank=True)
    fk_profile = models.ForeignKey('Profiles', on_delete=models.CASCADE, null=True, blank=True)
    session_key = models.CharField(max_length=40)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    (models.Q(fk_user__isnull=False) & models.Q(fk_profile__isnull=True)) |
                    (models.Q(fk_user__isnull=True) & models.Q(fk_profile__isnull=False))
                ),
                name='only_one_of_user_or_profile_visit'
            ),
            models.UniqueConstraint(
                fields=['session_key', 'fk_user', 'ip_address'],
                name='unique_user_visit'
            ),
            models.UniqueConstraint(
                fields=['session_key', 'fk_profile', 'ip_address'],
                name='unique_profile_visit'
            )
        ]

    def __str__(self):
        if self.fk_user:
            return f"Visit by User {self.fk_user.username} from {self.ip_address}"
        elif self.fk_profile:
            return f"Visit on Profile {self.fk_profile.username} from {self.ip_address}"
        return f"Anonymous visit from {self.ip_address}"