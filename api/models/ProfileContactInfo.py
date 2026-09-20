from django.core.exceptions import ValidationError
from django.db import models


class ProfileContactInfo(models.Model):

    CONTACT_TYPE_CHOICES = (
        ("phone", "Phone"),
        ("email", "Email"),
    )

    LABEL_CHOICES = (
        ("home", "Home"),
        ("office", "Office"),
        ("mobile", "Mobile"),
        ("personal", "Personal"),
        ("work", "Work"),
        ("other", "Other"),
    )

    fk_user = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="main_contact_infos",
        null=True,
        blank=True
    )

    fk_profile = models.ForeignKey(
        "Profiles",
        on_delete=models.CASCADE,
        related_name="contact_infos",
        null=True,
        blank=True
    )

    contact_type = models.CharField(
        max_length=10,
        choices=CONTACT_TYPE_CHOICES
    )

    value = models.CharField(max_length=255)

    label = models.CharField(
        max_length=20,
        choices=LABEL_CHOICES,
        default="office"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        # Must have either user or profile
        if not self.fk_user and not self.fk_profile:
            raise ValidationError("Either fk_user or fk_profile must be set.")

        # Cannot have both
        if self.fk_user and self.fk_profile:
            raise ValidationError("Only one of fk_user or fk_profile can be set.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        owner = self.fk_profile.name if self.fk_profile else self.fk_user.username
        return f"{owner} - {self.contact_type} - {self.value}"