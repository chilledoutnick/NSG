from django.core.exceptions import ValidationError
from django.db import models
from api.models import Contact, Tag

class ContactTag(models.Model):
    fk_contact = models.ForeignKey("Contact", on_delete=models.CASCADE)
    fk_tag = models.ForeignKey("Tag", on_delete=models.CASCADE)
    position = models.PositiveIntegerField()  # Position of the tag in the order (1 for the first tag, etc.)

    class Meta:
        unique_together = ('fk_contact', 'fk_tag')

    def save(self, *args, **kwargs):
        # Ensure the first tag is either 'Business card' or 'Manually added'
        # if self.position == 1 and self.fk_tag.name not in ["Business Card", "Manually Added"]:
        #     raise ValidationError("First tag must be 'Business Card' or 'Manually Added'.")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.fk_contact.name} - {self.fk_tag.name} (Position {self.position})"
