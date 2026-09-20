import time

from django.forms import ValidationError
from django.shortcuts import get_object_or_404

from api.views.Services import get_user_from_token, alphabet_color, contact_image_upload_to, \
    validate_phone, get_user_from_request
from api.serializers import ContactSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from django.utils.timezone import now
from django.core.validators import *
from collections import defaultdict
from api.models import *
from api.models.Contact import ContactShare
import datetime
import json
import csv
import io
import pandas as pd
from django.utils.text import slugify
from django.db.models import Q, Count, Exists, OuterRef
from api.views.suprsend_helpers import trigger_event
from django.utils import timezone
from datetime import timedelta
from functools import reduce
import operator

class ContactView(viewsets.GenericViewSet):

    @action(methods=['post'], detail=False)
    def create_contact(self, request):
        try:
            
            email = request.data['email']

            try:
                validate_email(email)
            except ValidationError:
                return Response({'message': 'Invalid email format'},
                                status=status.HTTP_400_BAD_REQUEST)

            username = request.data.get('username')
            if not username:
                user = get_user_from_token(request)
            else:
                user = User.objects.filter(username=username).first()
                if not user:
                    profile = Profiles.objects.filter(username=username).first()
                    if not profile:
                        return Response({"message": "User not Found"}, status=status.HTTP_400_BAD_REQUEST)
                    user = profile.fk_user

            existing_contact = Contact.objects.filter(email=email, owner=user).first()
            if existing_contact:
                if existing_contact.is_archived:
                    return Response({'message': 'This contact is already archived'},
                                    status=status.HTTP_502_BAD_GATEWAY)

                existing_contact.save()
                appointment = AdvisorAppointment.objects.select_related('fk_appointment').filter(
                    fk_user_id=user.id,
                    fk_appointment__fk_contact=existing_contact.id,
                    status__in=['active', 1]
                ).order_by(
                    '-fk_appointment__appointment_date', '-fk_appointment__appointment_time'
                ).first()

                # Fetch the latest reminder
                reminder = NoteReminder.objects.filter(
                    fk_contact_id=existing_contact.id, fk_user=user, reminder_status=1
                ).order_by('reminder_datetime').first()

                # Get the current date and time
                current_time = now()

                # Check if the appointment is in the future
                if appointment and appointment.fk_appointment.appointment_date >= current_time.date() and (
                        appointment.fk_appointment.appointment_time >= current_time.time()):
                    # Check if the reminder is in the future
                    if reminder and reminder.reminder_datetime >= current_time:
                        # Compare the two and decide which is earlier
                        if appointment.fk_appointment.appointment_date < reminder.reminder_datetime.date() or \
                                (appointment.fk_appointment.appointment_date == reminder.reminder_datetime.date() and
                                 appointment.fk_appointment.appointment_time < reminder.reminder_datetime.time()):
                            upcoming = "Meeting"
                        else:
                            upcoming = "Reminder"
                    else:
                        upcoming = "Meeting"
                elif reminder and reminder.reminder_datetime >= current_time:
                    upcoming = "Reminder"
                else:
                    upcoming = "Nothing yet"
                contact_tag = ContactTag.objects.filter(fk_contact=existing_contact).order_by('position').values(
                    'fk_tag__name', "fk_tag__color")
                contact_data = {
                    "contact_id": existing_contact.id,
                    "name": existing_contact.name,
                    "image": existing_contact.image.url if existing_contact.image else None,
                    "image_color": existing_contact.pfp_color,
                    "tags": [{"name": tag['fk_tag__name'], "color": tag['fk_tag__color']} for tag in contact_tag],
                    "priority": existing_contact.priority,
                    "upcoming": upcoming,
                    "date_added": existing_contact.date_added,
                    "phone": existing_contact.phone,
                    "email": existing_contact.email,
                    "generated_text": existing_contact.generated_text,
                    "contact_url": f"/contact/{existing_contact.public_id}-{existing_contact.slug}/",
                    "message": "Contact already exists"
                }

            else:

                name = request.data['name']
                if not name:
                    return Response({'message': 'Name can not be Empty'},
                                    status=status.HTTP_400_BAD_REQUEST)

                additional_email = request.data.get("additional_email", "")
                phone = request.data.get('phone', '')
                additional_phone = request.data.get("additional_phone", "")
                address = request.data.get('address', '')
                tags = request.data.get('tags', 'Manually Added')
                pictures = request.FILES.get('pictures')
                is_profile_pic = request.data.get('is_profile_pic', "false").strip().lower() == "true"
                birthday = request.data.get('birthday', None)
                about = request.data.get('about', '')
                designation = request.data.get('designation', '')
                company = request.data.get('company', '')
                priority = request.data.get('priority', '')
                social_links = request.data.get('social_links', "")
                added_tags = []
                user_profile = User.objects.filter(email=email).first()
                try:
                    phone = validate_phone(phone)
                except ValidationError as e:
                    return Response({'message': e.message},
                                    status=status.HTTP_400_BAD_REQUEST)
                try:
                    additional_phone = validate_phone(additional_phone)
                except ValidationError as e:
                    return Response({'message': e.message},
                                    status=status.HTTP_400_BAD_REQUEST)
                contact = Contact.objects.create(
                    email=email,
                    name=name,
                    phone=phone,
                    address=address,
                    owner=user,
                    additional_email=additional_email,
                    additional_phone=additional_phone,
                    is_profile_pic=is_profile_pic,
                    about=about,
                    designation=designation,
                    company=company,
                    priority=priority,
                    social_links=social_links.split(","),
                    date_added=datetime.datetime.now(),
                    pfp_color=alphabet_color(name.strip()[0].upper()),
                    user_profile=user_profile,
                    is_user=1 if user_profile else 0
                )

                if pictures:
                    contact.image = contact_image_upload_to(pictures, contact)
                    if is_profile_pic:
                        contact.profile_pic = contact_image_upload_to(pictures, contact)
                if birthday and birthday != "null":
                    contact.birthday = birthday
                contact.generated_text = f"""{contact.name} was added to contacts on {contact.date_added.strftime(
                '%d %B %Y')}"""

                contact.save()
                for idx, tag in enumerate(tags.split(",")):
                    print(tag, idx)
                    tag_obj = Tag.objects.filter(name=tag).first()
                    ContactTag.objects.create(fk_contact=contact, fk_tag=tag_obj,
                                              position=1 if (tag == 'Manually Added' or tag == "Business Card") else (
                                                          idx + 1))
                    added_tags.append({"name": tag,
                                       "color": tag_obj.color})

                note = NoteReminder.objects.create(
                    fk_contact=contact,
                    fk_user=user,
                    note_text=f"You added {contact.name} in your Contact",
                    note_status=1,
                    editable=0

                )
                Timeline.objects.create(
                    action_type="note",
                    content="contact",
                    fk_user=user,
                    fk_contact=contact,
                    note_id=note.id
                )
                #notification
                variant = user.id % 3
                properties = {
                    "contact_name": contact.name,
                    "email": contact.email,
                    "phone": contact.phone,
                    "contact_url": f"https://nsgcrm.com/contact/{contact.public_id}-{contact.slug}/",
                    "variant": variant, 
                    "user_id": user.id,

                    "count": 1,
                }
                event = trigger_event("ab-testing", user.id, properties)

                contact_data = {
                    "contact_id": contact.id,
                    "name": contact.name,
                    "image": contact.image.url if contact.image else None,
                    "image_color": contact.pfp_color,
                    "is_profile_pic": contact.is_profile_pic,
                    "tags": added_tags,
                    "priority": contact.priority,
                    "upcoming": "Nothing yet",
                    "date_added": contact.date_added,
                    "phone": contact.phone,
                    "email": contact.email,
                    "generated_text": contact.generated_text,
                    "notification_event": event,
                    "contact_url": f"/contact/{contact.public_id}-{contact.slug}/",
                    "message": "Contact created successfully"

                }

            return Response(contact_data)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['post'], detail=False)
    def get_contact_data(self, request):
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
            contact_tag = ContactTag.objects.filter(fk_contact=contact).order_by('position').values('fk_tag__name',
                                                                                                    'fk_tag__color')
            contact_data = {
                "contact_id": contact.id,
                "email": contact.email,
                "name": contact.name,
                "phone": contact.phone,
                "address": contact.address,
                "owner_id": contact.owner_id,
                "additional_email": contact.additional_email,
                "additional_phone": contact.additional_phone,
                "is_profile_pic": contact.is_profile_pic,
                "about": contact.about,
                "designation": contact.designation,
                "company": contact.company,
                "priority": contact.priority,
                "social_links": contact.social_links,
                "date_added": contact.date_added,
                "image_color": contact.pfp_color,
                "image": contact.image.url if contact.image else None,
                "birthday": contact.birthday,
                "generated_text": contact.generated_text,
                "contact_url": f"/contact/{contact.public_id}-{contact.slug}/",
                "tags": [{"name": tag['fk_tag__name'], "color": tag['fk_tag__color']} for tag in contact_tag],
            }

            return Response(data=contact_data)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def contact_log(self, request):
        try:
            user = get_user_from_token(request)
            limit = request.data.get('limit', 20)  # Default limit
            offset = request.data.get('offset', 0)  # Default offset
            desc = request.data.get('desc', False)  # Default is False (ascending order)

            # Determine ordering based on 'desc' parameter
            ordering = 'date_added' if desc else '-date_added'

            # Fetch contacts
            contacts = Contact.objects.filter(owner=user, is_archived=False).order_by(ordering)[offset:offset + limit]

            # Serialize contacts
            serialized_contacts = ContactSerializer(contacts, many=True).data

            # Fetch related tags for each contact
            contact_ids = [contact['id'] for contact in serialized_contacts]
            contact_tags = ContactTag.objects.filter(fk_contact_id__in=contact_ids).select_related('fk_tag')
            print(len(contact_ids))
            # Build a mapping of contact_id to tags
            contact_tags_map = defaultdict(list)
            for contact_tag in contact_tags:
                # Ensure that the list for the contact_id is long enough to hold the tag at the correct position
                while len(contact_tags_map[contact_tag.fk_contact_id]) < contact_tag.position:
                    contact_tags_map[contact_tag.fk_contact_id].append(None)  # Add empty slots if needed

                # Insert the tag at the specified position
                contact_tags_map[contact_tag.fk_contact_id][contact_tag.position - 1] = {
                    "name": contact_tag.fk_tag.name,
                    "color": contact_tag.fk_tag.color}

            # Group contacts by date and include tags
            grouped_data = []
            for contact in serialized_contacts:

                # Get the "upcoming" status
                contact_id = contact['id']

                # Fetch the latest appointment
                appointment = AdvisorAppointment.objects.select_related('fk_appointment').filter(
                    fk_user_id=user.id,
                    fk_appointment__fk_contact_id=contact_id,
                    status__in=['active', 1],
                ).order_by(
                    'fk_appointment__appointment_date', 'fk_appointment__appointment_time'
                ).first()

                # Fetch the latest reminder
                reminder = NoteReminder.objects.filter(
                    fk_contact_id=contact_id, fk_user=user, reminder_status=1
                ).order_by('reminder_datetime').first()

                # Get the current date and time
                current_time = now()

                # Check if the appointment is in the future
                if appointment and appointment.fk_appointment.appointment_date >= current_time.date() and (
                        appointment.fk_appointment.appointment_time >= current_time.time()):
                    # Check if the reminder is in the future
                    if reminder and reminder.reminder_datetime >= current_time:
                        # Compare the two and decide which is earlier
                        if appointment.fk_appointment.appointment_date < reminder.reminder_datetime.date() or \
                                (appointment.fk_appointment.appointment_date == reminder.reminder_datetime.date() and
                                 appointment.fk_appointment.appointment_time < reminder.reminder_datetime.time()):
                            upcoming = "Meeting"
                            print(contact_id, "apt", appointment.advisor_appointment_id,
                                  appointment.fk_appointment.appointment_date,
                                  appointment.fk_appointment.appointment_time)
                        else:
                            upcoming = "Reminder"
                            print(contact_id, "reminder", reminder.id, reminder.reminder_datetime)
                    else:
                        upcoming = "Meeting"
                        print(contact_id, "apt", appointment.advisor_appointment_id,
                              appointment.fk_appointment.appointment_date,
                              appointment.fk_appointment.appointment_time)
                elif reminder and reminder.reminder_datetime >= current_time:
                    upcoming = "Reminder"
                    print(contact_id, "reminder", reminder.id, reminder.reminder_datetime)
                else:
                    upcoming = "Nothing yet"
                grouped_data.append({
                    "contact_id": contact["id"],
                    "name": contact["name"],
                    "image": contact.get("image", ""),  # Default to empty if not provided
                    "image_color": contact['pfp_color'],
                    "is_profile_pic": contact['is_profile_pic'],
                    "tags": contact_tags_map[contact['id']],  # Get tags for the contact
                    "priority": contact['priority'],
                    "upcoming": upcoming,  # Add upcoming status
                    "date_added": contact["date_added"],
                    "phone": contact["phone"],
                    "email": contact["email"],
                    "generated_text": contact["generated_text"],
                    "address": contact["address"],
                    "about": contact["about"],
                    "contact_url": f"/contact/{contact['public_id']}-{contact['slug']}/",

                })

            return Response(grouped_data)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def archived_contact_log(self, request):
        try:
            user = get_user_from_token(request)
            limit = request.data.get('limit', None)  # Default limit
            offset = request.data.get('offset', 0)  # Default offset
            desc = request.data.get('desc', False)  # Default is False (ascending order)

            ordering = 'date_added' if desc else '-date_added'
            # Fetch contacts
            if limit:
                contacts = Contact.objects.filter(owner=user, is_archived=True).order_by(ordering)[
                           offset:offset + int(limit)]
            else:
                # When limit is not provided, load all data
                contacts = Contact.objects.filter(owner=user, is_archived=True).order_by(ordering)
            print("Contacts:", len(contacts))
            # Serialize contacts
            serialized_contacts = ContactSerializer(contacts, many=True).data

            # Fetch related tags for each contact
            contact_ids = [contact['id'] for contact in serialized_contacts]
            contact_tags = ContactTag.objects.filter(fk_contact_id__in=contact_ids).select_related('fk_tag')

            # Build a mapping of contact_id to tags
            contact_tags_map = defaultdict(list)
            for contact_tag in contact_tags:
                # Ensure that the list for the contact_id is long enough to hold the tag at the correct position
                while len(contact_tags_map[contact_tag.fk_contact_id]) < contact_tag.position:
                    contact_tags_map[contact_tag.fk_contact_id].append(None)  # Add empty slots if needed

                # Insert the tag at the specified position
                contact_tags_map[contact_tag.fk_contact_id][contact_tag.position - 1] = {
                    "name": contact_tag.fk_tag.name,
                    "color": contact_tag.fk_tag.color}

            # Group contacts by date and include tags
            grouped_data = []
            for contact in serialized_contacts:
                # Get the "upcoming" status
                contact_id = contact['id']

                # Fetch the latest appointment
                appointment = AdvisorAppointment.objects.select_related('fk_appointment').filter(
                    fk_user_id=user.id,
                    fk_appointment__fk_contact_id=contact_id,
                    status__in=['active', 1],
                ).order_by(
                    'fk_appointment__appointment_date', 'fk_appointment__appointment_time'
                ).first()

                # Fetch the latest reminder
                reminder = NoteReminder.objects.filter(
                    fk_contact_id=contact_id, fk_user=user, reminder_status=1
                ).order_by('reminder_datetime').first()

                # Get the current date and time
                current_time = now()

                # Check if the appointment is in the future
                if appointment and appointment.fk_appointment.appointment_date >= current_time.date() and (
                        appointment.fk_appointment.appointment_time >= current_time.time()):
                    # Check if the reminder is in the future
                    if reminder and reminder.reminder_datetime >= current_time:
                        # Compare the two and decide which is earlier
                        if appointment.fk_appointment.appointment_date < reminder.reminder_datetime.date() or \
                                (appointment.fk_appointment.appointment_date == reminder.reminder_datetime.date() and
                                 appointment.fk_appointment.appointment_time < reminder.reminder_datetime.time()):
                            upcoming = "Meeting"
                        else:
                            upcoming = "Reminder"
                    else:
                        upcoming = "Meeting"
                elif reminder and reminder.reminder_datetime >= current_time:
                    upcoming = "Reminder"
                else:
                    upcoming = "Nothing yet"
                grouped_data.append({
                    "contact_id": contact["id"],
                    "name": contact["name"],
                    "image": contact.get("image", ""),  # Default to empty if not provided
                    "image_color": contact['pfp_color'],
                    "is_profile_pic": contact['is_profile_pic'],
                    "tags": contact_tags_map[contact['id']],  # Get tags for the contact
                    "priority": contact['priority'],
                    "upcoming": upcoming,  # Add upcoming status
                    "date_added": contact["date_added"],
                    "phone": contact["phone"],
                    "email": contact["email"],
                    "contact_url": f"/contact/{contact['public_id']}-{contact['slug']}/",


                })

            return Response(grouped_data)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def update_contact(self, request):
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
            if not contact:
                return Response({'message': 'Contact not found'})
            updated_fields = {}
            if ("email" in request.data) and (request.data['email'].strip() != ""):
                email = request.data['email'].strip()
                try:
                    validate_email(email)
                except ValidationError:
                    return Response({'message': 'Invalid email format'},
                                    status=status.HTTP_400_BAD_REQUEST)

                if contact.email != email and Contact.objects.filter(email=email, owner=user).exclude(
                        id=contact_id).exists():
                    return Response({"message": "Contact exists with this email"}, status=status.HTTP_400_BAD_REQUEST)

                contact.email = email
                updated_fields['email'] = contact.email
            if ("name" in request.data) and (request.data['name'] != ""):
                contact.name = request.data['name']
                updated_fields['name'] = contact.name
            if ("phone" in request.data) and (request.data['phone'] != ""):
                try:
                    phone = validate_phone(request.data['phone'])
                except ValidationError as e:
                    return Response({'message': e.message},
                                    status=status.HTTP_400_BAD_REQUEST)
                contact.phone = phone
                updated_fields['phone'] = contact.phone
            if ("address" in request.data) and (request.data['address'] != ""):
                contact.address = request.data['address']
                updated_fields['address'] = contact.address
            if ("additional_email" in request.data) and (request.data['additional_email'].strip() != ""):
                contact.additional_email = request.data['additional_email'].strip()
                updated_fields['additional_email'] = contact.additional_email
            if ("additional_phone" in request.data) and (request.data['additional_phone'] != ""):
                try:
                    additional_phone = validate_phone(request.data['additional_phone'])
                except ValidationError as e:
                    return Response({'message': e.message},
                                    status=status.HTTP_400_BAD_REQUEST)
                contact.additional_phone = additional_phone
                updated_fields['additional_phone'] = contact.additional_phone
            if ("birthday" in request.data) and (request.data['birthday'] != ""):
                birthday = request.data['birthday']
                if birthday and birthday != "null":
                    contact.birthday = birthday
                    updated_fields['birthday'] = contact.birthday
            if ("about" in request.data) and (request.data['about'] != ""):
                contact.about = request.data['about']
                updated_fields['about'] = contact.about
            if ("designation" in request.data) and (request.data['designation'] != ""):
                contact.designation = request.data['designation']
                updated_fields['designation'] = contact.designation
            if ("company" in request.data) and (request.data['company'] != ""):
                contact.company = request.data['company']
                updated_fields['company'] = contact.company
            if ("priority" in request.data) and (request.data['priority'] != ""):
                contact.priority = request.data['priority']
                updated_fields['priority'] = contact.priority

            if "social_links" in request.data:
                contact.social_links = request.data['social_links'].split(",")
                updated_fields['social_links'] = contact.social_links

            if ("generated_text" in request.data) and (request.data['generated_text'] != ""):
                contact.generated_text = request.data['generated_text']
                updated_fields['generated_text'] = contact.generated_text

            if "is_profile_pic" in request.data:
                is_profile_pic = request.data['is_profile_pic'].strip().lower() == "true"
                if is_profile_pic and contact.image:
                    contact.profile_pic = contact.image.url
                else:
                    contact.profile_pic = None
                contact.is_profile_pic = is_profile_pic
                updated_fields['is_profile_pic'] = contact.is_profile_pic
                updated_fields['profile_pic'] = contact.profile_pic

            if "pictures" in request.data:
                picture = request.FILES.get('pictures')
                if picture:
                    contact.image = contact_image_upload_to(picture, contact)
                    contact.save()
                    updated_fields['image'] = contact.image.url if contact.image else None

            if "tags" in request.data:

                incoming_tags = [tag.strip() for tag in request.data["tags"].split(",") if tag.strip()]

                # remove duplicates but keep order
                seen = set()
                incoming_tags = [t for t in incoming_tags if not (t in seen or seen.add(t))]

                # get valid tags (user tags + default system tags)
                valid_tags_qs = Tag.objects.filter(
                    Q(name__in=incoming_tags, fk_user=user) |
                    Q(name__in=incoming_tags, is_default=True)
                )

                valid_tag_names = set(valid_tags_qs.values_list("name", flat=True))

                invalid_tags = set(incoming_tags) - valid_tag_names
                if invalid_tags:
                    return Response(
                        {"message": f"Invalid tags: {', '.join(invalid_tags)}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Clear old tags
                ContactTag.objects.filter(fk_contact=contact).delete()

                # Add tags in order
                position = 1
                for tag_name in incoming_tags:
                    tag_obj = valid_tags_qs.filter(name=tag_name).first()
                    if tag_obj:
                        ContactTag.objects.create(
                            fk_contact=contact,
                            fk_tag=tag_obj,
                            position=position
                        )
                        position += 1

                updated_fields["tags"] = incoming_tags
            contact.updated_at = datetime.datetime.now()
            if not contact.image:
                contact.is_profile_pic = False
            contact.pfp_color = alphabet_color(contact.name.strip()[0].upper())
            contact.save()
            contact_tag = ContactTag.objects.filter(fk_contact=contact).order_by('position').values('fk_tag__name',
                                                                                                    'fk_tag__color')

            note = NoteReminder.objects.create(
                fk_contact=contact,
                fk_user=user,
                note_text="Contact Updated",
                note_status=1,
                editable=0

            )
            Timeline.objects.create(
                action_type="note",
                content="contact",
                fk_user=user,
                fk_contact=contact,
                note_id=note.id
            )
            # Fetch the latest appointment
            appointment = AdvisorAppointment.objects.select_related('fk_appointment').filter(
                fk_user_id=user.id,
                fk_appointment__fk_contact_id=contact_id,
                status__in=['active', 1],
            ).order_by(
                'fk_appointment__appointment_date', 'fk_appointment__appointment_time'
            ).first()

            # Fetch the latest reminder
            reminder = NoteReminder.objects.filter(
                fk_contact_id=contact_id, fk_user=user, reminder_status=1
            ).order_by('reminder_datetime').first()

            # Get the current date and time
            current_time = now()

            # Check if the appointment is in the future
            if appointment and appointment.fk_appointment.appointment_date >= current_time.date() and (
                    appointment.fk_appointment.appointment_time >= current_time.time()):
                # Check if the reminder is in the future
                if reminder and reminder.reminder_datetime >= current_time:
                    # Compare the two and decide which is earlier
                    if appointment.fk_appointment.appointment_date < reminder.reminder_datetime.date() or \
                            (appointment.fk_appointment.appointment_date == reminder.reminder_datetime.date() and
                             appointment.fk_appointment.appointment_time < reminder.reminder_datetime.time()):
                        upcoming = "Meeting"
                    else:
                        upcoming = "Reminder"
                else:
                    upcoming = "Meeting"
            elif reminder and reminder.reminder_datetime >= current_time:
                upcoming = "Reminder"
            else:
                upcoming = "Nothing yet"
            contact_data = [{
                "contact_id": contact.id,
                "name": contact.name,
                "image": contact.image.url if contact.image else None,
                "image_color": contact.pfp_color,
                "is_profile_pic": contact.is_profile_pic,
                "tags": [{"name": tag['fk_tag__name'], "color": tag['fk_tag__color']} for tag in contact_tag],
                "upcoming": upcoming,
                "priority": contact.priority,
                "date_added": contact.date_added,
                "phone": contact.phone,
                "email": contact.email,
                "generated_text": contact.generated_text,
                "contact_url": f"/contact/{contact.public_id}-{contact.slug}/",

            }]
            return Response({'message': 'Data Updated',
                             "updated_fields": updated_fields,
                             "data": contact_data
                             }, status=status.HTTP_202_ACCEPTED)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def update_priority(self, request):
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
            print(user.id)
            if not contact:
                return Response({'message': 'Contact not found'})
            contact.priority = request.data['priority']
            contact.save()

            note = NoteReminder.objects.create(
                fk_contact=contact,
                fk_user=user,
                note_text=f"{contact.priority} Priority Label Assigned",
                note_status=1,
                editable=0

            )
            Timeline.objects.create(
                action_type="note",
                content="priority",
                fk_user=user,
                fk_contact=contact,
                note_id=note.id
            )

            contact_tag = ContactTag.objects.filter(fk_contact=contact).order_by('position').values('fk_tag__name',
                                                                                                    'fk_tag__color')

            # Fetch the latest appointment
            appointment = AdvisorAppointment.objects.select_related('fk_appointment').filter(
                fk_user_id=user.id,
                fk_appointment__fk_contact_id=contact_id,
                status__in=['active', 1],
            ).order_by(
                'fk_appointment__appointment_date', 'fk_appointment__appointment_time'
            ).first()

            # Fetch the latest reminder
            reminder = NoteReminder.objects.filter(
                fk_contact_id=contact_id, fk_user=user, reminder_status=1
            ).order_by('reminder_datetime').first()

            # Get the current date and time
            current_time = now()

            # Check if the appointment is in the future
            if appointment and appointment.fk_appointment.appointment_date >= current_time.date() and (
                    appointment.fk_appointment.appointment_time >= current_time.time()):
                # Check if the reminder is in the future
                if reminder and reminder.reminder_datetime >= current_time:
                    # Compare the two and decide which is earlier
                    if appointment.fk_appointment.appointment_date < reminder.reminder_datetime.date() or \
                            (appointment.fk_appointment.appointment_date == reminder.reminder_datetime.date() and
                             appointment.fk_appointment.appointment_time < reminder.reminder_datetime.time()):
                        upcoming = "Meeting"
                    else:
                        upcoming = "Reminder"
                else:
                    upcoming = "Meeting"
            elif reminder and reminder.reminder_datetime >= current_time:
                upcoming = "Reminder"
            else:
                upcoming = "Nothing yet"
            contact_data = [{
                "contact_id": contact.id,
                "name": contact.name,
                "image": contact.image.url if contact.image else None,
                "image_color": contact.pfp_color,
                "is_profile_pic": contact.is_profile_pic,
                "tags": [{"name": tag['fk_tag__name'], "color": tag['fk_tag__color']} for tag in contact_tag],
                "upcoming": upcoming,
                "priority": contact.priority,
                "date_added": contact.date_added,
                "phone": contact.phone,
                "email": contact.email,
                "contact_url": f"/contact/{contact.public_id}-{contact.slug}/",

            }]

            return Response({'message': 'Priority Updated',
                             "data": contact_data
                             }, status=status.HTTP_202_ACCEPTED)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def delete_contact(self, request):
        try:
            user = get_user_from_token(request)
            contacts = request.data['contact_id']
            all_clear = request.data.get('all_clear', False)
            not_deleted = set()
            if all_clear:
                # Only delete archived contacts
                archived_contacts = Contact.objects.filter(owner=user, is_archived=True)
                archived_contacts.delete()  # Delete archived contacts

                # Add non-archived contacts to not_deleted
                non_archived_contacts = Contact.objects.filter(owner=user, is_archived=False)
                for contact in non_archived_contacts:
                    not_deleted.add(contact.id)
            else:
                for contact_id in contacts:
                    contact = Contact.objects.filter(id=contact_id).first()
                    if not contact or contact.owner_id != user.id:
                        return Response({'message': "No contact Found"})
                    if contact.is_archived:
                        Appointment.objects.filter(fk_contact_id=contact).delete()
                        contact.delete()
                    else:
                        not_deleted.add(contact_id)
            return Response({'message': f'Contacts deleted' if not not_deleted else "Some Contacts can not be deleted. "
                                                                                    "Please Archive them first",
                             'not_deleted': not_deleted
                             })
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def archive_contact(self, request):
        try:
            user = get_user_from_token(request)
            contact_ids = request.data['contact_id']
            all_clear = request.data.get('all_clear', False)
            if all_clear:
                # Archive all contacts for the user
                contacts = Contact.objects.filter(owner=user)
                for contact in contacts:
                    contact.is_archived = True
                    contact.save()
                    note = NoteReminder.objects.create(
                        fk_contact=contact,
                        fk_user=user,
                        note_text=f"You archived {contact.name}",
                        note_status=1,
                        editable=0

                    )
                    Timeline.objects.create(
                        action_type="note",
                        content="archived",
                        fk_user=user,
                        fk_contact=contact,
                        note_id=note.id
                    )

                return Response({'message': f'All Contacts Archived'})
            else:
                # Archive only the selected contacts
                not_found = []
                for contact_id in contact_ids:
                    try:
                        contact = Contact.objects.get(id=contact_id,
                                                      owner=user)  # Make sure contact belongs to the user
                        contact.is_archived = True
                        contact.save()
                        note = NoteReminder.objects.create(
                            fk_contact=contact,
                            fk_user=user,
                            note_text=f"You archived {contact.name}",
                            note_status=1,
                            editable=0

                        )
                        Timeline.objects.create(
                            action_type="note",
                            content="archived",
                            fk_user=user,
                            fk_contact=contact,
                            note_id=note.id
                        )
                    except Contact.DoesNotExist:
                        not_found.append(contact_id)  # If contact does not exist or not owned by user

                if not_found:
                    return Response({
                        'message': 'Some contacts were not found or do not belong to the user',
                        'not_found': not_found
                    })

                return Response({'message': f'Selected Contacts Archived'})
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def restore_contact(self, request):
        try:
            user = get_user_from_token(request)
            contact_ids = request.data['contact_id']
            all_clear = request.data.get('all_clear', False)
            if all_clear:
                # Archive all contacts for the user
                contacts = Contact.objects.filter(owner=user)
                for contact in contacts:
                    contact.is_archived = False
                    contact.save()

                    note = NoteReminder.objects.create(
                        fk_contact=contact,
                        fk_user=user,
                        note_text=f"You Restored {contact.name}",
                        note_status=1,
                        editable=0

                    )
                    Timeline.objects.create(
                        action_type="note",
                        content="restored",
                        fk_user=user,
                        fk_contact=contact,
                        note_id=note.id
                    )
                return Response({'message': f'All Contacts Restored'})
            else:
                # Archive only the selected contacts
                not_found = []
                for contact_id in contact_ids:
                    try:
                        contact = Contact.objects.get(id=contact_id,
                                                      owner=user)  # Make sure contact belongs to the user
                        contact.is_archived = False
                        contact.save()

                        note = NoteReminder.objects.create(
                            fk_contact=contact,
                            fk_user=user,
                            note_text=f"You Restored {contact.name}",
                            note_status=1,
                            editable=0
                        )
                        Timeline.objects.create(
                            action_type="note",
                            content="restored",
                            fk_user=user,
                            fk_contact=contact,
                            note_id=note.id
                        )

                    except Contact.DoesNotExist:
                        not_found.append(contact_id)  # If contact does not exist or not owned by user

                if not_found:
                    return Response({
                        'message': 'Some contacts were not found or do not belong to the user',
                        'not_found': not_found
                    })

                return Response({'message': f'Selected Contacts Restored'
                                 })
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def add_tag(self, request):
        try:
            user = get_user_from_token(request)
            tag = request.data['tag']
            color = request.data.get('color', "#493BB5")
            exist_tag = Tag.objects.filter(fk_user=user, name=tag).first()
            if exist_tag:
                return Response({'message': f'Tag Exists',
                                 "tag_id": exist_tag.id,
                                 "name": exist_tag.name,
                                 "color": exist_tag.color})
            new_tag = Tag.objects.create(
                name=tag,
                fk_user=user,
                color=color,
                is_default=0
            )
            return Response({'message': f'New tag added',
                             "tag_id": new_tag.id,
                             "name": new_tag.name,
                             "color": new_tag.color})
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def delete_tag(self, request):
        try:
            user = get_user_from_token(request)
            tag = request.data['tag']
            exist_tag = Tag.objects.filter(fk_user=user, name=tag).first()
            ContactTag.filter(fk_tag=tag).delete()
            exist_tag.delete()
            return Response({'message': f'Selected Tag Deleted'})
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def get_tags(self, request):
        try:
            user = get_user_from_token(request)
            user_tags = []
            default_tag = Tag.objects.filter(is_default=True)
            for tags in default_tag:
                user_tags.append({"name": tags.name,
                                  "color": tags.color})
            user_tag = Tag.objects.filter(fk_user=user)
            for tags in user_tag:
                user_tags.append({"name": tags.name,
                                  "color": tags.color})
            return Response({'data': user_tags[2:]})
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def contact_log_by_name(self, request):
        try:
            user = get_user_from_token(request)
            limit = request.data.get('limit', 20)  # Default limit
            offset = request.data.get('offset', 0)  # Default offset
            desc = request.data.get('desc', False)  # Default is False (ascending order)

            # Determine ordering based on 'desc' parameter
            ordering = '-name' if desc else 'name'

            # Fetch contacts
            contacts = Contact.objects.filter(owner=user, is_archived=False).order_by(ordering)[offset:offset + limit]

            # Serialize contacts
            serialized_contacts = ContactSerializer(contacts, many=True).data

            # Fetch related tags for each contact
            contact_ids = [contact['id'] for contact in serialized_contacts]
            contact_tags = ContactTag.objects.filter(fk_contact_id__in=contact_ids).select_related('fk_tag')
            print(len(contact_ids))
            # Build a mapping of contact_id to tags
            contact_tags_map = defaultdict(list)
            for contact_tag in contact_tags:
                # Ensure that the list for the contact_id is long enough to hold the tag at the correct position
                while len(contact_tags_map[contact_tag.fk_contact_id]) < contact_tag.position:
                    contact_tags_map[contact_tag.fk_contact_id].append(None)  # Add empty slots if needed

                # Insert the tag at the specified position
                contact_tags_map[contact_tag.fk_contact_id][contact_tag.position - 1] = {
                    "name": contact_tag.fk_tag.name,
                    "color": contact_tag.fk_tag.color}
            print(contact_tags_map)

            # Group contacts by date and include tags
            grouped_data = []
            for contact in serialized_contacts:
                # Get the "upcoming" status
                contact_id = contact['id']

                # Fetch the latest appointment
                appointment = AdvisorAppointment.objects.select_related('fk_appointment').filter(
                    fk_user_id=user.id,
                    fk_appointment__fk_contact_id=contact_id,
                    status__in=['active', 1],
                ).order_by(
                    'fk_appointment__appointment_date', 'fk_appointment__appointment_time'
                ).first()

                # Fetch the latest reminder
                reminder = NoteReminder.objects.filter(
                    fk_contact_id=contact_id, fk_user=user, reminder_status=1
                ).order_by('reminder_datetime').first()

                # Get the current date and time
                current_time = now()

                # Check if the appointment is in the future
                if appointment and appointment.fk_appointment.appointment_date >= current_time.date() and (
                        appointment.fk_appointment.appointment_time >= current_time.time()):
                    # Check if the reminder is in the future
                    if reminder and reminder.reminder_datetime >= current_time:
                        # Compare the two and decide which is earlier
                        if appointment.fk_appointment.appointment_date < reminder.reminder_datetime.date() or \
                                (appointment.fk_appointment.appointment_date == reminder.reminder_datetime.date() and
                                 appointment.fk_appointment.appointment_time < reminder.reminder_datetime.time()):
                            upcoming = "Meeting"
                        else:
                            upcoming = "Reminder"
                    else:
                        upcoming = "Meeting"
                elif reminder and reminder.reminder_datetime >= current_time:
                    upcoming = "Reminder"
                else:
                    upcoming = "Nothing yet"
                grouped_data.append({
                    "contact_id": contact["id"],
                    "name": contact["name"],
                    "image": contact.get("image", ""),  # Default to empty if not provided
                    "image_color": contact['pfp_color'],
                    "is_profile_pic": contact['is_profile_pic'],
                    "tags": contact_tags_map[contact['id']],  # Get tags for the contact
                    "priority": contact['priority'],
                    "upcoming": upcoming,  # Add upcoming status
                    "date_added": contact["date_added"],
                    "phone": contact["phone"],
                    "email": contact["email"],
                    "contact_url": f"/contact/{contact['public_id']}-{contact['slug']}/",


                })

            return Response(grouped_data)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def get_contacts(self, request):
        try:
            user = get_user_from_token(request)
            limit = int(request.data.get('limit', 20))  # Default limit
            offset = int(request.data.get('offset', 0))  # Default offset
            desc = request.data.get('desc', False)  # Default is False (ascending order)
            contact_name = request.data.get('name', '').strip()

            # Determine ordering based on 'desc' parameter
            ordering = 'date_added' if desc else '-date_added'

            # Fetch contacts with or without filtering
            if contact_name:
                contacts = Contact.objects.filter(
                    owner=user,
                    is_archived=False,
                    name__icontains=contact_name
                ) | Contact.objects.filter(
                    owner=user,
                    is_archived=False,
                    email__icontains=contact_name
                )
                contacts = contacts.distinct()  # Avoid duplicates from the union query
            else:
                contacts = Contact.objects.filter(owner=user, is_archived=False)

            # Apply ordering, limit, and offset
            contacts = contacts.order_by(ordering)[offset:offset + limit].values('id', 'email', 'name')

            data = []
            for contact in contacts:
                contact_tag = ContactTag.objects.filter(fk_contact=contact['id']).values('fk_tag__name',
                                                                                         'fk_tag__color')
                data.append({
                    'contact_id': contact['id'],
                    'email': contact['email'],
                    'name': contact['name'],
                    'category': [{"name": tag['fk_tag__name'], "color": tag['fk_tag__color']} for tag in contact_tag],
                    "contact_url": f"/contact/{contact['public_id']}-{contact['slug']}/",

                })

            return Response(data=data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def contact_timeline_log(self, request):
        # limit = request.data.get('limit', 20)  # Default limit
        # offset = request.data.get('offset', 0)  # Default offset
        print(request)
        # Fetch contacts with pagination
        grouped_data = []

        contacts = Contact.objects.all()
        for contact in contacts:
            timeline = Timeline.objects.filter(fk_contact_id=contact.id, content="contact").first()
            if timeline:
                continue
            print("-----------contact id-------------", contact.id)
            grouped_data.append(contact.id)
            note = NoteReminder.objects.create(
                fk_contact=contact,
                fk_user_id=contact.owner_id,
                note_text=f"You added {contact.name} in your Contact",
                note_status=1,
                editable=0,
                date_created=contact.date_added
            )
            Timeline.objects.create(
                action_type="note",
                content="contact",
                fk_user_id=contact.owner_id,
                fk_contact=contact,
                note_id=note.id,
                timestamp=contact.date_added
            )

        return Response(grouped_data)

    @action(methods=['POST'], detail=False)
    def get_contact_log(self, request):
        try:
            user = get_user_from_token(request)
            limit = request.data.get('limit', 20)  # Default limit
            offset = request.data.get('offset', 0)  # Default offset
            desc = request.data.get('desc', False)  # Default is False (ascending order)

            # Determine ordering based on 'desc' parameter
            ordering = 'date_added' if desc else '-date_added'

            # Fetch contacts
            contacts = Contact.objects.filter(owner=user, is_archived=False).order_by(ordering)[offset:offset + limit]

            # Serialize contacts
            serialized_contacts = ContactSerializer(contacts, many=True).data

            # Fetch related tags for each contact
            contact_ids = [contact['id'] for contact in serialized_contacts]
            contact_tags = ContactTag.objects.filter(fk_contact_id__in=contact_ids).select_related('fk_tag')
            print(len(contact_ids))
            # Build a mapping of contact_id to tags
            contact_tags_map = defaultdict(list)
            for contact_tag in contact_tags:
                # Ensure that the list for the contact_id is long enough to hold the tag at the correct position
                while len(contact_tags_map[contact_tag.fk_contact_id]) < contact_tag.position:
                    contact_tags_map[contact_tag.fk_contact_id].append(None)  # Add empty slots if needed

                # Insert the tag at the specified position
                contact_tags_map[contact_tag.fk_contact_id][contact_tag.position - 1] = {
                    "name": contact_tag.fk_tag.name,
                    "color": contact_tag.fk_tag.color}

            # Group contacts by date and include tags
            contact_data = []
            for contact in serialized_contacts:

                # Get the "upcoming" status
                contact_id = contact['id']

                # Fetch the latest appointment
                appointment = AdvisorAppointment.objects.select_related('fk_appointment').filter(
                    fk_user_id=user.id,
                    fk_appointment__fk_contact_id=contact_id,
                    status__in=['active', 1],
                ).order_by(
                    'fk_appointment__appointment_date', 'fk_appointment__appointment_time'
                ).first()

                # Fetch the latest reminder
                reminder = NoteReminder.objects.filter(
                    fk_contact_id=contact_id, fk_user=user, reminder_status=1
                ).order_by('reminder_datetime').first()

                # Get the current date and time
                current_time = now()

                # Check if the appointment is in the future
                if appointment and appointment.fk_appointment.appointment_date >= current_time.date() and (
                        appointment.fk_appointment.appointment_time >= current_time.time()):
                    # Check if the reminder is in the future
                    if reminder and reminder.reminder_datetime >= current_time:
                        # Compare the two and decide which is earlier
                        if appointment.fk_appointment.appointment_date < reminder.reminder_datetime.date() or \
                                (appointment.fk_appointment.appointment_date == reminder.reminder_datetime.date() and
                                 appointment.fk_appointment.appointment_time < reminder.reminder_datetime.time()):
                            upcoming = "Meeting"
                            print(contact_id, "apt", appointment.advisor_appointment_id,
                                  appointment.fk_appointment.appointment_date,
                                  appointment.fk_appointment.appointment_time)
                        else:
                            upcoming = "Reminder"
                            print(contact_id, "reminder", reminder.id, reminder.reminder_datetime)
                    else:
                        upcoming = "Meeting"
                        print(contact_id, "apt", appointment.advisor_appointment_id,
                              appointment.fk_appointment.appointment_date,
                              appointment.fk_appointment.appointment_time)
                elif reminder and reminder.reminder_datetime >= current_time:
                    upcoming = "Reminder"
                    print(contact_id, "reminder", reminder.id, reminder.reminder_datetime)
                else:
                    upcoming = "Nothing yet"
                contact_data.append({
                    "contact_id": contact["id"],
                    "name": contact["name"],
                    "image": contact.get("image", ""),  # Default to empty if not provided
                    "image_color": contact['pfp_color'],
                    "is_profile_pic": contact['is_profile_pic'],
                    "tags": contact_tags_map[contact['id']],  # Get tags for the contact
                    "priority": contact['priority'],
                    "upcoming": upcoming,  # Add upcoming status
                    "date_added": contact["date_added"],
                    "phone": contact["phone"],
                    "email": contact["email"],
                    "contact_url": f"/contact/{contact['public_id']}-{contact['slug']}/",

                })

            return Response(contact_data)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def email_save(self, request):
        try:
            user = get_user_from_token(request)
            recipient_emails = request.data.get('recipient_emails', [])
            subject = request.data.get('subject', '')
            body = request.data.get('body', '')

            if not recipient_emails:
                return Response({'message': 'Recipients list is empty'}, status=status.HTTP_400_BAD_REQUEST)

            email_instance = Email.objects.create(
                subject=subject,
                body=body,
                sent_date=datetime.datetime.now(),
                fk_user=user,
                is_bulk=len(recipient_emails) > 1
            )

            for recipient_email in recipient_emails:
                recipient_email = recipient_email.strip()
                try:
                    validate_email(recipient_email)
                except ValidationError:
                    return Response({'message': f'Invalid email format: {recipient_email}'},
                                    status=status.HTTP_400_BAD_REQUEST)

                contact = Contact.objects.filter(email=recipient_email).first()
                if not contact:
                    return Response({'message': f'No Contact with email {recipient_email} found'},
                                    status=status.HTTP_404_NOT_FOUND)

                # Associate email with recipients
                email_instance.recipients.add(contact)

                # Create a timeline entry
                Timeline.objects.create(
                    action_type="email",
                    content="Email sent",
                    fk_user=user,
                    fk_contact=contact,
                    email_id=email_instance.email_id
                )

            return Response({'message': 'Emails saved successfully'}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def bulk_contact(self, request):
        try:
            user = get_user_from_token(request)
            rows = request.data.get('bulk_data', [])
            created = 0
            skipped = []

            for row in rows:
                email = str(row.get('email', '')).strip()
                name = str(row.get('name', '')).strip()
                if not name or not email:
                    skipped.append({'email': email, 'reason': 'Missing name or email'})
                    continue

                try:
                    validate_email(email)
                except ValidationError:
                    skipped.append({'email': email, 'reason': 'Invalid email'})
                    continue

                if Contact.objects.filter(email=email, owner=user).exists():
                    skipped.append({'email': email, 'reason': 'Already exists'})
                    continue

                phone = str(row.get('phone', ''))
                additional_email = str(row.get('additional_email', ''))
                additional_phone = str(row.get('additional_phone', ''))
                address = str(row.get('address', ''))
                tags = str(row.get('tags', 'Manually Added'))
                birthday = row.get('birthday', None)
                about = str(row.get('about', ''))
                designation = str(row.get('designation', ''))
                company = str(row.get('company', ''))
                priority = str(row.get('priority', ''))
                social_links = str(row.get('social_links', ''))

                try:
                    phone = validate_phone(phone)
                    additional_phone = validate_phone(additional_phone)
                except ValidationError as e:
                    skipped.append({'email': email, 'reason': str(e)})
                    continue

                contact = Contact.objects.create(
                    email=email,
                    name=name,
                    phone=phone,
                    address=address,
                    owner=user,
                    additional_email=additional_email,
                    additional_phone=additional_phone,
                    is_profile_pic=False,
                    about=about,
                    designation=designation,
                    company=company,
                    priority=priority,
                    social_links=social_links.split(",") if social_links else [],
                    date_added=now(),
                    pfp_color=alphabet_color(name[0].upper()) if name else "#000000",
                )

                if birthday and birthday != "null":
                    contact.birthday = birthday

                contact.generated_text = f"{contact.name} was added to contacts on {contact.date_added.strftime('%d %B %Y')}"
                contact.save()

                for idx, tag in enumerate(tags.split(",")):
                    tag_obj, _ = Tag.objects.get_or_create(name=tag.strip())
                    ContactTag.objects.create(
                        fk_contact=contact,
                        fk_tag=tag_obj,
                        position=1 if tag.strip() in ['Manually Added', 'Business Card'] else (idx + 1)
                    )

                note = NoteReminder.objects.create(
                    fk_contact=contact,
                    fk_user=user,
                    note_text=f"You added {contact.name} in your Contact",
                    note_status=1,
                    editable=0
                )

                Timeline.objects.create(
                    action_type="note",
                    content="contact",
                    fk_user=user,
                    fk_contact=contact,
                    note_id=note.id
                )

                created += 1
            properties = {
                "name": contact.name,
                "email": contact.email,
                "phone": contact.phone,
                "bulk": "True",
                "count": created,
                "contact_url": f"/contact/{contact.public_id}-{contact.slug}/",

            }
            event = trigger_event("CONTACT", user.id, properties)

            return Response({
                'message': f"{created} contacts created successfully.",
                'skipped': skipped,
                "notification_event": event,
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['POST'], detail=False)
    def preview_bulk_contact(self, request):
        try:
            file = request.FILES.get('file')
            if not file:
                return Response({'message': 'Please upload a file.'}, status=status.HTTP_400_BAD_REQUEST)

            file_name = file.name.lower()

            if file_name.endswith('.csv'):
                decoded_file = file.read().decode('utf-8')
                rows = list(csv.DictReader(io.StringIO(decoded_file)))
            elif file_name.endswith(('.xls', '.xlsx')):
                df = pd.read_excel(file)
                rows = df.fillna('').to_dict(orient='records')
            else:
                return Response({'message': 'Unsupported file type. Please upload CSV or Excel.'},
                                status=status.HTTP_400_BAD_REQUEST)

            if not rows:
                return Response({'message': 'The uploaded file is empty.'}, status=status.HTTP_400_BAD_REQUEST)

            preview = rows[:5]  # First 5 rows for preview
            inferred_columns = list(rows[0].keys())

            return Response({
                'preview': preview,
                'columns': inferred_columns
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['POST'], detail=False)
    def confirm_bulk_contact(self, request):
        try:
            file = request.FILES.get('file')
            column_map_raw = request.data.get('column_map', {})
            if isinstance(column_map_raw, str):
                try:
                    column_map = json.loads(column_map_raw)
                except json.JSONDecodeError:
                    return Response({'message': 'Invalid column_map format.'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                column_map = column_map_raw

            if not file or not column_map:
                return Response({'message': 'File and column_map are required.'}, status=status.HTTP_400_BAD_REQUEST)

            user = get_user_from_token(request)
            file_name = file.name.lower()

            if file_name.endswith('.csv'):
                decoded_file = file.read().decode('utf-8')
                rows = list(csv.DictReader(io.StringIO(decoded_file)))
            elif file_name.endswith(('.xls', '.xlsx')):
                df = pd.read_excel(file)
                rows = df.fillna('').to_dict(orient='records')
            else:
                return Response({'message': 'Unsupported file type. Please upload CSV or Excel.'},
                                status=status.HTTP_400_BAD_REQUEST)

            created = 0
            skipped = []

            for row in rows:
                mapped = {field: str(row.get(column_map.get(field, ''), '')).strip() for field in [
                    'email', 'name', 'phone', 'additional_email', 'additional_phone', 'address',
                    'tags', 'birthday', 'about', 'designation', 'company', 'priority', 'social_links'
                ]}

                email = mapped['email']
                name = mapped['name']

                if not name or not email:
                    skipped.append({'email': email, 'reason': 'Missing name or email'})
                    continue

                try:
                    validate_email(email)
                except ValidationError:
                    skipped.append({'email': email, 'reason': 'Invalid email'})
                    continue

                if Contact.objects.filter(email=email, owner=user).exists():
                    skipped.append({'email': email, 'reason': 'Already exists'})
                    continue

                try:
                    phone = validate_phone(mapped['phone'])
                    additional_phone = validate_phone(mapped['additional_phone'])
                except ValidationError as e:
                    skipped.append({'email': email, 'reason': str(e)})
                    continue

                contact = Contact.objects.create(
                    email=email,
                    name=name,
                    phone=phone,
                    address=mapped['address'],
                    owner=user,
                    additional_email=mapped['additional_email'],
                    additional_phone=additional_phone,
                    is_profile_pic=False,
                    about=mapped['about'],
                    designation=mapped['designation'],
                    company=mapped['company'],
                    priority=mapped['priority'],
                    social_links=mapped['social_links'].split(",") if mapped['social_links'] else [],
                    date_added=now(),
                    pfp_color=alphabet_color(name[0].upper()) if name else "#000000",
                )

                if mapped['birthday'] and mapped['birthday'] != "null":
                    contact.birthday = mapped['birthday']

                contact.generated_text = f"{contact.name} was added to contacts on {contact.date_added.strftime('%d %B %Y')}"
                contact.save()

                for idx, tag in enumerate(mapped['tags'].split(",")):
                    tag_obj, _ = Tag.objects.get_or_create(name=tag.strip())
                    ContactTag.objects.create(
                        fk_contact=contact,
                        fk_tag=tag_obj,
                        position=1 if tag.strip() in ['Manually Added', 'Business Card'] else (idx + 1)
                    )

                note = NoteReminder.objects.create(
                    fk_contact=contact,
                    fk_user=user,
                    note_text=f"You added {contact.name} in your Contact",
                    note_status=1,
                    editable=0
                )

                Timeline.objects.create(
                    action_type="note",
                    content="contact",
                    fk_user=user,
                    fk_contact=contact,
                    note_id=note.id
                )

                created += 1
            properties = {
                "name": contact.name,
                "email": contact.email,
                "phone": contact.phone,
                "bulk": "True",
                "count": created,
                "contact_url": f"/contact/{contact.public_id}-{contact.slug}/",
            }
            event = trigger_event("CONTACT", user.id, properties)

            return Response({
                'message': f"{created} contacts created successfully.",
                'skipped': skipped,
                "notification_event": event,
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_contact_by_public_id(self, request, public_id, slug):
        try:
            user = get_user_from_token(request)
        
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        contact = Contact.objects.filter(
            public_id=public_id,
            owner=user,
        ).first()



        if not contact:
            return Response(
                {"message": "Contact not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        if contact.slug != slug:
            print("slug mismatch")

        data = ContactSerializer(contact).data
        return Response(data)

    @action(detail=False, methods=["POST"])
    def create_share(self, request):
        contact_id = request.data["contact_id"]
        user = get_user_from_token(request)
        contact = Contact.objects.get(id=contact_id, owner=user)

        share = ContactShare.objects.create(
            contact=contact,
            shared_by=user
        )

        return Response({
            "share_token": share.token
        })

    def get_shared_contact(self, request, token):
        user = get_user_from_token(request)

        share = get_object_or_404(
            ContactShare,
            token=token,
            is_active=True
        )

        contact = share.contact

        return Response({
            "contact": ContactSerializer(contact).data,
            "can_add": user.is_authenticated
        })

    @action(detail=False, methods=["POST"])
    def accept_share(self, request):
        token = request.data["token"]
        share = get_object_or_404(ContactShare, token=token)

        original = share.contact

        # create a COPY
        new_contact = Contact.objects.create(
            owner=request.user,
            name=original.name,
            email=original.email,
            phone=original.phone,
            slug=original.slug,
        )

        return Response({
            "message": "Contact added",
            "contact_url": f"/contact/{new_contact.public_id}-{new_contact.slug}/"
        })
    
    @action(detail=False, methods=["POST"])
    def update_slugs(self, request):
        contacts = Contact.objects.filter(Q(slug="") | Q(slug__isnull=True))
        updated = 0
        skipped = 0
        for contact in contacts:
            if not contact.name:
                skipped += 1
                continue
            base_slug = slugify(contact.name)
            if not base_slug:
                # fallback slug (VERY IMPORTANT)
                base_slug = f"contact-{contact.id}"
            slug = base_slug
            counter = 1

            while Contact.objects.filter(
                slug=slug,
                owner=contact.owner
            ).exclude(id=contact.id).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            if contact.slug != slug:
                contact.slug = slug
                contact.save(update_fields=["slug"])
                updated += 1

        return Response({
            "message": "Slug update completed",
            "updated_contacts": updated,
            "skipped_contacts": skipped
        })

    @action(methods=['POST'], detail=False)
    def reengage_contact(self, request):

        properties = None
        fifteen_days_ago = timezone.now() - timedelta(days=15)
        thirty_days_ago = timezone.now() - timedelta(days=30)

        total_sent = 0

        # Only users who have contacts
        users = (User.objects.filter(
            contacts__is_archived=False
        )    .distinct()
            .order_by("id")[:100]   # limit 100 users per day
        )

        for user in users:

            # Exclude Nick contact
            eligible_contacts_base = Contact.objects.filter(
                owner=user,
                is_archived=False
            ).exclude(
                email="nikhil@nsgcrm.com"  # safest unique filter
            )

            if not eligible_contacts_base.exists():
                continue

            recent_activity = Timeline.objects.filter(
                fk_contact_id=OuterRef("pk"),
                fk_user_id=user.id,
                timestamp__gte=fifteen_days_ago
            )

            eligible_contacts = (
                eligible_contacts_base
                .filter(date_added__lte=fifteen_days_ago)
                .annotate(has_recent_activity=Exists(recent_activity))
                .filter(has_recent_activity=False)
                .filter(
                    Q(last_reengagement_sent_at__isnull=True) |
                    Q(last_reengagement_sent_at__lte=thirty_days_ago)
                )
                .order_by("last_reengagement_sent_at", "-date_added")[:3]
            )


            if not eligible_contacts:
                continue

            contacts_data = []

            for contact in eligible_contacts:
                contacts_data.append({
                    "name": contact.name,
                    "url": f"https://nsgcrm.com/contact/{contact.public_id}-{contact.slug}/"
                })

                # Update send timestamp
                contact.last_reengagement_sent_at = timezone.now()
                contact.save(update_fields=["last_reengagement_sent_at"])

            properties = {
                "contacts": contacts_data,
                "contact_count": Contact.objects.filter(
                    owner=user,
                    is_archived=False
                ).count()
            }

            try:
                event = trigger_event("contact", user.id, properties)
                total_sent += 1

                time.sleep(0.55)  # keep below 2/sec safely

            except Exception as e:
                print(f"Failed for user {user.id}: {str(e)}")

        return Response({
            "users_triggered": total_sent,
            "properties": properties,
            "event": event
        })

    @action(methods=['POST'], detail=False)
    def followup_suggestions(self,request):

        contact_id = request.data.get("contact_id")

        contact = get_object_or_404(Contact, id=contact_id)
        user = get_user_from_token(request)

        # user = request.user

        name = contact.name.split(" ")[0]

        # detect intent
        thirty_days_ago = timezone.now() - timedelta(days=30)

        recent_activity = Timeline.objects.filter(
            fk_contact=contact,
            fk_user=user,
            timestamp__gte=thirty_days_ago
        ).exists()

        if recent_activity:
            primary_intent = "build_relationship"
        else:
            primary_intent = "reengage"

        # suggestions
        intents = [
            {
                "intent": "build_relationship",
                "suggestions": [
                    {
                        "subject": "Great connecting earlier",
                        "message": f"Hi {name},\n\nIt was great connecting earlier. I wanted to reach out and properly say hello.\n\nWould love to stay in touch.\n\nBest,\n{user.name}"
                    },
                    {
                        "subject": "Good to connect",
                        "message": f"Hi {name},\n\nGlad we connected recently. Just wanted to introduce myself properly.\n\nLooking forward to staying in touch.\n\nBest,\n{user.name}"
                    },
                    {
                        "subject": "Nice connecting",
                        "message": f"Hi {name},\n\nIt was nice connecting. Always great meeting people in this space.\n\nHope we can stay in touch.\n\nBest,\n{user.name}"
                    }
                ]
            },
            {
                "intent": "reengage",
                "suggestions": [
                    {
                        "subject": "Quick check-in",
                        "message": f"Hi {name},\n\nHope you're doing well. Just wanted to check in since it's been a while since we last connected.\n\nWould be great to catch up.\n\nBest,\n{user.name}"
                    },
                    {
                        "subject": "Reconnecting",
                        "message": f"Hi {name},\n\nIt's been a while since we last spoke. Thought I'd reach out and reconnect.\n\nHope everything is going well.\n\nBest,\n{user.name}"
                    },
                    {
                        "subject": "Thought I'd reach out",
                        "message": f"Hi {name},\n\nJust wanted to send a quick message and reconnect.\n\nLet me know how things have been going.\n\nBest,\n{user.name}"
                    }
                ]
            }
        ]

        return Response({
            "contact": contact.name,
            "primary_intent": primary_intent,
            "intents": intents
        })

    @action(methods=['POST'], detail=False)
    def delete_super_contact(self, request):
        try:
            contacts = request.data['contact_id']
            not_deleted = set()
            for contact_id in contacts:
                    contact = Contact.objects.filter(id=contact_id).first()
                    if contact.is_archived:
                        Appointment.objects.filter(fk_contact_id=contact).delete()
                        contact.delete()
                    else:
                        not_deleted.add(contact_id)
            return Response({'message': f'Contacts deleted' if not not_deleted else "Some Contacts can not be deleted. "
                                                                                    "Please Archive them first",
                             'not_deleted': not_deleted
                             })
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['GET'], detail=False)
    def search_contacts(self, request):
        try:
            user = get_user_from_token(request)

            search = request.query_params.get("search")
            company = request.query_params.get("company")
            priority = request.query_params.get("priority")
            tag = request.query_params.get("tag")

            limit = int(request.query_params.get("limit", 20))
            offset = int(request.query_params.get("offset", 0))

            queryset = Contact.objects.filter(
                owner=user,
                is_archived=False
            )

            # 🔎 SMART SEARCH
            if search:
                words = search.split()

                search_query = reduce(
                    operator.and_,
                    [
                        Q(name__icontains=word) |
                        Q(email__icontains=word) |
                        Q(phone__icontains=word) |
                        Q(company__icontains=word) |
                        Q(designation__icontains=word)
                        for word in words
                    ]
                )

                queryset = queryset.filter(search_query)

            # 🏢 COMPANY FILTER
            if company:
                queryset = queryset.filter(company__icontains=company)

            # ⭐ PRIORITY FILTER
            if priority:
                queryset = queryset.filter(priority=priority)

            # 🏷 TAG FILTER
            if tag:
                queryset = queryset.filter(
                    id__in=ContactTag.objects.filter(
                        fk_tag__name__icontains=tag
                    ).values_list("fk_contact_id", flat=True)
                )

            total_count = queryset.count()

            queryset = queryset.order_by("-date_added")[offset:offset + limit]

            data = []

            for contact in queryset:
                contact_tag = ContactTag.objects.filter(
                    fk_contact=contact
                ).values('fk_tag__name', 'fk_tag__color')

                data.append({
                    "contact_id": contact.id,
                    "name": contact.name,
                    "phone": contact.phone,
                    "email": contact.email,
                    "company": contact.company,
                    "designation": contact.designation,
                    "priority": contact.priority,
                    "tags": [
                        {"name": t['fk_tag__name'], "color": t['fk_tag__color']}
                        for t in contact_tag
                    ],
                    "contact_url": f"/contact/{contact.public_id}-{contact.slug}/"
                })

            return Response({
                "count": total_count,
                "results": data
            })

        except Exception as e:
            return Response({"message": str(e)}, status=400)
