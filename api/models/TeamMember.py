from django.db import models

from api.models import User


class TeamMember(models.Model):
    team_member_id = models.AutoField(primary_key=True)
    fk_user_member = models.ForeignKey("User",  on_delete=models.CASCADE, related_name='members', db_constraint=False)
    fk_user = models.ForeignKey("User",  on_delete=models.CASCADE, related_name='users', db_constraint=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['fk_user_member', 'fk_user'], name='unique_member_user')

        ]

    def __str__(self):
        return f"{self.fk_user_member} - {self.fk_user}"
