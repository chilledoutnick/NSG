import base64
import json
from urllib.parse import urlencode
from zoneinfo import ZoneInfo

import requests
from email.mime.text import MIMEText
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
import requests
from datetime import datetime, timedelta
import dateparser
from twilio.rest import Client

from api.models import User, Agent
# If you want to convert timezones & format nicely:
from datetime import datetime
from zoneinfo import ZoneInfo

from django.conf import settings

GOOGLE_API_BASE = "https://www.googleapis.com/calendar/v3"
GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1"
TWILIO_ACCOUNT_SID = getattr(settings, "TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = getattr(settings, "TWILIO_AUTH_TOKEN", "")
TWILIO_FROM_NUMBER = getattr(settings, "TWILIO_PHONE_NUMBER", getattr(settings, "TWILIO_FROM_NUMBER", ""))



def send_email(user: User, to_email: str, to_name: str, subject: str, body: str):
    """
    Send an email using the user's Gmail account.
    """

    # Compose email
    message = MIMEText(body, "plain")
    message["to"] = f"{to_name} <{to_email}>"
    message["from"] = user.email
    message["subject"] = subject

    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

    headers = {
        "Authorization": f"Bearer {user.google_access_token}",
        "Content-Type": "application/json",
    }

    data = {"raw": raw_message}

    resp = requests.post(f"{GMAIL_API_BASE}/users/me/messages/send", headers=headers, json=data)
    if resp.status_code not in (200, 201):
        raise Exception(f"Failed to send email: {resp.text}")

    return resp.json()

def send_sms(resp, user_number):
    resp_data = resp["data"]

    host = resp_data["hosts"][0]
    attendee = resp_data["attendees"][0]

    meeting_title = resp_data["title"]
    meeting_url = resp_data["meetingUrl"]
    start = resp_data["start"]
    end = resp_data["end"]

    start_dt = datetime.fromisoformat(start.replace("Z", "+00:00"))
    end_dt = datetime.fromisoformat(end.replace("Z", "+00:00"))

    # Convert example → America/Mazatlan (you can replace)
    display_tz = ZoneInfo(host["timeZone"])
    start_local = start_dt.astimezone(display_tz)
    end_local = end_dt.astimezone(display_tz)

    # Format readable date
    date_str = start_local.strftime("%A, %B %d, %Y")
    time_str = f"{start_local.strftime('%I:%M%p')} - {end_local.strftime('%I:%M%p')} ({ ' '.join(host['timeZone'].split('_'))})"

    query = urlencode({
        "name": attendee["name"],
        "email": attendee["email"],
        "overlayCalendar": "true"
    })

    body = f"""
Hey! A 15-minute meeting with you and {host["name"]} is scheduled successfully.

📅Date & Time: {date_str} | {time_str}

👥Participants:

• Organizer: {host["name"]} ({host["email"]})
• Guest: {attendee["name"]} ({attendee["email"]})

🔗Meeting URL: {meeting_url}

Need to make a change?

Reschedule: https://cal.com/{host['username']}/{resp_data['eventType']['slug']}?{query}

Cancel: https://cal.com/booking/{resp_data['uid']}?cancel=true&allRemainingBookings=false&cancelledBy={host['email']}
                    """
    print(body)
    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    client.messages.create(
        body=body,
        from_=TWILIO_FROM_NUMBER,
        to=user_number,
    )
    return body

class AgentView(viewsets.GenericViewSet):
    # @action(methods=["POST"], detail=False)
    # def check_availability(self, request):
    #     """
    #     Check availability of a user’s Google Calendar within a given window.
    #     Example query:
    #       /api/calendar/check-availability/?email=john@example.com&start=2025-10-14T09:00:00Z&end=2025-10-14T12:00:00Z
    #     """
    #     # email = request.data.get("email")
    #     start = request.data.get("start")
    #     end = request.data.get("end")
    #     agent_id = request.data.get("agent_id")
    #
    #
    #     if not all([agent_id, start, end]):
    #         return Response({"error": "email, start, and end are required."}, status=status.HTTP_400_BAD_REQUEST)
    #
    #     agent = Agent.objects.get(id=agent_id)
    #
    #
    #     headers = {
    #         "Authorization": f"Bearer {agent.fk_user.google_access_token}",
    #         "Content-Type": "application/json",
    #     }
    #
    #     data = {
    #         "timeMin": start,
    #         "timeMax": end,
    #         "timeZone": "UTC",
    #         "items": [{"id": "primary"}],
    #     }
    #
    #     resp = requests.post(f"{GOOGLE_API_BASE}/freeBusy", headers=headers, json=data)
    #     if resp.status_code != 200:
    #         return Response({"error": resp.text}, status=resp.status_code)
    #
    #     busy_slots = resp.json().get("calendars", {}).get("primary", {}).get("busy", [])
    #     return Response({"busy": busy_slots})
    #
    # @action(methods=["POST"], detail=False)
    # def book_google_meeting(self, request):
    #     """
    #     Book a meeting for the given user.
    #     Request body:
    #     {
    #       "email": "john@example.com",
    #       "start": "2025-10-14T15:00:00Z",
    #       "end": "2025-10-14T15:30:00Z",
    #       "attendee_name": "John Doe",
    #       "attendee_email": "john@example.com",
    #       "summary": "Demo Meeting"
    #     }
    #     """
    #     data = request.data
    #     agent_id = request.data.get("agent_id")
    #     # email = data.get("email")
    #     start = data.get("start")
    #     end = data.get("end")
    #     attendee_name = data.get("attendee_name", "")
    #     attendee_email = data.get("attendee_email")
    #     summary = data.get("summary", "Meeting")
    #
    #     if not all([agent_id, start, end, attendee_email]):
    #         return Response({"error": "Missing required fields."}, status=status.HTTP_400_BAD_REQUEST)
    #
    #     agent = Agent.objects.get(agent_id=agent_id)
    #
    #     headers = {
    #         "Authorization": f"Bearer {agent.fk_user.google_access_token}",
    #         "Content-Type": "application/json",
    #     }
    #
    #     event = {
    #         "summary": summary,
    #         "start": {"dateTime": start, "timeZone": "UTC"},
    #         "end": {"dateTime": end, "timeZone": "UTC"},
    #         "attendees": [{"email": attendee_email, "displayName": attendee_name}],
    #         "conferenceData": {"createRequest": {"requestId": f"meet-{datetime.now().timestamp()}",
    #                                              "conferenceSolutionKey": {"type": "hangoutsMeet"}}},
    #     }
    #
    #     params = {"conferenceDataVersion": 1}
    #     resp = requests.post(f"{GOOGLE_API_BASE}/calendars/primary/events", headers=headers, json=event, params=params)
    #
    #     if resp.status_code not in (200, 201):
    #         return Response({"error": resp.text}, status=resp.status_code)
    #
    #     return Response({"success": True, "data": resp.json()}, status=status.HTTP_201_CREATED)

    @action(methods=["POST"], detail=False)
    def check_availability(self, request):
        """
        Check Cal.com availability for a given agent.
        Expected payload:
        {
            "agent_name": "teng-menor",
            "start_time": "next Monday at 9 AM"   # natural language time
        }
        """
        try:
            agent_name = request.data.get("agent_id")
            start_input = request.data.get("start_time")
            ai_timezone = request.data.get("timezone", "America/New_York")

            if not agent_name or not start_input:
                return Response(
                    {"error": "agent_name and start_time are required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Get Cal.com API key for this agent
            agent = Agent.objects.filter(agent_name=agent_name).first()
            if not agent or not agent.secret_key:
                return Response(
                    {"error": f"No Cal.com API key found for agent '{agent_name}'."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Convert natural language time to ISO-8601 in America/Mazatlan timezone

            # --- Parse ISO8601 start_time ---
            try:
                start_dt = datetime.fromisoformat(start_input)
            except ValueError:
                return Response(
                        {"error": "start_time must be in ISO 8601 format (e.g. 2025-09-15T09:00:00-07:00)."},
                        status=status.HTTP_400_BAD_REQUEST,
                )

            # --- Convert to Mazatlan timezone for Cal.com ---
            start_dt_tz = start_dt.astimezone(ZoneInfo(ai_timezone))
            end_dt_tz = start_dt_tz + timedelta(hours=3)

            start_iso = start_dt_tz.isoformat()
            end_iso = end_dt_tz.isoformat()

            print(start_iso)
            print(end_iso)
            # Prepare API call to Cal.com
            cal_url = "https://api.cal.com/v2/slots"
            headers = {
                "Authorization": f"Bearer {agent.secret_key}",
                "cal-api-version": "2024-09-04",
            }
            params = {
                "start": start_iso,
                "end": end_iso,
                "timeZone": ai_timezone,
                "eventTypeSlug": "15min",
                "username": agent.agent_username,
            }

            # Call Cal.com API
            response = requests.get(cal_url, headers=headers, params=params)

            if response.status_code != 200:
                return Response(
                    {
                        "error": "Failed to fetch slots from Cal.com",
                        "details": response.text,
                    },
                    status=response.status_code,
                )

            return Response(response.json(), status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(methods=["POST"], detail=False)
    def book_meeting(self, request):
        """
        Book a meeting for a given agent via Cal.com.

        Expected payload:
        {
            "agent_id": "teng-menor",
            "start_time": "2025-09-15T09:00:00-07:00",
            "timezone": "America/New_York",
            "name": "John Doe",
            "email": "john@example.com",
            "notes": "Discuss project details",
            "event_type_slug": "15min"   # optional, defaults to 15min
        }
        """
        try:
            # --- Extract payload ---
            agent_id = request.data.get("agent_id")
            start_time = request.data.get("start_time")
            ai_timezone = request.data.get("timezone", "America/New_York")
            name = request.data.get("name")
            email = request.data.get("email")
            event_type_slug = request.data.get("event_type_slug", "15min")
            caller_number = request.data.get("caller_number")

            # --- Validate required fields ---
            if not all([agent_id, start_time, name, email]):
                return Response(
                    {"error": "agent_id, start_time, name, and email are required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if "30" in event_type_slug:
                event_type_slug = "30min"
            elif "15" in event_type_slug:
                event_type_slug = "15min"
            else:
                event_type_slug = "15min"
            # --- Fetch Cal.com API key ---
            agent = Agent.objects.filter(agent_name=agent_id).first()
            if not agent or not agent.secret_key:
                return Response(
                    {"error": f"No Cal.com API key found for agent '{agent_id}'."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # --- Parse start time ---
            try:
                start_dt = datetime.fromisoformat(start_time)
            except ValueError:
                return Response(
                    {"error": "start_time must be in ISO 8601 format (e.g. 2025-09-15T09:00:00-05:00)."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # --- Convert to Mazatlan timezone for Cal.com ---
            start_dt_tz = start_dt.astimezone(ZoneInfo(ai_timezone))

            # Default duration based on event type
            duration_minutes = 15 if event_type_slug == "15min" else 30
            end_dt_tz = start_dt_tz + timedelta(minutes=duration_minutes)
            print(start_dt_tz.isoformat(), end_dt_tz.isoformat())

            # --- Prepare request ---
            cal_url = "https://api.cal.com/v2/bookings"
            headers = {
                "Authorization": f"Bearer {agent.secret_key}",
                "cal-api-version": "2024-08-13",
                "Content-Type": "application/json",
            }

            payload = {
                "start": start_dt_tz.isoformat(),
                "eventTypeSlug": event_type_slug,
                "attendee": {
                        "name": name,
                        "email": email,
                    "timeZone": ai_timezone,
                    "language": "en",
                }
                ,
                "username": agent.agent_username,
            }
            print(payload)
            # --- Make API call ---
            response = requests.post(cal_url, headers=headers, json=payload)

            if response.status_code not in (200, 201):
                print(response.json()["error"]['message'])
                return Response(
                    {
                        "error": response.json()["error"]['message'],
                        "details": response.text,
                    },
                    status=response.status_code,
                )
            send_sms(response.json(), caller_number)

            return Response(response.json(), status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=["POST"], detail=False)
    def send_followup_email(self, request):
        """
        Sends a follow-up email to a given recipient.
        Expected payload:
        {
            "email": "client@example.com",
            "name": "John Doe"
        }
        """
        try:
            # agent_id = request.data.get("agent_id","")
            # receiver_email = request.data.get("email","")
            # name = request.data.get("name","")
            # # email = request.data.get("user_email")
            # agent = Agent.objects.get(id=agent_id)
            # email = agent.owner
            #
            # if not receiver_email or not name:
            #     return Response({"message": "Missing required fields (email, name)."},
            #                     status=status.HTTP_400_BAD_REQUEST)
            # try:
            #     user = User.objects.filter(email=email).first()
            # except User.DoesNotExist:
            #     return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
            #
            # subject = f"Follow-Up from Your Advisor"
            # message = f"""
            # <html>
            # <body>
            #     <p>Hi {name},</p>
            #     <p>It was great connecting with you! I just wanted to follow up regarding our recent discussion.</p>
            #     <p>Please let me know if you’d like to schedule a quick call or if you have any questions.</p>
            #     <br>
            #     <p>Best regards,<br>Your Advisor Team</p>
            # </body>
            # </html>
            # """

            try:
                # result = send_email(user, receiver_email, name, subject, message)
                resp=""
                body = tuple(resp.split("\n"))
                # print(body)

            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

            return Response({"success": True, "data": body}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"message": f"Failed to send email: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(methods=["POST"], detail=False)
    def agent_details(self, request):
        agent_id = request.data.get("agent_id")
        owner_email = request.data.get("owner_email")
        if not agent_id:
            return Response({"error": "Missing required fields (agent_id)."},
                            status=status.HTTP_400_BAD_REQUEST)
        print(agent_id)
        #add agent id
        agent = Agent.objects.filter(agent_name=agent_id, owner=owner_email).first()
        if not agent:
            user = User.objects.filter(email=owner_email).first()
            agent = Agent.objects.create(agent_name=agent_id, owner=owner_email, fk_user=user)
            #cal_live_674b641f214467dee95fac3633b900ce
        return Response({"agent": agent_id, "owner_email": owner_email, "agent_id": agent.id}, status=status.HTTP_200_OK)

    @action(methods=["POST"], detail=False)
    def create_agent(self, request):
        """
        AUTOMATION:
        1. Create ElevenLabs Agent
        2. Buy Twilio Number
        3. Save mapping in DB
        """

        # Load keys
        ELEVENLABS_API_KEY = "sk_1ddff67fbd57ccc92d88aec896eb042d75609634b29fcc9d"


        if not all([ELEVENLABS_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN]):
            return Response(
                {"error": "Missing API keys"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        data = request.data

        required = ["client_name", "agent_name"]
        missing = [f for f in required if f not in data]

        if missing:
            return Response(
                {"error": f"Missing fields: {', '.join(missing)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        client_name = data["client_name"]
        client_email = data["client_email"]
        company_name = data["company_name"]
        agent_name = data["agent_name"]
        # voice_id = data.get("voice_id", "XcXEQzuLXRU9RcfWzEJt")
        requirement = data["requirement"]
        language = data.get("language", "en")
        one_liner = data.get("one_liner", False)
        timezone = data.get("timezone", "America/New_York")
        voicemail = data.get("voicemail", "")
        phone_number = data.get("phone_number", "+919477230267")
        area_code = data.get("area_code", "510")

        # Prevent creating multiple agents for same client
        if Agent.objects.filter(owner=client_email).exists():
            return Response(
                {"error": "Agent already exists for this client. Duplicate creation is not allowed."},
                status=status.HTTP_400_BAD_REQUEST
            )




        """
        -------------------------
        STEP 1: CREATE AGENT (11Labs)
        -------------------------
        """
        prompt = f"""
        ⸻
 Agent System Prompt: {agent_name} (Inbound Call Flow)

 Agent Identity

Name: {agent_name}
Role: AI Assistant for {company_name}
Owner Email: {client_email}

⸻

 System Instructions
	1.	On call connection:
•	Context: May handle inbound calls and outbound calls.
Call Type: {{call_type}} call
	•	Caller ID: {{{{system__caller_id}}}}
	•	Time: {{{{system__time}}}}
	•	Timezone: Auto-detect using tz database.
	•	User phone: {{{{system__called_number}}}}
→ Automatically execute:
Call Agent_id(owner_email="{client_email}")

	2.	You have access to these tools:
	•	available_slots(agent__id, date)
	•	meet_booking( "slot_time": "...", "name": "...", "email": "..." )
	3.	During tool use, narrate actions aloud briefly (to avoid awkward silence):
	•	“One moment please, I’m checking our availability…”
	•	“Got it, I’m just confirming your booking now…”
	•	“All set, I’m saving that for you…”

⸻

 Greeting Logic (Inbound)


Detect caller tone and choose greeting:
	•	Default (neutral tone):
“Hi! This is {agent_name}, {client_name}’s AI assistant at {company_name}. What brings you our way today — are you in need of any {one_liner}”
	•	Upbeat / Conversational tone:
“Hey there! You’ve reached {company_name} — we help you {one_liner}! I’m {agent_name}, {client_name}’s AI assistant. What brings you our way today?”
	•	If caller sounds confused about AI voice:
“Oh, just so you know — I’m an AI assistant speaking on behalf of {client_name}. I help them schedule meetings and answer questions about our {one_liner}.”

(Pause for the caller’s response. Never monologue.)


⸻

 Service Explanation (When Caller Shows Interest)
Service Desc: 
{requirement}

“Awesome! At {company_name}, we help businesses {one_liner}.
Would you like me to set you up for a free onboarding session to show you how it works, or would you like me to forward the call to {client_name} and discuss it further with them?"

⸻

 Scheduling Process

If caller agrees:
	1.	Say:
“Let’s find a time that works best for you. I can schedule a free 30 minutes discovery call with {client_name}. Do you prefer weekdays or weekends?” 
when user reply weekdays. Ask to provide a specific day that suits best. "Sure, can you specify any particular day that suits best for you?"
	2.	Narrate when using tools:
	•	“Okay, I’m checking available times now…” (before calling available_slots)
	•	“Got it, I’m reserving that slot for you…” (after they say their prefered slot)
	•	“Perfect, I’m confirming the booking…” (before calling meet_booking)

    3. Error Handling:

If error in calling available_slot shows: User either already has booking at this time or is not available

Ask them for another slot as that time slot is not available. 
If some other error: Say booking system has some issue will send the meeting links as soon as possible.
	4.	Confirm email clearly:
“Great. I’ll book that for you. And just to confirm, your email is email_address, right?”
(Repeat for confirmation before saving.)
	5.	Before ending the call — if any step remains incomplete (like caller says “call me back” or gets disconnected):
“Before we wrap up, I noticed we didn’t finish booking your session. Would you like me to hold your preferred time, or should we continue later?”

⸻
 {agent_name}’s Personality Summary
	•	Friendly, efficient, clear, and responsive.
	•	Uses short, human-like pauses after each message.
	•	Never leaves silence while processing actions — always narrates activity.
	•	Confirms all bookings and emails out loud.
	•	Always aims to complete the call with at least a scheduled appointment or callback commitment.

⸻

Rules:

1. If Caller Requests a Scheduling Link

You never send a scheduling link.
Instead say (gently and friendly):

“I can take care of the scheduling for you right here on the call — it only takes a moment. What day works best for you?”


2. Email Policy

The only email you request or confirm is:

the caller’s email for booking a meeting


If asked for any other email (support, follow-ups, etc.), respond politely:

“I can help you right here, no need for another email. What would you like me to do next?”

3. If Call is Interrupted or Caller Hesitates

Before ending the call:

“Before we wrap up, I noticed we didn’t finish scheduling your session. Would you like me to save your preferred time, or should we continue later?”
4. Never repeat same thing more than once


        """
        first_msg = f"""Hi! This is {agent_name}, {client_name}’s AI assistant at {company_name}. I’m here to assist you
                     with anything related to our {one_liner} or to help you schedule a call with {client_name}. What
                     would you like to do today?"""
        tools = {
            "meet_booking": "tool_0401k74yeq8veraawt8cv6ppc0p3",
            "check_availability_cal": "tool_2001k4wre1xgecsrw4t43exfr282",
            "book_appointment_cal": "tool_9001k4wx6f8fe8qrkeen1vma9fds",
            "Agent_id": "tool_4801k7yjpt80e3bsnh2v6krrz2r3",
            "available_slots": "tool_7601k88qf52rfgxr13xmv2828mgm",
            "end_call": "tool_8801k4wn7nwme4stst2pgtvb6tt8"
        }
        headers = {"xi-api-key": ELEVENLABS_API_KEY}

        payload = {

             "name": f"{agent_name}_{client_name}_Agent",
            "description": f"Agent for {client_name}",
            "tags": [
            "inbound"
        ],
        "platform_settings": {
            "evaluation": {
                "criteria": [
                    {
                        "id": "customer_satisfaction",
                        "name": "Customer Satisfaction",
                        "conversation_goal_prompt": "Its success if meeting is scheduled or customer is happy and if not then its failure. The KPI is to schedule the meeting or answer all the questiosn of the user."
                    },
                    {
                        "id": "booking_demo",
                        "name": "Booking Demo",
                        "conversation_goal_prompt": "Successful if meeting is booked (only after book_meeting web hook calls successfully) if the call ends before that then its failure "
                    }
                ]
            },
            "data_collection": {
                "Name": {
                    "type": "string",
                    "description": "Name of the person calling"
                },
                "Email": {
                    "type": "string",
                    "description": "Email of the person calling"
                }
            }
        },

            "conversation_config": {
                "asr": {
                    "quality": "high",
                    "provider": "elevenlabs",
                    "user_input_audio_format": "pcm_16000",
                    "keywords": []
                },
                "agent": {
                    "prompt": {
                                "prompt": prompt,
                        "tool_ids": [
                    tools["Agent_id"],
                    tools["available_slots"],
                    tools["meet_booking"]
                ],
                        "built_in_tools": {
                    "end_call": {
                        "name": "end_call",
                        "params": {
                            "system_tool_type": "end_call"
                        },
                        "description": ""
                    },
                    "transfer_to_number": {
                        "name": "transfer_to_number",
                        "params": {
                            "system_tool_type": "transfer_to_number",
                            "transfers": [
                                {
                                    "condition": f"When asking for {client_name} or wanting to talk to them directly.",
                                    "transfer_destination": {
                                        "type": "phone",
                                        "phone_number": phone_number
                                    },
                                    "transfer_type": "sip_refer"
                                }
                            ]
                        },
                        "description": f"When asking for {client_name} or wanting to talk to them directly."
                    },
                    "skip_turn": {
                        "name": "skip_turn",
                        "params": {
                            "system_tool_type": "skip_turn"
                        }
                    },
                    "voicemail_detection": {
                        "name": "voicemail_detection",
                        "params": {
                            "system_tool_type": "voicemail_detection",
                            "voicemail_message": voicemail
                        }
                    }
                },
                        "timezone": timezone,
                            },
                    "language": language,
                    "first_message": first_msg,
                }
            }
        }
        print(payload)

        try:
            res = requests.post(
                "https://api.us.elevenlabs.io/v1/convai/agents/create",
                headers=headers,
                json=payload,
                timeout=15
            )
        except Exception as e:
            return Response(
                {"error": f"11Labs error: {str(e)}"},
                status=status.HTTP_502_BAD_GATEWAY
            )

        if res.status_code != 200:
            print(res.json())
            return Response(
                {"error": "Failed to create ElevenLabs agent", "details": res.text},
                status=res.status_code
            )

        agent_resp = res.json()
        elevenlabs_agent_id = agent_resp.get("agent_id")

        """
        -------------------------
        STEP 2: BUY TWILIO NUMBER
        -------------------------
        """

        account_sid = TWILIO_ACCOUNT_SID
        auth_token = TWILIO_AUTH_TOKEN
        client = Client(account_sid, auth_token)

        locals_numbers = client.available_phone_numbers("US").local.list(
            area_code=area_code, sms_enabled=True, voice_enabled=True, limit=20
        )


        phone_to_buy = locals_numbers[0].phone_number

        # 2B. Buy number
        buy_res = client.incoming_phone_numbers.create(
            phone_number= phone_to_buy,
            voice_url="https://api.us.elevenlabs.io/twilio/inbound_call",
            sms_url="https://demo.twilio.com/welcome/sms/reply"
        )

        twilio_sid= buy_res.sid

        incoming_phone_number = client.incoming_phone_numbers(
            twilio_sid
        ).fetch()

        print(incoming_phone_number.account_sid)

        purchased_number = incoming_phone_number.phone_number

        """
        -------------------------
        STEP 4: Agent to number MAPPING
        -------------------------
        """
        number_payload ={
        "provider": "twilio",
        "phone_number": purchased_number,
        "label": f"{client_name}Number",
        "sid": TWILIO_ACCOUNT_SID,
        "token": TWILIO_AUTH_TOKEN
    }
        try:
            number_res = requests.post(
                "https://api.us.elevenlabs.io/v1/convai/phone-numbers",
                headers=headers,
                json=number_payload,
                timeout=15
            )
        except Exception as e:
            return Response(
                {"error": f"11Labs error: {str(e)}"},
                status=status.HTTP_502_BAD_GATEWAY
            )

        if number_res.status_code != 200:
            print(number_res.json())
            return Response(
                {"error": "Failed to create ElevenLabs number", "details": number_res.text},
                status=number_res.status_code
            )

        number_agent_resp = number_res.json()
        elevenlabs_number_id = number_agent_resp.get("phone_number_id")

        mapping_payload = {
            "phone_number_id": elevenlabs_number_id,
            "agent_id": elevenlabs_agent_id
        }
        try:
            mapping_res = requests.patch(
                f"https://api.us.elevenlabs.io/v1/convai/phone-numbers/{elevenlabs_number_id}",
                headers=headers,
                json=mapping_payload,
                timeout=15
            )
        except Exception as e:
            return Response(
                {"error": f"11Labs error: {str(e)}"},
                status=status.HTTP_502_BAD_GATEWAY
            )

        if mapping_res.status_code != 200:
            print(number_res.json())
            return Response(
                {"error": "Failed to create ElevenLabs number", "details": mapping_res.text},
                status=mapping_res.status_code
            )
        print("Number mapped", mapping_res.json())


        """
        -------------------------
        STEP 4: SAVE MAPPING
        -------------------------
        """

        agent_obj = Agent.objects.create(
            client_name=client_name,
            info= f"{client_name}, {company_name}",
            agent_id=elevenlabs_agent_id,
            voice_id="cjVigY5qzO86Huf0OWal",
            prompt=prompt,
            language=language,
            twilio_number=purchased_number,
            owner=client_email
        )

        return Response(
            {
                "status": "success",
                "message": "Agent + Twilio Number created successfully.",
                "elevenlabs_agent_id": elevenlabs_agent_id,
                "elevenlabs_number_id": elevenlabs_number_id,
                "details": agent_resp,
                "twilio_number": purchased_number,
                "db_id": agent_obj.id
            },
            status=status.HTTP_201_CREATED)

