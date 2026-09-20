from django.db import models
from django.utils import timezone

from api.models import Contact, User
from api.models.PotentialContact import PotentialContact


class Timeline(models.Model):
    ACTION_CHOICES = [
        ('add', 'Add'),
        ('update', 'Update'),
        ('archive', 'Archive'),
        ('email', 'Email'),
        ('schedule_meeting', 'Schedule Meeting'),
        ('reschedule_meeting', 'Reschedule Meeting'),
        ('delete_meeting', 'Delete Meeting'),
        ('note', 'Note'),
        ('reminder', 'Reminder'),
        ('note_reminder', "Note Reminder"),
        ('tag', 'Tag/Label Change'),
        ('restore', 'Restore'),
        ('call', 'Call'),
        # Add other actions here
    ]

    fk_contact = models.ForeignKey("Contact", on_delete=models.CASCADE, related_name='activities', null=True,
        blank=True)
    fk_user = models.ForeignKey("User", on_delete=models.SET_NULL, null=True, blank=True)  # User who performed the action
    action_type = models.CharField(max_length=20, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(default=timezone.now)
    content = models.TextField()  # Description or details of the action

    # Additional fields for related IDs
    email_id = models.IntegerField(null=True, blank=True)  # For email actions
    note_id = models.IntegerField(null=True, blank=True)  # For notes
    reminder_id = models.IntegerField(null=True, blank=True)  # For reminders
    meeting_id = models.IntegerField(null=True, blank=True)  # For meetings
    tag_id = models.IntegerField(null=True, blank=True)  # For tags
    fk_potential_contact = models.ForeignKey("PotentialContact",on_delete=models.CASCADE,null=True,blank=True,
                                             related_name='timeline'
    )

    def __str__(self):
        return f"{self.fk_contact.name} - {self.action_type} at {self.timestamp}"
