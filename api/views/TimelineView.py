from api.models.NoteReminder import NoteReminderImage
from api.views.Services import get_user_from_token
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from api.serializers import TimelineSerializer
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import viewsets, status
from datetime import datetime
from api.models import *

class TimelineView(viewsets.GenericViewSet):
    serializer_class = TimelineSerializer
    queryset = Timeline.objects.all()

    @action(methods=["POST"], detail=False)
    def get_timeline(self, request):
        try:
            user = get_user_from_token(request)
            # 1. FIX: Changed request.data('key') to request.data.get('key')
            contact_id = request.data.get('contact_id')
            potential_contact_id = request.data.get('potential_contact_id')

            # 2. FIX: Handle logic for both Contact and PotentialContact
            contact = None
            if contact_id:
                id_validator = RegexValidator(regex=r'^\d{1,10}$', message='Invalid Id format.')
                try:
                    id_validator(str(contact_id))
                    contact = Contact.objects.filter(id=contact_id, owner=user).first()
                except ValidationError:
                    return Response({'message': 'Invalid Id format'}, status=status.HTTP_400_BAD_REQUEST)

            if not contact and potential_contact_id:
                contact = PotentialContact.objects.filter(id=potential_contact_id, owner=user).first()

            if not contact:
                return Response({'message': 'Contact not found'}, status=status.HTTP_404_NOT_FOUND)

            # 3. FIX: Handle filter for both model types in Timeline
            # Using a Q object is cleaner if you want to support both types of FKs
            if isinstance(contact, Contact):
                timelines = Timeline.objects.filter(fk_user=user, fk_contact=contact).order_by('-timestamp')
            else:
                timelines = Timeline.objects.filter(fk_user=user, fk_potential_contact=contact).order_by('-timestamp')

            data = []
            for timeline in timelines:
                entry = {
                    "action_type": timeline.action_type,
                    "timestamp": timeline.timestamp.replace(tzinfo=None) if timeline.timestamp else None,
                }

                # --- NOTES & REMINDERS ---
                # Shared logic for note/reminder lookup
                target_id = timeline.note_id or timeline.reminder_id
                if target_id and timeline.action_type in ["note", "note_reminder", "reminder"]:
                    reminder = NoteReminder.objects.filter(id=target_id).first()
                    if reminder:
                        note_images = NoteReminderImage.objects.filter(fk_note_reminder=reminder.id)
                        images = [img.image.url for img in note_images] if note_images else []

                        note_data = {
                            "id": reminder.id,
                            "text": reminder.note_text,
                            "image": images,
                            "datetime": reminder.reminder_datetime.replace(
                                tzinfo=None) if reminder.reminder_datetime else None,
                            "editable": reminder.editable,
                            "updated": reminder.date_created.replace(microsecond=0) != reminder.date_updated.replace(
                                microsecond=0),
                            "icon": timeline.action_type
                        }
                        entry["note_reminder"] = note_data

                # --- CALLS ---
                elif timeline.action_type == "call":
                    entry.update({
                        "call": contact.phone if contact.phone else "N/A",
                        "icon": timeline.action_type
                    })

                # --- MEETINGS ---
                if timeline.meeting_id:
                    # Based on your previous models, meeting_id is usually Appointment.id
                    appointment = Appointment.objects.filter(appointment_id=timeline.meeting_id).first()
                    if appointment:
                        meeting_status = "Scheduled"
                        if appointment.status == 'deleted' or appointment.deleted_at:
                            meeting_status = "Canceled"
                        elif appointment.reschedule_time:
                            meeting_status = "Rescheduled"

                        entry['meeting_details'] = {
                            "appointment_id": appointment.appointment_id,
                            "timestamp": f"{appointment.appointment_date} {appointment.appointment_time}",
                            "subject": appointment.appointment_name,
                            "meet_link": appointment.meet_link,
                            "meeting_status": meeting_status,
                            "icon": timeline.action_type,
                            "duration": appointment.duration
                        }

                # --- EMAILS ---
                if timeline.email_id:
                    email = Email.objects.filter(email_id=timeline.email_id).first()
                    if email:
                        entry["email"] = {
                            "id": email.email_id,
                            "sent_date": email.sent_date,
                            "subject": email.subject,
                            "body": f'Hello {contact.name}, \n\n{email.body}',
                            "icon": timeline.action_type
                        }

                data.append(entry)

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def add_call_timeline(self, request):
        try:
            user = get_user_from_token(request)
            contact_id = request.data['contact_id']
            id_validator = RegexValidator(
                regex=r'^\d{1,6}$',
                message='Invalid Id format.'
            )

            try:
                id_validator(contact_id)
            except ValidationError:
                return Response({'message': 'Invalid Id format'},
                                status=status.HTTP_400_BAD_REQUEST)
            contact = Contact.objects.filter(id=contact_id, owner=user).first()
            timeline = Timeline.objects.create(
                action_type="call",
                fk_user=user,
                fk_contact=contact,
                content="Call made"
            )
            return Response({"message": "Call Added",
                             "timeline_id": timeline.id,
                             "phone": contact.phone,
                             "additional_phone": contact.additional_phone}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def get_emails_by_user_and_contact(self, request):
        try:
            user_id = 2
            contact_id = 1693

            # Validate input parameters
            if not user_id or not contact_id:
                return Response(
                    {'message': 'user_id and contact_id are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Fetch user and contact
            user = User.objects.filter(id=user_id).first()
            contact = Contact.objects.filter(id=contact_id).first()

            if not user:
                return Response(
                    {'message': f'User with id {user_id} not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            if not contact:
                return Response(
                    {'message': f'Contact with id {contact_id} not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Fetch emails sent by the user to the contact
            emails = Email.objects.filter(fk_user=user, recipients=contact).order_by('-sent_date')
            email_list = []
            for email in emails:
                email_list.append({
                    "id": email.email_id,
                    "sent_date": email.sent_date,
                    "subject": email.subject,
                    "body": email.body,
                    "thread_link": email.thread_link,
                    "status": email.status,
                    "is_bulk": email.is_bulk,
                })

            return Response(email_list, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
