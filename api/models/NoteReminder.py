from api.models import Contact, User
from django.utils import timezone
from django.db import models

from api.models.Services import notes_upload_path


class NoteReminder(models.Model):
    fk_contact = models.ForeignKey("Contact", on_delete=models.CASCADE, related_name='notes_reminders')
    fk_user = models.ForeignKey("User", on_delete=models.CASCADE)  # User who created the note/reminder

    # Status: 0 = deleted, 1 = active
    note_text = models.TextField(null=True, blank=True)  # Text for the note (optional)
    reminder_text = models.CharField(max_length=255, null=True, blank=True)  # Reminder description (optional)
    reminder_datetime = models.DateTimeField(null=True, blank=True)  # Date and time for the reminder (optional)

    note_status = models.IntegerField(choices=[(-1, 'Not Added'), (0, 'Deleted'), (1, 'Active')], default=-1)  # Soft delete status for note if note exist then 1
    reminder_status = models.IntegerField(choices=[(-1, 'Not Added'), (0, 'Deleted'), (1, 'Active')], default=-1)  # Soft delete status for reminder if reminder exist then 1

    date_created = models.DateTimeField(auto_now_add=True)  # When the entry was created
    date_updated = models.DateTimeField(auto_now=True)  # When the entry was last updated
    date_deleted = models.DateTimeField(null=True, blank=True)  # When the entry was deleted (if applicable)

    # images = models.JSONField(null=True, blank=True)  # Store image paths as a JSON array

    uploaded_at = models.DateTimeField(auto_now_add=True)
    editable = models.IntegerField(choices=[(0, 'False'), (1, 'True')], default=1)  # Soft delete status for note



    def delete_note(self):
        """Soft delete the note by changing the status to 'Deleted'."""
        self.note_status = 0
        self.date_deleted = timezone.now()
        self.save()

    def delete_reminder(self):
        """Soft delete the reminder by changing the status to 'Deleted'."""
        self.reminder_status = 0
        self.date_deleted = timezone.now()
        self.save()

    def is_deleted(self):
        """Check if both note and reminder are deleted."""
        return self.note_status == 0 and self.reminder_status == 0

    def __str__(self):
        return f"NoteReminder for {self.contact.name} by {self.user.username}"

class NoteReminderImage(models.Model):
    fk_note_reminder = models.ForeignKey("NoteReminder", related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to=notes_upload_path)  # Path in S3 bucket

    def __str__(self):
        return f"Image for NoteReminder {self.note_reminder.id}"