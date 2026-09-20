from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from django.http import JsonResponse
import datetime as py_datetime
from api.views.OutlookView import OutlookView
from api.views.Services import *
from api.models import *
import datetime


def calculate_end_time(start_time, duration):
    if isinstance(start_time, py_datetime.time):
        start_time = start_time.strftime('%H:%M:%S')  # Convert to string if it's a time object

    start_time_obj = py_datetime.datetime.strptime(start_time, '%H:%M:%S')
    end_time_obj = start_time_obj + py_datetime.timedelta(minutes=duration)

    return end_time_obj.strftime('%H:%M:%S')

def valid_appointment(request):
    # Authenticate user
    user = get_user_from_request(request)
    if isinstance(user, Response):
        return user  # Return error response

    # Retrieve appointment_id from the request
    appointment_id = request.data.get("appointment_id",None)
    if not appointment_id:
        return Response({'message': 'Missing appointment_id'}, status=status.HTTP_400_BAD_REQUEST)

    # Fetch the appointment
    appointment = Appointment.objects.filter(appointment_id=appointment_id).first()
    if not appointment:
        return Response({'message': 'Appointment not found or unauthorized'}, status=status.HTTP_404_NOT_FOUND)
    user_appointment = AdvisorAppointment.objects.filter(fk_appointment=appointment).first()
    return user, user_appointment, appointment


class AdvisorAppointmentView(viewsets.GenericViewSet):

    @action(methods=["POST"], detail=False)
    def create_appointment(self, request):
        try:
            username = request.data.get('username')
            if username:
                user = User.objects.filter(username=username).first()
                if not user:
                    profile = Profiles.objects.filter(username=username).first()
                    if not profile:
                        return Response({"message": "User not Found"}, status=status.HTTP_400_BAD_REQUEST)
                    user = profile.fk_user
            else:
                user = get_user_from_request(request)
                if isinstance(user, Response):
                    return user  # Return error response
            contact_id = request.data["contact_id"]
            appointment_time_raw = request.data.get("appointment_time")
            if isinstance(appointment_time_raw, dict):
                appointment_time = appointment_time_raw.get("time")
            else:
                appointment_time = appointment_time_raw

            if not appointment_time:
                return Response({'message': 'Invalid appointment_time format'}, 
                                status=status.HTTP_400_BAD_REQUEST)
            appointment_date = request.data["appointment_date"]
            appointment_name = request.data.get("meeting_name", f"Appointment with {user.name}")
            appointment_status = request.data.get("status", "active")
            duration = request.data.get("duration", 15)
            timezone_str = request.data.get("timezone")
            countdown = request.data.get('countdown', "1")
            # user_timezone = request.data["timezone_name"]
            event_id = request.data.get("eventId","")

            try:
                pytz_timezone = pytz.timezone(timezone_str)
            except pytz.UnknownTimeZoneError:
                return Response({'message': 'Invalid timezone provided'},
                                status=status.HTTP_400_BAD_REQUEST)
            guest = request.data.get("guest", [])
            id_validator = RegexValidator(
                regex=r'^\d{1,6}$',
                message='Invalid Id format.'
            )
            try:
                id_validator(contact_id)
            except ValidationError:
                return Response({'message': 'Invalid Id format'},
                                status=status.HTTP_400_BAD_REQUEST)
            appointment_time_raw = request.data.get("appointment_time")
            if isinstance(appointment_time_raw, dict):
                appointment_time = appointment_time_raw.get("time")
            else:
                appointment_time = appointment_time_raw

            if not appointment_time:
                return Response({'message': 'Invalid appointment_time format'},
                                status=status.HTTP_400_BAD_REQUEST)
            contact = Contact.objects.filter(id=contact_id, owner=user).first()
            if not contact:
                return Response({'message': 'Contact not found'})
            date_validator = RegexValidator(
                regex=r'^\d{4}\-\d{2}\-\d{2}$',
                message='Invalid Date format. It should be YYYY-MM-DD'
            )
            try:
                date_validator(appointment_date)
            except ValidationError:
                return Response({'message': 'Invalid Date format. It should be YYYY-MM-DD'},
                                status=status.HTTP_400_BAD_REQUEST)
            time_validator = RegexValidator(
                regex=r'^\d{2}:\d{2}:\d{2}$',
                message='Invalid Time format. It should be HH:MM:SS'
            )
            try:
                time_validator(appointment_time)
            except ValidationError:
                return Response({'message': 'Invalid Time format. It should be HH:MM:SS'},
                                status=status.HTTP_400_BAD_REQUEST)
            try:
                duration_validator(duration)
            except ValidationError:
                return Response({'message': 'Invalid duration format. It should be greater than 00 to 60'},
                                status=status.HTTP_400_BAD_REQUEST)
            appointment_start_at = combine_local_to_utc(appointment_date, appointment_time, timezone_str)
            appointment_end_at = appointment_start_at + datetime.timedelta(minutes=int(duration))
            if len(guest) > 0:
                for guests in guest:
                    guests = guests.strip()
                    try:
                        validate_email(guests)
                    except ValidationError:
                        return Response({'message': f'Invalid guest email format {guests}'},
                                        status=status.HTTP_400_BAD_REQUEST)
            error_email = []
            user_appointments = []
            meet_link = user.meet_url
            if "meet_link" in request.data:
                meet_link = request.data["meet_link"]
            appointment = Appointment.objects.create(
                fk_contact=contact,
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                duration=duration,
                appointment_name=appointment_name,
                status=appointment_status,
                guests=guest,
                timezone=timezone_str,
                appointment_start_at=appointment_start_at,
                appointment_end_at=appointment_end_at,
                meet_link=meet_link,
                eventId=event_id
            )
            appointment.update_time = appointment.create_time
            appointment.save()
            user_appointment = AdvisorAppointment.objects.create(
                fk_appointment_id=appointment.appointment_id,
                fk_user_id=user.id,
                owner=True
            )
            user_appointments.append(user_appointment.advisor_appointment_id)
            for member_email in guest:
                member_email = member_email.strip()
                try:
                    member_user = User.objects.filter(email=member_email).first()
                    if member_user is None:
                        error_email.append(member_email)
                        continue
                    team_member = TeamMember.objects.filter(fk_user_id=user.id). \
                        filter(fk_member_id=member_user.id).first()
                    if team_member is None:
                        error_email.append(member_email)
                        continue
                except Exception as e:
                    str(e)
                    error_email.append(member_email)
                    continue
                user_appointment = AdvisorAppointment.objects.create(
                    fk_appointment_id=appointment.appointment_id,
                    fk_user_id=team_member.fk_member.id
                )
                user_appointments.append(user_appointment.advisor_appointment_id)
            # timeline
            Timeline.objects.create(
                action_type="schedule_meeting",
                content="Scheduled a meeting at",
                fk_user=user,
                fk_contact=contact,
                meeting_id=appointment.appointment_id
            )


            created_field = {
                "contact_id": contact_id,
                "appointment_date": appointment_date,
                "appointment_time": appointment_time,
                "appointment_start_at": appointment_start_at.isoformat(),
                "appointment_end_at": appointment_end_at.isoformat(),
                "duration": duration,
                "appointment_name": appointment_name,
                "status": appointment_status,
                "appointment_id": appointment.appointment_id,
                "guest": guest,
                "meet_link": meet_link,
                "user_appointment": user_appointments,
                "error_email": error_email
            }
            appointment_id = appointment.appointment_id
            id_validator = RegexValidator(
                regex=r'^\d{1,6}$',
                message='Invalid Id format.'
            )
            try:
                id_validator(appointment_id)
            except ValidationError:
                return Response({'message': f'Invalid {appointment_id} format'},
                                status=status.HTTP_400_BAD_REQUEST)
            appointment = Appointment.objects.filter(appointment_id=appointment_id).first()
            if not appointment:
                return Response({'message': 'Invalid appointment_id'}, status=status.HTTP_400_BAD_REQUEST)
            working_hour= WorkingHour.objects.filter(fk_user=user).first()
            user_timezone = working_hour.timezone if working_hour else timezone_str
            user_timezone_name = timezone_str
            schedule = "scheduled"
            message = ""
            title = "Booking Confirmed"
            click = "Click to Join the Meeting"
            subject = f"NSG | Appointment Confirmed with "
            mail = email_confirmation(appointment=appointment, schedule=schedule,appointment_timezone=pytz_timezone,
                                      time_zone=user_timezone, message=message, title=title, click=click, subject=subject,
                                      ctz=user_timezone_name)
            if mail:
                created_field["data"] = {'message': 'Booking Confirmation Sent', 'meet_url': appointment.meet_link}
            else:
                created_field["data"] = {'message': 'Error sending confirmation email'}
            return JsonResponse(created_field,status=status.HTTP_201_CREATED)

        except IOError as e:
            return JsonResponse({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=["POST"], detail=False)
    def update_appointment(self, request):
        user = get_user_from_request(request)
        if isinstance(user, Response):
            return user  # Return error response
        return Response({'message': f'user found {user.id}'},
                                        status=status.HTTP_200_OK)

    #     try:
    #         deleted_guest = []
    #         user = get_user_from_token(request)
    #         appointment_id = request.data["appointment_id"]
    #         appointment_time = request.data["appointment_time"]
    #         appointment_date = request.data["appointment_date"]
    #         duration = request.data["duration"]
    #         appointment_status = request.data.get("status", "active")
    #         id_validator = RegexValidator(
    #             regex=r'^\d{1,6}$',
    #             message='Invalid Id format.'
    #         )
    #         try:
    #             id_validator(appointment_id)
    #         except ValidationError:
    #             return Response({'message': 'Invalid Id format'},
    #                             status=status.HTTP_400_BAD_REQUEST)
    #         date_validator = RegexValidator(
    #             regex=r'^\d{4}\-\d{2}\-\d{2}$',
    #             message='Invalid Date format. It should be YYYY-MM-DD'
    #         )
    #         try:
    #             date_validator(appointment_date)
    #         except ValidationError:
    #             return Response({'message': 'Invalid Date format. It should be YYYY-MM-DD'},
    #                             status=status.HTTP_400_BAD_REQUEST)
    #         time_validator = RegexValidator(
    #             regex=r'^\d{2}:\d{2}:\d{2}$',
    #             message='Invalid Time format. It should be HH:MM:SS'
    #         )
    #         try:
    #             time_validator(appointment_time)
    #         except ValidationError:
    #             return Response({'message': 'Invalid Time format. It should be HH:MM:SS'},
    #                             status=status.HTTP_400_BAD_REQUEST)
    #         try:
    #             duration_validator(duration)
    #         except ValidationError:
    #             return Response({'message': 'Invalid duration format. It should be greater than 00 to 60'},
    #                             status=status.HTTP_400_BAD_REQUEST)
    #         appointment = Appointment.objects.filter(appointment_id=appointment_id).first()
    #         user_appointment = AdvisorAppointment.objects.filter(fk_appointment=appointment).first()
    #         if "guest" in request.data:
    #             guest = request.data["guest"]
    #             if len(guest) != 0:
    #                 for guests in guest:
    #                     guests = guests.strip()
    #                     try:
    #                         validate_email(guests)
    #                     except ValidationError:
    #                         return Response({'message': f'Invalid guest email format {guests}'},
    #                                         status=status.HTTP_400_BAD_REQUEST)
    #             try:
    #                 guests_list = appointment.get_guests_list()
    #             except Exception as e:
    #                 str(e)
    #                 guests_list = []
    #             if len(guests_list) != 0:
    #                 for guests in guests_list:
    #                     if guests not in guest:
    #                         deleted_guest.append(guests)
    #             if appointment.guests != guest:
    #                 appointment.guests = guest
    #         appointment.appointment_time = appointment_time
    #         appointment.appointment_date = appointment_date
    #         appointment.status = appointment_status
    #         appointment.duration = duration
    #         appointment.reschedule_time = datetime.datetime.now()
    #         appointment.save()
    #         try:
    #             app_timezone = request.data["timezone"]
    #             timezone_validator = RegexValidator(
    #                 regex=r'^\d{1,2}:\d{1,2} [AaPp][Mm] \d{4}-\d{2}-\d{2} [A-Za-z\s]+( [A-Za-z\s]+)( GMT(\+|-)\d{1,2}'
    #                       r'(\:\d{1,2})?)?$',
    #                 message='Invalid timezone format. It should be HH:mm PM/AM YYYY-MM-DD TIMEZONE'
    #             )
    #             try:
    #                 timezone_validator(app_timezone)
    #             except ValidationError:
    #                 return Response({'message': 'Invalid Date format. It should be HH:mm PM/AM YYYY-MM-DD TIMEZONE'},
    #                                 status=status.HTTP_400_BAD_REQUEST)
    #             schedule = "rescheduled"
    #             message = "We look forward to meeting you on the scheduled date."
    #             title = "Booking Confirmed"
    #             gc = "Add to"
    #             click = "Click to Join the Meeting"
    #             subject = "NSG | Appointment Updated with"
    #             mail = email_confirmation(appointment, schedule, app_timezone, message, title, click, subject,
    #                                       deleted_guest)
    #             # timeline
    #             Timeline.objects.create(
    #                 action_type="reschedule_meeting",
    #                 content="Rescheduled a meeting at",
    #                 fk_user=user,
    #                 fk_contact_id=appointment.fk_contact_id,
    #                 meeting_id=user_appointment.advisor_appointment_id
    #             )
    #             if mail:
    #                 return JsonResponse({
    #                     'message': 'Booking Confirmation Sent',
    #                     'meet_url': appointment.fk_user.meet_url,
    #                     'appointment_id': appointment.appointment_id
    #                 }, status=status.HTTP_200_OK)
    #             else:
    #                 return JsonResponse({'message': mail['error']}, status=status.HTTP_400_BAD_REQUEST)
    #         except Exception as e:
    #             return JsonResponse({'message': "Email can't be sent", "error": str(e)},
    #                                 status=status.HTTP_400_BAD_REQUEST)
    #     except Exception as e:
    #         return JsonResponse({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    #
    # @action(methods=['POST'], detail=False)
    # def delete_appointment(self, request):
    #     try:
    #         user = get_user_from_token(request)
    #         appointment_id = request.data['appointment_id']
    #         id_validator = RegexValidator(
    #             regex=r'^\d{1,6}$',
    #             message='Invalid Id format.'
    #         )
    #         try:
    #             id_validator(appointment_id)
    #         except ValidationError:
    #             return Response({'message': 'Invalid Id format'},
    #                             status=status.HTTP_400_BAD_REQUEST)
    #         appointment = Appointment.objects.filter(appointment_id=appointment_id).first()
    #         user_appointment = AdvisorAppointment.objects.filter(fk_appointment=appointment).first()
    #         appointment.status = 'canceled'
    #         appointment.deleted_at = datetime.datetime.now()
    #         appointment.save()
    #         time_zone = request.data["timezone"]
    #         timezone_validator = RegexValidator(
    #             regex=r'^\d{1,2}:\d{1,2} [AaPp][Mm] \d{4}-\d{2}-\d{2} [A-Za-z\s]+( [A-Za-z\s]+)( GMT(\+|-)\d{1,2}'
    #                   r'(\:\d{1,2})?)?$',
    #             message='Invalid timezone format. It should be HH:mm PM/AM YYYY-MM-DD TIMEZONE'
    #         )
    #         try:
    #             timezone_validator(time_zone)
    #         except ValidationError:
    #             return Response({'message': 'Invalid Date format. It should be HH:mm PM/AM YYYY-MM-DD TIMEZONE'},
    #                             status=status.HTTP_400_BAD_REQUEST)
    #         schedule = "deleted"
    #         message = ""
    #         title = "Appointment Deleted"
    #         gc = "Remove from"
    #         click = "Meeting Deleted"
    #         subject = "NSG | Appointment Deleted"
    #         mail = email_confirmation(appointment, schedule, time_zone, message, title, gc, click, subject,
    #                                   deleted=True)
    #         # timeline
    #         Timeline.objects.create(
    #             action_type="delete_meeting",
    #             content="Canceled a meeting at",
    #             fk_user=user,
    #             fk_contact_id=appointment.fk_contact_id,
    #             meeting_id=user_appointment.advisor_appointment_id
    #         )
    #         if mail:
    #             return JsonResponse({'message': f'Appointment {appointment.appointment_id} deleted'
    #                                  }, status=status.HTTP_200_OK)
    #         else:
    #             return JsonResponse({'message': mail['error']}, status=status.HTTP_400_BAD_REQUEST)
    #     except Exception as e:
    #         return JsonResponse({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def reschedule_appointment(self, request):
        try:
            # ----------------------------
            # 1. User Authentication
            # ----------------------------
            user, user_appointment, appointment = valid_appointment(request)

            # ----------------------------
            # 3. Retrieve & Validate Appointment Details
            # ----------------------------
            new_appointment_time = request.data.get("appointment_time")
            new_appointment_date = request.data.get("appointment_date")
            new_duration = request.data.get("duration", appointment.duration)
            new_guest = request.data.get("guest", appointment.guests)
            new_meet_link = request.data.get("meet_link", appointment.meet_link)
            new_status = request.data.get("status", appointment.status)
            apt_timezone = request.data.get("timezone", appointment.timezone or "UTC")


            # Validate date & time formats
            date_validator = RegexValidator(regex=r'^\d{4}-\d{2}-\d{2}$', message='Invalid Date format.')
            time_validator = RegexValidator(regex=r'^\d{2}:\d{2}:\d{2}$', message='Invalid Time format.')
            try:
                date_validator(new_appointment_date)
                time_validator(new_appointment_time)
            except ValidationError as e:
                return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            new_start_at = combine_local_to_utc(new_appointment_date, new_appointment_time, apt_timezone)
            new_end_at = new_start_at + datetime.timedelta(minutes=int(new_duration))

            # Ensure new_guest is an iterable (list)
            if not isinstance(new_guest, list):
                new_guest = [new_guest]

            # Validate each guest email
            for email in new_guest:
                email = email.strip()
                try:
                    validate_email(email)
                except ValidationError:
                    return Response({'message': f'Invalid guest email format: {email}'},
                                    status=status.HTTP_400_BAD_REQUEST)

            # ----------------------------
            # 4. Update Appointment & Timeline
            # ----------------------------
            appointment.appointment_date = new_appointment_date
            appointment.appointment_time = new_appointment_time
            appointment.duration = new_duration
            appointment.guests = new_guest
            appointment.meet_link = new_meet_link
            appointment.status = new_status
            appointment.timezone = apt_timezone
            appointment.appointment_start_at = new_start_at
            appointment.appointment_end_at = new_end_at
            appointment.reschedule_time = datetime.datetime.now()
            appointment.save()

            user_appointment.status = new_status
            user_appointment.timestamp = datetime.datetime.now()
            user_appointment.save()

            timeline = Timeline.objects.filter(meeting_id=appointment.appointment_id).first()
            if timeline:
                timeline.delete()
            Timeline.objects.create(
                action_type="reschedule_meeting",
                content="Rescheduled a meeting at",
                fk_user=user,
                fk_contact_id=appointment.fk_contact_id,
                meeting_id=appointment.appointment_id
            )

            # Prepare the updated response data
            updated_field = {
                "appointment_id": appointment.appointment_id,
                "appointment_name": appointment.appointment_name,
                "appointment_date": new_appointment_date,
                "appointment_time": new_appointment_time,
                "appointment_start_at": new_start_at.isoformat(),
                "appointment_end_at": new_end_at.isoformat(),
                "duration": new_duration,
                "status": new_status,
                "guest": new_guest,
                "meet_link": new_meet_link,
                "contacts": {"contact_id": appointment.fk_contact.id, "contact_name": appointment.fk_contact.name}
            }
            schedule = "rescheduled"
            message = "We look forward to meeting you on the scheduled date."
            title = "Booking Confirmed"
            click = "Click to Join the Meeting"
            subject = "NSG | Appointment Rescheduled with "

            mail = email_confirmation(appointment=appointment, schedule=schedule, appointment_timezone=appointment.timezone,
                                      time_zone=apt_timezone,
                                      message=message, title=title, click=click, subject=subject)

            # Calculate end time (using your helper function)
            local_start_dt, local_end_dt = appointment_in_timezone(appointment, apt_timezone)
            end_time = local_end_dt.strftime('%H:%M:%S')

            # Build the basic email content (without meeting link)
            email_content = (
                f"Meet With {appointment.fk_contact.name}\n"
                f"Event Name: {new_duration} Minute Meeting\n"
                f"Date: {new_appointment_date} at {new_appointment_time} to {end_time}\n"
            )

            # ----------------------------
            # 5. Reschedule Calendar Events (if eventId exists)
            # ----------------------------
            if appointment.eventId:
                token_response = OutlookView().get_token(request, user=user)
                if token_response.status_code == 200:
                    token_content = token_response.content.decode('utf-8')
                    token_data = json.loads(token_content)

                    # Append meeting link based on user preferences & available token data
                    if user.google_meet and token_data.get('hangoutLink'):
                        email_content += f"Meeting Link: {token_data.get('hangoutLink')}\n"
                    elif user.meet_url:
                        email_content += f"Meeting Link: {user.meet_url}\n"

                    # ----- Google Calendar Rescheduling -----
                    google_access_token = token_data.get('google_access_token')
                    if google_access_token:
                        google_url = f"https://www.googleapis.com/calendar/v3/calendars/primary/events/{appointment.eventId}?sendUpdates=all&conferenceDataVersion=1"
                        headers = {
                            "Authorization": f"Bearer {google_access_token}",
                            "Content-Type": "application/json"
                        }
                        google_data = {
                            "description": email_content,
                
                            "start": {
                                "dateTime": local_start_dt.isoformat(),
                                "timeZone": apt_timezone
                            },
                            "end": {
                                "dateTime": local_end_dt.isoformat(),
                                "timeZone": apt_timezone
                            },
                            "conferenceDataVersion": 1,
                    
                            "attendees": [
                                {"email": user.email},
                                {"email": appointment.fk_contact.email}
                            ],
                            "reminders": {
                                "useDefault": False,
                                "overrides": [
                                    {"method": "email", "minutes": 1440},
                                    {"method": "popup", "minutes": 10}
                                ]
                            },
                            "guestsCanSeeOtherGuests": True,

                        }
                       
                        google_put_response = requests.patch(google_url, headers=headers, data=json.dumps(google_data))
                        
                        if google_put_response.status_code == 200:
                            updated_field["eventId"] = appointment.eventId
                        else:
                            return JsonResponse({"message": "Error rescheduling event in Google Calendar"}, status=status.HTTP_400_BAD_REQUEST)

                    # ----- Outlook Calendar Rescheduling -----
                    outlook_access_token = token_data.get('outlook_access_token')
                    if outlook_access_token:
                        outlook_url = f"https://graph.microsoft.com/v1.0/me/events/{appointment.eventId}"
                        headers = {
                            "Authorization": f"Bearer {outlook_access_token}",
                            "Content-Type": "application/json"
                        }
                        outlook_data = {
            
                            "body": {"contentType": "HTML", "content": email_content},
                            "start": {
                                "dateTime": local_start_dt.isoformat(),
                                "timeZone": apt_timezone
                            },
                            "end": {
                                "dateTime": local_end_dt.isoformat(),
                                "timeZone": apt_timezone
                            },
                            "location": {"displayName": "Online"},
                            "attendees": [
                                {
                                    "emailAddress": {"address": user.email, "name": user.name},
                                    "type": "required"
                                },
                                {
                                    "emailAddress": {"address": appointment.fk_contact.email, "name": appointment.fk_contact.name},
                                    "type": "required"
                                }
                            ],
                            "allowNewTimeProposals": True,
                            "isOnlineMeeting": True,
                            "onlineMeetingProvider": "teamsForBusiness",
                            "reminderMinutesBeforeStart": 15,
                            "isReminderOn": True
                        }
                        outlook_patch_response = requests.patch(outlook_url, headers=headers, data=json.dumps(outlook_data))
                        if outlook_patch_response.status_code == 200:
                            updated_field["eventId"] = appointment.eventId
                        else:
                            return JsonResponse({"message": "Error rescheduling event in Outlook Calendar"}, status=status.HTTP_400_BAD_REQUEST)

                    caldav_user = token_data.get('caldav_user')
                    if caldav_user:
                        print("Rescheduling using caldav")
                        try:
                            success, result = reschedule_caldav_event(
                                user=user,
                                event_id=appointment.eventId,
                                new_date=new_appointment_date,
                                new_time=new_appointment_time,
                                duration=new_duration,
                                timezone_name=apt_timezone
                            )
                            if success:
                                appointment.eventId = result.id
                                appointment.save()
                                updated_field["eventId"] = appointment.eventId
                            else:
                                return JsonResponse({"message": f"CalDAV reschedule failed: {result}"},
                                                    status=status.HTTP_400_BAD_REQUEST)

                        except Exception as e:
                            return JsonResponse(
                                {"message": "Error Rescheduling event in CalDAV calendar", "error": str(e)},
                                status=status.HTTP_400_BAD_REQUEST)
                else:
                    response_content = token_response.content.decode('utf-8')
                    error_data = json.loads(response_content)
                    return Response(error_data, status=token_response.status_code)
            else:
                return JsonResponse({'message': 'Appointment rescheduled successfully', 'appointment': updated_field,
                                     "error": "evenID not found thus emails didnt send"},
                                    status=status.HTTP_200_OK)
            if mail:
                return JsonResponse({'message': 'Appointment rescheduled successfully', 'appointment': updated_field},
                                    status=status.HTTP_200_OK)
        except Exception as e:
            # Optionally log the full exception: logger.exception(e)
            return JsonResponse({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)


    @action(methods=["POST"], detail=False)
    def cancel_appointment(self, request):
        try:
            user, user_appointment, appointment = valid_appointment(request)

            # Check if the appointment is already canceled
            if appointment.status == "canceled":
                return Response({'message': 'Appointment is already canceled'}, status=status.HTTP_400_BAD_REQUEST)

            # Update appointment status to "canceled"
            appointment.status = "canceled"
            appointment.deleted_at = datetime.datetime.now()
            appointment.save()

            user_appointment.status = "canceled"
            user_appointment.timestamp = datetime.datetime.now()
            user_appointment.save()

            # timeline
            timeline = Timeline.objects.filter(meeting_id=appointment.appointment_id).first()
            if timeline:
                timeline.delete()

            Timeline.objects.create(
                action_type="delete_meeting",
                content="Canceled a meeting at",
                fk_user=user,
                fk_contact_id=appointment.fk_contact_id,
                meeting_id=appointment.appointment_id
            )
            # Prepare cancellation response data
            canceled_field = {
                "appointment_id": appointment.appointment_id,
                "appointment_name": appointment.appointment_name,
                "appointment_date": appointment.appointment_date,
                "appointment_time": appointment.appointment_time,
                "duration": appointment.duration,
                "status": appointment.status,
                "guest": appointment.guests,
                "meet_link": appointment.meet_link,
                "contacts": {"contact_id": appointment.fk_contact.id, "contact_name": appointment.fk_contact.name}
            }
            print(appointment.appointment_time)
            schedule = "cancelled"
            message = ""
            title = "Appointment Cancelled"
            click = "Meeting Cancelled"
            subject = "NSG | Appointment Cancelled with "
            time_zone = request.data.get("timezone_name")
            frontend_timezone = request.data.get("timezone")
            timezone_validator = RegexValidator(
                    regex=r'^\d{1,2}:\d{1,2} [AaPp][Mm] \d{4}-\d{2}-\d{2} [A-Za-z\s]+( [A-Za-z\s]+)( GMT(\+|-)\d{1,2}'
                          r'(\:\d{1,2})?)?$',
                    message='Invalid timezone format. It should be HH:mm PM/AM YYYY-MM-DD TIMEZONE'
                )
            try:
                timezone_validator(time_zone)
            except ValidationError:
                return Response({'message': 'Invalid Date format. It should be HH:mm PM/AM YYYY-MM-DD TIMEZONE'},
                                    status=status.HTTP_400_BAD_REQUEST)
            
            end_time = calculate_end_time(appointment.appointment_time, appointment.duration)
            email_content = (
                f"Meet With {appointment.fk_contact.name}\n"
                f"Event Name: {appointment.duration} Minute Meeting\n"
                f"Date: {appointment.appointment_date} at {appointment.appointment_time} to {end_time}\n"
            )
            try:
                mail = email_confirmation(
                    appointment=appointment,
                    schedule=schedule,
                    appointment_timezone=appointment.timezone,
                    time_zone=frontend_timezone,
                    message=message,
                    title=title,
                    click=click,
                    subject=subject,
                    deleted=True
                )

            except Exception as e:
                return JsonResponse({'message': "Email can't be sent", "error": str(e)},
                                    status=status.HTTP_400_BAD_REQUEST)
            if appointment.eventId:
                token_response = OutlookView().get_token(request, user=user)
                if token_response.status_code == 200:
                    token_content = token_response.content.decode('utf-8')
                    token_data = json.loads(token_content)
                    if user.google_meet and token_data.get('hangoutLink'):
                        email_content += f"Meeting Link: {token_data.get('hangoutLink')}\n"
                    elif user.meet_url:
                        email_content += f"Meeting Link: {user.meet_url}\n"
                    # ----- Google Calendar Event Cancellation -----
                    google_access_token = token_data.get('google_access_token')
                    if google_access_token:
                        google_url = f"https://www.googleapis.com/calendar/v3/calendars/primary/events/{appointment.eventId}?sendUpdates=all"
                        headers = {
                            "Authorization": f"Bearer {google_access_token}",
                            "Content-Type": "application/json"
                        }
                        google_data = {
                            "status": "cancelled",
                            "summary": f"App. with {appointment.fk_contact.name} X {user.name}",
                            "description": email_content,
                            "location": user.meet_url,
                            "start": {
                                "dateTime": f"{appointment.appointment_date}T{appointment.appointment_time}",
                                "timeZone": appointment.timezone
                            },
                            "end": {
                                "dateTime": f"{appointment.appointment_date}T{end_time}",
                                "timeZone": appointment.timezone
                            },
                            "conferenceDataVersion": 1,
                            "attendees": [
                                {"email": user.email},
                                {"email": appointment.fk_contact.email}
                            ],
                            "reminders": {
                                "useDefault": False,
                                "overrides": [
                                    {"method": "email", "minutes": 1440},
                                    {"method": "popup", "minutes": 10}
                                ]
                            },
                            "guestsCanSeeOtherGuests": True,
                        }
                        google_delete_response = requests.delete(google_url, headers=headers)
                        if google_delete_response.status_code == 204:
                            canceled_field["eventId"] = appointment.eventId
                        else:
                            return JsonResponse({"message": "Error canceling event in Google Calendar"}, status=status.HTTP_400_BAD_REQUEST)
                    # ----- Outlook Calendar Event Cancellation -----
                    outlook_access_token = token_data.get('outlook_access_token')
                    if outlook_access_token:
                        outlook_url = f"https://graph.microsoft.com/v1.0/me/events/{appointment.eventId}?sendCancellations=true"
                        headers = {
                            "Authorization": f"Bearer {outlook_access_token}",
                            "Content-Type": "application/json"
                        }
                        outlook_data = {
                            "isCancelled": True
                        }
                        outlook_delete_response = requests.delete(outlook_url, headers=headers)
                        if outlook_delete_response.status_code == 204:
                            canceled_field["eventId"] = appointment.eventId
                        else:
                            return JsonResponse({"message": "Error canceling event in Outlook Calendar"}, status=status.HTTP_400_BAD_REQUEST)
                    caldav_user = token_data.get('caldav_user')
                    if caldav_user:
                        print("Cancellation using caldav")
                        try:
                            caldav_cancelled = cancel_caldav_event(appointment.eventId, user)
                            if caldav_cancelled:
                                canceled_field["eventId"] = appointment.eventId
                            else:
                                return JsonResponse({"message": "Event not found in CalDAV calendar"},
                                                    status=status.HTTP_400_BAD_REQUEST)
                        except Exception as e:
                            return JsonResponse(
                                {"message": "Error canceling event in CalDAV calendar", "error": str(e)},
                                status=status.HTTP_400_BAD_REQUEST)


                else:
                    response_content = token_response.content.decode('utf-8')
                    error_data = json.loads(response_content)
                    return Response(error_data, status=token_response.status_code)


            else:
                return JsonResponse({'message': 'Appointment canceled successfully', 'appointment': canceled_field,
                                     "error": "evenID not found thus emails didnt send to contact"}, status=status.HTTP_200_OK)
            if mail:
                    return JsonResponse({'message': 'Appointment canceled successfully', 'appointment': canceled_field},
                                        status=status.HTTP_200_OK)



        except Exception as e:
            return JsonResponse({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def get_appointments(self, request):
        try:
            user = get_user_from_token(request)
            now_utc = timezone.now()
            num_appointments = request.data.get("num_appointments", 4)
            fetch_previous = request.data.get("fetch_previous", False)

            # Receive timezone from frontend
            frontend_timezone = request.data.get("timezone")
            frontend_timezone = pytz.timezone(frontend_timezone)

            data = []

            if fetch_previous:
                # Fetch previous appointments
                user_appointments = AdvisorAppointment.objects.filter(
                fk_user=user,
                fk_appointment__appointment_start_at__lt=now_utc
            ).exclude(status__in=["inactive", "canceled"]).order_by('-fk_appointment__appointment_start_at')[:num_appointments]
            else:
                # Fetch upcoming appointments
                user_appointments = AdvisorAppointment.objects.filter(
                    fk_user=user,
                    fk_appointment__appointment_start_at__gte=now_utc
                ).exclude(status__in=["inactive", "canceled"]).order_by('fk_appointment__appointment_start_at')[:num_appointments]

            for user_appointment in user_appointments:
                appointment = user_appointment.fk_appointment

                appointment_time, _ = appointment_in_timezone(appointment, request.data.get("timezone"))

                # Format guest list
                guest_list = appointment.get_guests_list()

                # Determine meet link
                meet_link = appointment.meet_link or user.meet_url

                data.append({
                    "status": appointment.status,
                    "time": appointment_time.strftime("%H:%M:%S"),
                    "appointment": appointment.appointment_id,
                    "fk_contact_id": appointment.fk_contact.id,
                    "contact_name": appointment.fk_contact.name,
                    "duration": appointment.duration,
                    "date": appointment_time.strftime("%Y-%m-%d"),
                    "appointment_start_at": appointment_start_utc(appointment).isoformat(),
                    "url": meet_link,
                    "contact_phone": appointment.fk_contact.phone,
                    "fk_user_name": user.name,
                    "meeting_name": appointment.appointment_name,
                    "guests": guest_list,
                    "owner": user_appointment.owner,
                    "contact_email": appointment.fk_contact.email,
                })

            return JsonResponse(data, status=status.HTTP_200_OK, safe=False)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
