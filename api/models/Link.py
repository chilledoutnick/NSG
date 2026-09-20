from django.db import models
from api.models import User


class UserLink(models.Model):
    fk_user = models.ForeignKey('User', on_delete=models.CASCADE, null=True, blank=True)
    fk_profile = models.ForeignKey('Profiles', on_delete=models.CASCADE, null=True, blank=True)

    link = models.URLField()
    title = models.CharField(max_length=500, default="")
    description = models.CharField(max_length=1000, null=True, blank=True, default="")
    sorting_id = models.IntegerField(default=1)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                        (models.Q(fk_user__isnull=False) & models.Q(fk_profile__isnull=True)) |
                        (models.Q(fk_user__isnull=True) & models.Q(fk_profile__isnull=False))
                ),
                name="only_one_of_user_or_profile"
            )
        ]