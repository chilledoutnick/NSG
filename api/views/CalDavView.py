import json
import pytz
from api.models import Contact, Email, User
from api.models.CalDav import CalDav
from api.utils.encryption import decrypt_password, encrypt_password
from api.views.Services import send_caldav_email, send_coupon, get_user_from_token
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from api.models.Campain import Campain,Coupon
from api.serializers import CampainSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from datetime import datetime
from django.contrib.auth.hashers import make_password
from caldav import DAVClient
from caldav.lib.error import AuthorizationError



class CalDavView(viewsets.GenericViewSet):
    @action(methods=["POST"], detail=False)
    def CalDavUser(self, request):
        try:
            # Retrieve the user from the token
            user = get_user_from_token(request)

            # Retrieve data from the request
            platform = request.data["platform"]
            if platform=="icloud":
                url = "https://caldav.icloud.com/"
            elif platform=="webnames":
                url="https://securemail.webnames.ca/UserDAV/"
            elif platform=="zoho":
                url = request.data["url"]
            username = request.data["username"]
            username = request.data["username"]
            password = encrypt_password(request.data['password'])

            try:
                client = DAVClient(url, username=username, password=decrypt_password(password))
                principal = client.principal()
                calendars = principal.calendars()  # This triggers authentication
            except AuthorizationError:
                return Response(
                    {"message": "Invalid CalDAV credentials."},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            except Exception as e:
                return Response(
                    {"message": f"Failed to connect to CalDAV server: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )


            # Check if a CalDav entry already exists for the user
            caldav_entry, created = CalDav.objects.update_or_create(
                fk_user=user,
                defaults={
                    "platform": platform,
                    "url": url,
                    "username": username,
                    "password": password,
                    "timestamp": datetime.now()
                }
            )

            if created:
                message = "Data saved successfully"
            else:
                message = "Data updated successfully"

            return Response({"message": message}, status=status.HTTP_200_OK)

        except KeyError as e:
            # Handle missing required fields
            return Response({"message": f"Missing required field: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            # Handle other exceptions
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        

    @action(methods=["POST"], detail=False)
    def AddEvent(self, request):
        try:
            try:
                user_id = request.data.get("user_id")
                user=User.objects.get(id=user_id) 
            except:

                user = get_user_from_token(request)

            try:
                caldavUser = CalDav.objects.get(fk_user=user)
            except CalDav.DoesNotExist:
                return Response({"message": "User has not integrated a CalDAV account"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                client = DAVClient(caldavUser.url, username=caldavUser.username, password=decrypt_password(caldavUser.password))
                principal = client.principal()
                calendars = principal.calendars()
                target_calendar = calendars[0]  # Use the first calendar or add logic to select the correct one
            except Exception as e:
                return Response({"message": f"Error connecting to CalDAV server: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                dtstart_str = request.data["dtstart"]  # e.g., "20250507T150000"
                dtend_str = request.data["dtend"]      # e.g., "20250507T160000"
                summary = request.data["summary"]
                timezone_str = request.data.get("timeZone")  # e.g., "Asia/Kolkata"

                # Get the timezone object
                timezone = pytz.timezone(timezone_str)

                # Parse and localize dtstart
                dtstart_naive = datetime.strptime(dtstart_str, "%Y%m%dT%H%M%S")
                dtstart_local = timezone.localize(dtstart_naive)

                # Convert to UTC
                dtstart_utc = dtstart_local.astimezone(pytz.utc)

                # Format as iCalendar datetime string with 'Z' suffix
                dtstart = dtstart_utc.strftime("%Y%m%dT%H%M%SZ")

                # Parse and localize dtend
                dtend_naive = datetime.strptime(dtend_str, "%Y%m%dT%H%M%S")
                dtend_local = timezone.localize(dtend_naive)

                # Convert to UTC
                dtend_utc = dtend_local.astimezone(pytz.utc)

                # Format as iCalendar datetime string with 'Z' suffix
                dtend = dtend_utc.strftime("%Y%m%dT%H%M%SZ")
                event = target_calendar.save_event(f"""
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:{summary}
DTSTART:{dtstart}
DTEND:{dtend}
BEGIN:VALARM
TRIGGER:-PT10M
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR
                """)
                print(event)
            except KeyError as e:
                return Response({"message": f"Missing required field: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
            except ValueError:
                return Response({"message": "Invalid datetime format for dtstart or dtend"}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"message": f"Error creating event: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                "message": "Event created successfully",
                "event": {
                    "summary": summary,
                    "dtstart": dtstart,
                    "dtend": dtend,
                    "id": event.icalendar_instance.subcomponents[0]["UID"],
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

    @action(methods=["POST"], detail=False)
    def isCaldavUser(self,request):
        try:
            user = get_user_from_token(request)

            try:
                caldavUser = CalDav.objects.get(fk_user=user)
                return Response({"message": "User has integrated a CalDAV account"}, status=status.HTTP_200_OK)

            except CalDav.DoesNotExist:
                return Response({"message": "User has not integrated a CalDAV account"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    
    @action(methods=["POST"], detail=False)
    def SendCaldavMail(self, request):
        try:
            user = get_user_from_token(request)

            try:
                caldavUser = CalDav.objects.get(fk_user=user)
            except CalDav.DoesNotExist:
                return Response({"message": "User has not integrated a CalDAV account"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                email_content = request.data["email_content"]
                email_subject = request.data["email_subject"]

                # Parse contacts (JSON string)
                contacts_raw = request.data["contacts"]
                contacts = json.loads(contacts_raw)

                if not contacts:
                    return Response({"message": "No contacts provided"}, status=status.HTTP_400_BAD_REQUEST)

                email_recipients_list = [c["email"] for c in contacts]
                contact_names = [c["name"] for c in contacts]

                # Parse CC (optional)
                cc_raw = request.data.get("cc_recipients", "")
                cc_recipients_list = [email.strip() for email in cc_raw.split(",") if email.strip()]

                if cc_recipients_list and len(email_recipients_list) > 1:
                    return Response({
                        "message": "If CC recipients are provided, only one 'To' recipient is allowed."
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Attachments list (optional)
                attachments = request.FILES.getlist("attachments")

                mail = send_caldav_email(
                    user=user,
                    caldav_user=caldavUser,
                    email_content=email_content,
                    email_subject=email_subject,
                    email_recipients_list=email_recipients_list,
                    attachments=attachments,
                    cc_recipients_list=cc_recipients_list,
                    contact_names=contact_names
                )

                if mail is True:
                    return Response({"message": "Email sent successfully"}, status=status.HTTP_200_OK)
                else:
                    return Response({"message": f"Error sending email: {mail}"}, status=status.HTTP_400_BAD_REQUEST)

            except KeyError as e:
                return Response({"message": f"Missing required field: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
            except json.JSONDecodeError:
                return Response({"message": "Invalid JSON in 'contacts'"}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"message": f"Error sending email: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
