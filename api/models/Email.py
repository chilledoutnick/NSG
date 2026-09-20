from django.core.exceptions import ValidationError
from django.db import models
from api.models import Contact, User, PotentialContact


class Email(models.Model):
    email_id = models.AutoField(primary_key=True)
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE, related_name='emails')
    subject = models.CharField(max_length=255)
    body = models.TextField()  # Use TextField for larger content
    thread_link = models.URLField(blank=True, null=True)
    recipients = models.ManyToManyField("Contact", related_name='emails')
    sent_date = models.DateTimeField(auto_now_add=True)  # Automatically set the date when created
    status = models.CharField(max_length=20, choices=[('sent', 'Sent'), ('failed', 'Failed')], default='sent')
    is_bulk = models.BooleanField(default=False)  # Indicate if it's a bulk email
    # Email model
    external_id = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    fk_thread = models.ForeignKey(
    "api.Thread",
    on_delete=models.CASCADE,
    null=True,
    blank=True,
    related_name="emails"
)
    from_email = models.EmailField(null=True)
    to_email = models.TextField(null=True)
    is_read = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)

    provider = models.CharField(max_length=20)  # gmail / outlook

    last_synced_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Email from {self.fk_user.username} to {self.recipients.count()} contacts - Subject: {self.subject}"


class Thread(models.Model):
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE)

    thread_id = models.CharField(max_length=255)

    # Either one of these can be set
    potential_contact = models.ForeignKey(
        "api.PotentialContact",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="threads"
    )

    contact = models.ForeignKey("Contact",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="threads"
    )

    last_message_at = models.DateTimeField(auto_now=True)
    body_snippet = models.CharField(max_length=500, blank=True, null=True)
    body_storage_url = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ("fk_user", "thread_id")

    def clean(self):
        if self.contact and self.potential_contact:
            raise ValidationError("Thread cannot have both contact and potential_contact")

        if not self.contact and not self.potential_contact:
            raise ValidationError("Thread must have at least one contact reference")