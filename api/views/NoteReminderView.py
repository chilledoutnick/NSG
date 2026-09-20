import pytz

from api.models.NoteReminder import NoteReminderImage
from api.views.Services import get_user_from_token, contact_image_upload_to, email_sender
from api.serializers import NoteReminderSerializer
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.utils.timezone import make_aware, now
from rest_framework.response import Response
from api.models import NoteReminder, Contact, Timeline, WorkingHour
from rest_framework.decorators import action
from rest_framework import viewsets, status
from datetime import datetime
import json

from api.views.suprsend_helpers import trigger_event


class NoteReminderView(viewsets.GenericViewSet):
    serializer_class = NoteReminderSerializer
    queryset = NoteReminder.objects.all()

    @action(methods=["POST"], detail=False)
    def add_note_reminder(self, request):

        try:
            # schedule_email_task()
            user = get_user_from_token(request)
            contact_ids = json.loads(request.data.get('contact_ids', []))
            reminder_datetime = request.data.get('reminder_datetime', None)
            note_text = request.data.get('note_text', '')
            countdown = request.data.get('countdown', "1")
            images = request.FILES.getlist('images')
            note_ids = []
            note_image = True if images else False
            n_images = []
            task = None
            note_reminder = None
            event = None

            # Convert reminder_datetime string to a timezone-aware datetime object
            if reminder_datetime:
                schedule_data = WorkingHour.objects.filter(fk_user_id=user.id, status='active')
                if schedule_data.exists():
                    user_timezone = schedule_data.first().timezone
                else:
                    user_timezone = "America/New_York"
                try:
                    tz = pytz.timezone(user_timezone)
                    reminder_datetime = make_aware(datetime.strptime(reminder_datetime, "%Y-%m-%d %H:%M:%S"), tz)
                except ValueError:
                    return Response({"message": "Invalid datetime format. Use 'YYYY-MM-DD HH:MM:SS'."},
                                    status=status.HTTP_400_BAD_REQUEST)
            action_message = ""

            for contact_id in contact_ids:
                contact = Contact.objects.filter(id=contact_id, owner=user).first()
                if not contact:
                    return Response({"message": "Contact not found or not owned by user."},
                                    status=status.HTTP_404_NOT_FOUND)

                # Create the NoteReminder instance
                note_reminder = NoteReminder.objects.create(
                    fk_contact=contact,
                    fk_user=user,
                    note_text=note_text,
                    reminder_datetime=reminder_datetime,
                    note_status=1 if (note_text or note_image) else -1,
                    reminder_status=1 if reminder_datetime else -1,
                    editable=1
                )
                for image in images:
                    note_images = NoteReminderImage.objects.create(
                        fk_note_reminder=note_reminder
                    )
                    note_images.image = contact_image_upload_to(image, contact)
                    note_images.save()
                    n_images.append(note_images.image.url)
                if note_text and reminder_datetime:
                    action_message = "NoteReminder"
                    Timeline.objects.create(
                        action_type="note_reminder",
                        content="note_reminder",
                        fk_user=user,
                        fk_contact=contact,
                        note_id=note_reminder.id,
                        reminder_id=note_reminder.id
                    )
                elif note_text or note_image:
                    action_message = "Note"
                    Timeline.objects.create(
                        action_type="note_reminder",
                        content="note_reminder",
                        fk_user=user,
                        fk_contact=contact,
                        note_id=note_reminder.id,
                    )
                else:
                    action_message = "note_reminder"
                    Timeline.objects.create(
                        action_type="note_reminder",
                        content="note_reminder",
                        fk_user=user,
                        fk_contact=contact,
                        reminder_id=note_reminder.id
                    )
                
                note_ids.append(note_reminder.id)
            if reminder_datetime and note_reminder:
                # title = "Reminder"
                body = "You've set an important reminder"
                if len(contact_ids) == 1:
                    contact1 = Contact.objects.filter(id=contact_ids[0], owner=user).first()
                    body = f"You have set an important reminder for {contact1.name}."
                    contact_url = f"https://nsgcrm.com/contact/{contact1.public_id}-{contact1.slug}/",
                elif len(contact_ids) == 2:
                    contact1 = Contact.objects.filter(id=contact_ids[0], owner=user).first()
                    contact2 = Contact.objects.filter(id=contact_ids[1], owner=user).first()
                    body = f"You have set a reminder for {contact1} and {contact2}."
                    contact_url = f"https://nsgcrm.com/contact/{contact1.public_id}-{contact1.slug}/",
                elif len(contact_ids) > 2:
                    contact1 = Contact.objects.filter(id=contact_ids[0], owner=user).first()
                    contact2 = Contact.objects.filter(id=contact_ids[1], owner=user).first()
                    body = f"You have set a reminder for {contact1}, {contact2} and  {len(contact_ids) - 2} others."
                    contact_url = f"https://nsgcrm.com/contact/{contact1.public_id}-{contact1.slug}/",
                iso_timestamp = reminder_datetime.isoformat()
                properties = {
                    "reminder_datetime": iso_timestamp,
                    "note_text": body,
                    "contact_url": contact_url
                }
                event = trigger_event("REMAINDER", user.id, properties)


            return Response({"message": f"{len(note_ids)} {action_message} created successfully.",
                             "note_reminder_ids": note_ids,
                             "note_images": n_images,
                             "task_id": task,
                             "suprsend_event": event
                             },
                            status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def update_note_reminder(self, request):
        try:
            user = get_user_from_token(request)
            note_reminder_id = request.data['note_reminder_id']
            event = None
            id_validator = RegexValidator(
                regex=r'^\d{1,6}$',
                message='Invalid Id format.'
            )
            try:
                id_validator(note_reminder_id)
            except ValidationError:
                return Response({'message': 'Invalid Id format'},
                                status=status.HTTP_400_BAD_REQUEST)

            note_reminder = NoteReminder.objects.filter(id=note_reminder_id, fk_user=user).first()
            if not note_reminder:
                return Response({"message": "NoteReminder not found or not owned by user."},
                                status=status.HTTP_404_NOT_FOUND)

            updated_fields = {}

            # Update reminder_datetime
            reminder_datetime = request.data.get('reminder_datetime', None)
            if reminder_datetime:
                schedule_data = WorkingHour.objects.filter(fk_user_id=user.id, status='active')
                if schedule_data.exists():
                    user_timezone = schedule_data.first().timezone
                else:
                    user_timezone = "America/New_York"
                try:
                    tz = pytz.timezone(user_timezone)
                    reminder_datetime = make_aware(datetime.strptime(reminder_datetime, "%Y-%m-%d %H:%M:%S"), tz)
                    note_reminder.reminder_datetime = reminder_datetime
                    note_reminder.reminder_status = 1
                    updated_fields['reminder_datetime'] = reminder_datetime

                    iso_timestamp = reminder_datetime.isoformat()
                    properties = {
                        "reminder_datetime": iso_timestamp,
                        "note_text": f"Reminder Updated for {note_reminder.fk_contact.name}",
                        "contact_url": f"/contact/{note_reminder.fk_contact.public_id}-{note_reminder.fk_contact.slug}/",

                    }
                    event = trigger_event("REMAINDER", user.id, properties)
                except ValueError:
                    return Response({"message": "Invalid datetime format. Use 'YYYY-MM-DD HH:MM:SS'."},
                                    status=status.HTTP_400_BAD_REQUEST)

            # Update note_text
            note_text = request.data.get('note_text', '')
            if "note_text" in request.data:
                note_reminder.note_text = note_text
                updated_fields['note_text'] = note_text
                note_reminder.note_status = 1

            note_image = []

            # Update images
            if "images" in request.data or "images" in request.FILES:
                # Fetch incoming image URLs from request data (if provided)
                incoming_image_urls = request.data.getlist('images', [])  # Fetch URLs as strings

                # Fetch existing images associated with the note reminder
                existing_images = NoteReminderImage.objects.filter(fk_note_reminder=note_reminder)
                existing_image_urls = [image.image.url for image in existing_images]

                # Identify images to delete (present in DB but not in incoming request)
                images_to_delete = [image for image in existing_images if image.image.url not in incoming_image_urls]

                # Delete images not in the incoming URLs
                for image in images_to_delete:
                    image.delete()  # Removes the image entry from the database

                # Retain images that are still valid
                note_image = [image.image.url for image in existing_images if image not in images_to_delete]

                # Handle newly uploaded files
                if "images" in request.FILES:
                    images = request.FILES.getlist('images')
                    contact = Contact.objects.filter(id=note_reminder.fk_contact_id).first()

                    for image in images:
                        # Save new image to NoteReminderImage
                        note_images = NoteReminderImage.objects.create(
                            fk_note_reminder=note_reminder
                        )
                        note_images.image = contact_image_upload_to(image, contact)
                        note_images.save()
                        note_image.append(note_images.image.url)

                    note_reminder.uploaded_at = now()  # Update the `uploaded_at` timestamp

                updated_fields['images'] = note_image

            else:
                existing_images = NoteReminderImage.objects.filter(fk_note_reminder=note_reminder)
                existing_images.delete()  # Deletes all images associated with the note reminder
                note_image = []  # Reset the note_image list
                updated_fields['images'] = note_image
                # Update date_update
            note_reminder.date_updated = now()
            updated_fields['date_updated'] = note_reminder.date_updated

            # Save updated model
            note_reminder.save()

            # Determine action message
            if note_text and reminder_datetime:
                action_message = "NoteReminder"
                timeline = Timeline.objects.filter(note_id=note_reminder.id, reminder_id=note_reminder.id).first()
                if timeline:
                    timeline.content = "Updated Reminder set at"
                    timeline.timestamp = now()
                    timeline.save()

            elif note_text or note_image:
                timeline = Timeline.objects.filter(note_id=note_reminder.id).first()
                action_message = "Note"
                if timeline:  # Check if timeline exists
                    timeline.timestamp = now()

            else:
                action_message = "Reminder"
                timeline = Timeline.objects.filter(reminder_id=note_reminder.id).first()

                if timeline:  # Check if timeline exists
                    timeline.content = "Updated Reminder set at"
                    timeline.timestamp = now()
                    timeline.save()



            return Response({
                "message": f"{action_message} updated successfully.",
                "note_reminder": note_reminder.id,
                "updated_fields": updated_fields,
                "suprsend_event": event,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def delete_note_reminder(self, request):
        try:
            user = get_user_from_token(request)
            note_reminder_id = request.data['note_reminder_id']
            id_validator = RegexValidator(
                regex=r'^\d{1,6}$',
                message='Invalid Id format.'
            )
            try:
                id_validator(note_reminder_id)
            except ValidationError:
                return Response({'message': 'Invalid Id format'},
                                status=status.HTTP_400_BAD_REQUEST)
            note_reminder = NoteReminder.objects.filter(id=note_reminder_id, fk_user=user).first()
            if not note_reminder:
                return Response({"message": "NoteReminder not found or not owned by user."},
                                status=status.HTTP_404_NOT_FOUND)

            # Determine action message
            note = Timeline.objects.filter(note_id=note_reminder.id).first()
            if note:
                note.delete()
            reminder = Timeline.objects.filter(reminder_id=note_reminder.id).first()
            if reminder:
                reminder.delete()
            note_reminder.delete()
            return Response({
                "message": "Note Reminder Deleted successfully.",
                "note_reminder": note_reminder_id,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def get_note_reminder(self, request):
        try:
            user = get_user_from_token(request)
            note_reminder_id = request.data['note_reminder_id']
            id_validator = RegexValidator(
                regex=r'^\d{1,6}$',
                message='Invalid Id format.'
            )

            # Validate the ID format
            try:
                id_validator(note_reminder_id)
            except ValidationError:
                return Response({'message': 'Invalid Id format'},
                                status=status.HTTP_400_BAD_REQUEST)

            # Fetch the NoteReminder object
            note_reminder = NoteReminder.objects.filter(id=note_reminder_id, fk_user=user).first()
            if not note_reminder:
                return Response({"message": "NoteReminder not found or not owned by user."},
                                status=status.HTTP_404_NOT_FOUND)

            # Fetch related images (assuming NoteReminderImage is the related model)
            images = NoteReminderImage.objects.filter(fk_note_reminder=note_reminder)
            image_urls = [image.image.url for image in images]  # Convert images to URLs

            # Construct the response
            return Response({
                "note_reminder": note_reminder.id,
                "images": image_urls,  # Send the image URLs
                "fk_contact_id": note_reminder.fk_contact_id,
                "fk_user_id": note_reminder.fk_user_id,
                "note_text": note_reminder.note_text,
                "reminder_datetime": note_reminder.reminder_datetime,
                "note_status": note_reminder.note_status,
                "reminder_status": note_reminder.reminder_status
            }, status=status.HTTP_200_OK)  # Use 200 OK for successful GET responses

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def multiple_note_reminder(self, request):
        try:
            user = get_user_from_token(request)
            contact_ids = json.loads(request.data.get('contact_ids', '[]'))
            reminder_datetime = request.data.get('reminder_datetime', None)
            note_text = request.data.get('note_text', '')
            images = request.FILES.getlist('images')

            # Convert reminder_datetime string to a timezone-aware datetime object
            if reminder_datetime:
                schedule_data = WorkingHour.objects.filter(fk_user_id=user.id, status='active')
                if schedule_data.exists():
                    user_timezone = schedule_data.first().timezone
                else:
                    user_timezone = "America/New_York"
                try:
                    tz = pytz.timezone(user_timezone)
                    reminder_datetime = make_aware(datetime.strptime(reminder_datetime, "%Y-%m-%d %H:%M:%S"), tz)
                except ValueError:
                    return Response({"message": "Invalid datetime format. Use 'YYYY-MM-DD HH:MM:SS'."},
                                    status=status.HTTP_400_BAD_REQUEST)

            note_reminders = []
            timelines = []
            note_ids = []

            # Iterate over contacts to prepare bulk data
            for contact_id in contact_ids:
                contact = Contact.objects.filter(id=contact_id, owner=user).first()
                if not contact:
                    # Skip invalid contacts
                    continue

                note_image = []
                for image in images:
                    uploaded_image_path = contact_image_upload_to(image, contact)
                    note_image.append(uploaded_image_path)

                # Create NoteReminder instance in memory
                note_reminder = NoteReminder(
                    fk_contact=contact,
                    fk_user=user,
                    note_text=note_text,
                    reminder_datetime=reminder_datetime,
                    images=note_image,
                    note_status=1 if (note_text or note_image) else -1,
                    reminder_status=1 if reminder_datetime else -1,
                    editable=1
                )
                note_reminders.append(note_reminder)

            # Bulk insert NoteReminder objects
            if note_reminders:
                NoteReminder.objects.bulk_create(note_reminders)

            # Create Timeline entries based on created NoteReminder IDs
            for note_reminder in note_reminders:
                if note_reminder.note_text and note_reminder.reminder_datetime:
                    action_type = "add"
                    content = "Note Upcoming Reminder"
                elif note_reminder.note_text or note_reminder.images:
                    action_type = "add_note"
                    content = "Note"
                else:
                    action_type = "add_reminder"
                    content = "Upcoming Reminder"

                timeline = Timeline(
                    action_type=action_type,
                    content=content,
                    fk_user=user,
                    fk_contact=note_reminder.fk_contact,
                    note_id=note_reminder.id if action_type in ["add", "add_note"] else None,
                    reminder_id=note_reminder.id if action_type in ["add", "add_reminder"] else None,
                )
                timelines.append(timeline)
                note_ids.append(note_reminder.id)

            # Bulk insert Timeline objects
            if timelines:
                Timeline.objects.bulk_create(timelines)

            if not note_ids:
                return Response({"message": "No valid contacts found."}, status=status.HTTP_400_BAD_REQUEST)

            return Response({"message": f"{len(note_ids)} notes/reminders created successfully.",
                             "note_reminder_ids": note_ids},
                            status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
