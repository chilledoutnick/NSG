import time

from django.db import transaction
from django.forms import ValidationError
from django.shortcuts import get_object_or_404

from api.models.Email import Thread
from api.views.Services import get_user_from_token, alphabet_color, contact_image_upload_to, \
    validate_phone, get_user_from_request, assign_tag_to_contact
from api.serializers import ContactSerializer, PotentialContactSerializer
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
def get_tag_from_created_from(created_from):
    if created_from == "email":
        return [{"name": "Email", "color": "#493BB5"}]
    elif created_from == "meeting":
        return [{"name": "Meeting", "color": "#00740e"}]
    return []

class PotentialContactView(viewsets.GenericViewSet):
    @action(methods=['POST'], detail=False)
    def potential_contact_log(self, request):
        try:
            user = get_user_from_token(request)
            limit = request.data.get('limit', 20)  # Default limit
            offset = request.data.get('offset', 0)  # Default offset
            desc = request.data.get('desc', False)  # Default is False (ascending order)

            # Determine ordering based on 'desc' parameter
            ordering = 'date_added' if desc else '-date_added'

            # Fetch contacts
            contacts = PotentialContact.objects.filter(owner=user).order_by(ordering)[offset:offset + limit]

            # Serialize contacts
            serialized_contacts = PotentialContactSerializer(contacts, many=True).data

            # Fetch related tags for each contact
            contact_ids = [contact['id'] for contact in serialized_contacts]

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

                # Get the current date and time
                current_time = now()

                # Check if the appointment is in the future
                if appointment and appointment.fk_appointment.appointment_date >= current_time.date() and (
                        appointment.fk_appointment.appointment_time >= current_time.time()):
                    # Check if the reminder is in the future
                    upcoming = "Meeting"
                    print(contact_id, "apt", appointment.advisor_appointment_id,
                              appointment.fk_appointment.appointment_date,
                              appointment.fk_appointment.appointment_time)
                else:
                    upcoming = "Nothing yet"
                grouped_data.append({
                    "contact_id": contact["id"],
                    "name": contact["name"],
                    "image": contact.get("image", ""),  # Default to empty if not provided
                    "image_color": contact['pfp_color'],
                    "is_profile_pic": contact['is_profile_pic'],
                    "tags": get_tag_from_created_from(contact.get("created_from")),
                    "priority": contact['priority'],
                    "upcoming": upcoming,  # Add upcoming status
                    "date_added": contact["date_added"],
                    "phone": contact["phone"],
                    "email": contact["email"],
                    "generated_text": contact["generated_text"],
                    "address": contact["address"],
                    "about": contact["about"],

                })

            return Response(grouped_data)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)


    @action(methods=["POST"], detail=False)
    def add_to_contact(self, request):
        try:
            user = get_user_from_token(request)
            potential_contact_id = request.data.get("potential_contact_id")
            tag_list = request.data.get("tag_list", None)


            if not potential_contact_id:
                return Response({"message": "potential_contact_id is required"}, status=400)

            try:
                pc = PotentialContact.objects.get(id=potential_contact_id, owner=user)
            except PotentialContact.DoesNotExist:
                return Response({"message": "Potential contact not found"}, status=404)

            # ✅ Prevent duplicate contact
            existing_contact = Contact.objects.filter(
                owner=user,
                email=pc.email
            ).first()

            if existing_contact:
                pc.delete()
                return Response({
                    "message": "Contact already exists",
                    "contact_id": existing_contact.id
                }, status=200)

            with transaction.atomic():

                # ✅ Create Contact
                contact = Contact.objects.create(
                    owner=user,
                    name=pc.name,
                    email=pc.email,
                    phone=pc.phone,
                    company=pc.company,
                    designation=pc.designation,
                    address=pc.address,
                    about=pc.about,
                )

                # ✅ 2. Handle Appointments if created from a meeting
                # We look at the Timeline entries for this PotentialContact to find meeting IDs
                meeting_ids = Timeline.objects.filter(
                    fk_potential_contact=pc,
                    action_type="schedule_meeting"
                ).values_list('meeting_id', flat=True)

                if meeting_ids:
                    # Update all appointments found in the timeline to point to the new contact
                    # We filter by ID and ensure they aren't already linked to someone else
                    Appointment.objects.filter(
                        appointment_id__in=meeting_ids
                    ).update(fk_contact=contact)

                    # If you are using the ManyToMany 'contacts' field as well:
                    appointments = Appointment.objects.filter(appointment_id__in=meeting_ids)
                    for appt in appointments:
                        appt.contacts.add(contact)

                # ✅ 3. Copy tags from PotentialContact → Contact
                assign_tag_to_contact(contact, pc, tag_list)

                # ✅ 4. Move timeline to the new contact
                Timeline.objects.filter(
                    fk_potential_contact=pc
                ).update(
                    fk_contact=contact,
                    fk_potential_contact=None
                )
                # change email thread
                Thread.objects.filter(
                    potential_contact=pc
                ).update(
                    contact=contact,
                    potential_contact=None
                )

                # ✅ 6. Final cleanup
                pc.delete()

            return Response({
                "message": "Contact created successfully",
                "contact_id": contact.id
            }, status=201)

        except Exception as e:
            return Response({"message": str(e)}, status=500)

    @action(methods=["POST"], detail=False)
    def delete_potential_contact(self, request):
        try:
            user = get_user_from_token(request)
            contact_id = request.data.get("potential_contact_id")

            if not contact_id:
                return Response(
                    {"message": "potential_contact_id is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                contact = PotentialContact.objects.get(id=contact_id, owner=user)
            except PotentialContact.DoesNotExist:
                return Response(
                    {"message": "Contact not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            Timeline.objects.filter(fk_potential_contact=contact).delete()
            contact.delete()

            return Response(
                {"message": "Potential contact discarded successfully"},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
