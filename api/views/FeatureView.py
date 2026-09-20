import base64
import json

import phonenumbers
import requests
from django.core.files.base import ContentFile
from django.db import IntegrityError
from django.http import JsonResponse
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from advisorapp.settings import SENDER_TOKEN, LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, PROXYCURL_API_KEY
from api.models import WorkingHour, Outlook
from api.models.refer import ReferralCode
from api.views.Services import *
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from api.views.OutlookView import OutlookView





class FeatureView(viewsets.GenericViewSet):

    @action(methods=["POST"], detail=False)
    def feature_checklist(self, request):
        try:
            user = get_user_from_token(request)
            availability = WorkingHour.objects.filter(fk_user_id=user.id, status='active').exists()
            profile_picture = False
            fb = "facebook" in user.facebook
            linkedin = "linkedin" in user.linkedin
            insta = "instagram" in user.instagram
            app_password = user.app_password is not None and user.app_password.strip() != ""
            if "img/NSG/user_profile_picture.png" not in user.fk_user.profile_picture.url:
                profile_picture = True
            meet_link = bool(user.meet_url and user.meet_url.strip())
            count = sum([
                not availability,
                not app_password,
                not profile_picture,
                not meet_link,
                not fb or not linkedin or not insta
            ])
            total_fields = 5  # Total number of fields being checked
            completed_fields = sum([availability, app_password, profile_picture, meet_link, fb and linkedin and insta])
            completion_percentage = (completed_fields / total_fields) * 100

            data = {
                "availability": availability,
                "facebook": fb,
                "linkedin": linkedin,
                "instagram": insta,
                "app_password": app_password,
                "profile_picture": profile_picture,
                "meet_link": meet_link,
                "incomplete_count": count,
                "completion_percentage": completion_percentage
            }

            return Response(data=data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # @action(methods=["POST"], detail=False)
    # def send_notification_view(self, request):
    #     # Example FCM token (retrieve this from your React frontend)
    #     fcm_token = request.data.get('fcm_token')
    #     title = request.data.get('title', 'Default Title')
    #     body = request.data.get('body', 'Default Body')
    #     image = request.data.get('image', None)  # Get the image URL if provided
    #     data = request.data.get('data', {})  # Optional additional data
    #
    #     # Send the notification
    #     response = send_push_notification(fcm_token, title, body, data, image)
    #
    #     if response:
    #         return Response({'success': True, "response": response}, status=status.HTTP_200_OK)
    #     else:
    #         return Response({'success': False}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def linkedin_access(self, request):
        code = request.data.get('code')
        redirect_uri = request.data.get('redirect_uri', '{{ FRONTEND_URL }}/card')

        if not code:
            return Response({'error': 'Authorization code is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Step 1: Get Access Token
        token_url = 'https://www.linkedin.com/oauth/v2/accessToken'
        token_data = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri,
            'client_id': LINKEDIN_CLIENT_ID,
            'client_secret': LINKEDIN_CLIENT_SECRET,
        }

        try:
            token_response = requests.post(token_url, data=token_data)
            token_response.raise_for_status()
            access_token = token_response.json().get('access_token')
        except requests.RequestException as e:
            return Response({'error': 'Failed to obtain access token', 'details': str(e)}, status=500)

        # Step 2: Get User Info
        try:
            profile_headers = {'Authorization': f'Bearer {access_token}'}

            # Basic profile
            profile_response = requests.get('https://api.linkedin.com/v2/userinfo', headers=profile_headers)
            profile_response.raise_for_status()
            profile_data = profile_response.json()
            #
            # # Email
            # email_response = requests.get(
            #     'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
            #     headers=profile_headers
            # )
            # email_response.raise_for_status()
            # email_data = email_response.json()
            # email = email_data['elements'][0]['handle~']['emailAddress']

            # user_info = {
            #     'id': profile_data.get('id'),
            #     'firstName': profile_data.get('localizedFirstName'),
            #     'lastName': profile_data.get('localizedLastName'),
            #     'email': email,
            # }

            return Response(profile_data, status=200)

        except requests.RequestException as e:
            return Response({'error': 'Failed to fetch LinkedIn user data', 'details': str(e)}, status=500)

    @action(methods=["POST"], detail=False)
    def linkedin_profile(self, request):
        try:
            user = get_user_from_token(request)

        except Exception as e:
            str(e)
            username = request.data.get("username")
            if not username:
                return Response({"error": "Username is required to match or create user"},
                                status=status.HTTP_400_BAD_REQUEST)
            user = User.objects.filter(username=username).first()

        try:
            linkedin_url = request.data.get("l_url")

            if not linkedin_url:
                return Response({"error": "LinkedIn URL is required"}, status=status.HTTP_400_BAD_REQUEST)

            response = requests.get(
                "https://nubela.co/proxycurl/api/v2/linkedin",
                headers={
                    "Authorization": f"Bearer {PROXYCURL_API_KEY}",
                },
                params={
                    "url": linkedin_url,
                    "use_cache": "if-present",
                }
            )

            if response.status_code != 200:
                return Response(
                    {"error": "Failed to fetch data from Proxycurl", "details": response.text},
                    status=response.status_code,
                )

            data = response.json()
            designation, company = data.get("occupation", " at ").split(" at ", 1)

            image_file = None
            profile_pic_url = data.get("profile_pic_url", "")
            if profile_pic_url:
                try:
                    # Download the image from the URL
                    response = requests.get(profile_pic_url)
                    response.raise_for_status()

                    file_name = os.path.basename(profile_pic_url.split("?")[0]) or "profile_picture.jpg"
                    if not os.path.splitext(file_name)[1]:  # Ensure extension
                        file_name += ".jpg"

                    image_file = ContentFile(response.content, name=file_name)
                except Exception as e:
                    print(f"Failed to process LinkedIn profile picture: {str(e)}")
                    image_file = None

            # Update user
            user.name = data.get("full_name", "")
            user.profile_picture = image_compressor(image_file, user)
            user.surname = data.get("last_name", "")
            user.address = f"{data.get('city', '')}, {data.get('state', '')}"
            user.about = data.get("summary", "")
            user.linkedin = linkedin_url
            user.company = company
            user.designation = designation
            user.user_meta_data = data
            user.save()

            return Response(
                {
                    "message": "User profile updated successfully",
                    "user_id": user.id,
                    "meta_data": data,
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response({"error": "Sorry got some issues during extracting your profile.",
                             "msg": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=["POST"], detail=False)
    def close_lead(self, request):
        """
        code to get custom id :
import requests
import base64

api_key = "api_2ESvQa0ATOlmuDArzOREoV.33qutqgiOslhUIlD78Nrkm"
url = "https://api.close.com/api/v1/custom_field/lead/"

headers = {
    "Content-Type": "application/json",
    "Authorization": "Basic " + base64.b64encode(f"{api_key}:".encode()).decode()
}

response = requests.get(url, headers=headers)
print(response.json())


        """
        api_key = "api_2ESvQa0ATOlmuDArzOREoV.33qutqgiOslhUIlD78Nrkm"
        base_url = "https://api.close.com/api/v1"
        auth_header = {
            "Content-Type": "application/json",
            "Authorization": "Basic " + base64.b64encode(f"{api_key}:".encode()).decode()
        }

        # Data from the request
        name = request.data.get("name")
        contact_name = request.data.get("contact_name")
        email = request.data.get("email")
        phone = request.data.get("phone")
        feel_familiar = request.data.get("feel_familiar")
        lead_source = request.data.get("lead_source")

        # Custom fields
        custom_fields = {}
        if lead_source:
            custom_fields ["cf_xM7fu8ElUwAluASBysfztlpvCIHSfGPgZuJxTYHENS4"]=lead_source
        if feel_familiar:
            custom_fields["cf_f81Hvn8rGxEmC8VZyxUHw4znp96fFYfBF95k2mJ1cXD"] = feel_familiar

        # Build contacts
        contacts = [{
            "name": contact_name,
            "emails": [{"email": email}],
            "phones": [{"phone": phone}],
        }]

        # *** Search by email ***
        search_url = f"{base_url}/lead/?query=email:{email}"
        search_response = requests.get(search_url, headers=auth_header)
        search_data = search_response.json()

        if search_data.get("data"):
            # Existing lead found – update it
            lead = search_data["data"][0]
            lead_id = lead["id"]

            # Check if the contact already exists
            contact_exists = False
            for contact in lead.get("contacts", []):
                for contact_email in contact.get("emails", []):
                    if contact_email.get("email") == email:
                        contact_exists = True
                        break

            update_payload = {
                "name": name or lead.get("name"),
                "custom": custom_fields
            }

            if not contact_exists:
                update_payload["contacts"] = contacts

            update_url = f"{base_url}/lead/{lead_id}/"
            update_response = requests.put(update_url, json=update_payload, headers=auth_header)
            return Response(update_response.json(), status=update_response.status_code)
        else:
            # Create new lead
            payload = {
                "name": name,
                "contacts": contacts,
                "custom": custom_fields
            }
            create_url = f"{base_url}/lead/"
            create_response = requests.post(create_url, json=payload, headers=auth_header)
            return Response(create_response.json(), status=create_response.status_code)
    @action(methods=["POST"], detail=False)
    def send_email_signature(self, request):
        try:
            user = get_user_from_token(request)

        except Exception as e:
            str(e)
            username = request.data.get("username")
            if not username:
                return Response({"error": "Username is required to match or create user"},
                                status=status.HTTP_400_BAD_REQUEST)
            user = User.objects.filter(username=username).first()

        access_token = request.data.get("access_token", "")
        # Render HTML signature
        referral = ReferralCode.objects.filter(fk_user=user).first()
        referral_code = referral.code if referral else None
        print(referral_code)
        formatted_phone = None
        if user.phone:
            try:
                parsed = phonenumbers.parse(user.phone, None)
                formatted_phone = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.NATIONAL)
            except phonenumbers.NumberParseException:
                # If parsing fails, just use the original phone number if length is 10
                if len(user.phone) == 10:
                    #make format as (123) 456-7890
                    formatted_phone = f"({user.phone[:3]}) {user.phone[3:6]}-{user.phone[6:]}"
                else:
                    formatted_phone = user.phone 

        html_content = render_to_string('EmailSign.html', {
            'user': user,
            'referral_code': referral_code,
            'formatted_phone':formatted_phone  # Add this key so you can use {{ user.referral_code }} in the template
        })

        if access_token:
            # Gmail API endpoint for setting signature
            send_as_email = user.email  # ensure this is the Gmail address used in their account
            url = f"https://gmail.googleapis.com/gmail/v1/users/me/settings/sendAs/{send_as_email}"

            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }

            data = {
                "signature": html_content
            }

            response = requests.patch(url, headers=headers, json=data)

            if response.status_code == 200:
                return Response({"message": "Email signature updated successfully.",
                                 }, status=status.HTTP_200_OK)
            
            else:
                return Response({
                    "error": "Failed to update signature",
                    "details": response.json()
                }, status=response.status_code)
        else:
            return HttpResponse(html_content)

    
    
    @action(methods=["POST"], detail=False)
    def outlook_email_signature(self, request):
        try:
            user = get_user_from_token(request)

        except Exception as e:
            str(e)
            username = request.data.get("username")
            if not username:
                return Response({"error": "Username is required to match or create user"},
                                status=status.HTTP_400_BAD_REQUEST)
            user = User.objects.filter(username=username).first()

        referral = ReferralCode.objects.filter(fk_user=user).first()
        referral_code = referral.code if referral else None

        
        formatted_phone = None
        if user.phone:
            try:
                parsed = phonenumbers.parse(user.phone, None)
                formatted_phone = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.NATIONAL)
            except phonenumbers.NumberParseException:
                # If parsing fails, just use the original phone number if length is 10
                if len(user.phone) == 10:
                    #make format as (123) 456-7890
                    formatted_phone = f"({user.phone[:3]}) {user.phone[3:6]}-{user.phone[6:]}"
                else:
                    formatted_phone = user.phone 
            


        html_content = render_to_string('EmailSign.html', {
            'user': user,
            'referral_code': referral_code, # Add this key so you can use {{ user.referral_code }} in the template
            'formatted_phone':formatted_phone  
        })
        return HttpResponse(html_content)

    @action(methods=["POST"], detail=False)
    def add_sender_data(self, request):
        try:
            sender_first_name = request.data.get("firstname")
            sender_last_name = request.data.get("lastname")
            sender_email = request.data.get("email")
            phone_number = request.data.get("phone")
            sender_tags = request.data.get("tags", [])
            SENDER_API_BASE = "https://api.sender.net/v2/subscribers"

            if not sender_first_name or not sender_email:
                return Response({"error": "Sender name and email are required"},
                                status=status.HTTP_400_BAD_REQUEST)

            # Prepare headers
            headers = {
                "Authorization": f"Bearer {SENDER_TOKEN}",
                "Content-Type": "application/json"
            }
            # Prepare payload
            payload = {
                "firstname": sender_first_name,
                "lastname": sender_last_name,
                "tags": sender_tags if isinstance(sender_tags, list) else [sender_tags],
            }
            is_valid_phone= bool(re.match(r"^(\+|00)[1-9][0-9]{9,14}$", phone_number))
            if is_valid_phone and phone_number:
                payload["phone"] = phone_number

            # Step 1: Check if subscriber exists
            get_url = f"{SENDER_API_BASE}/{sender_email}"
            get_response = requests.get(get_url, headers=headers)

            if get_response.status_code == 200:
                # Subscriber exists – use PATCH to update
                patch_response = requests.patch(get_url, json=payload, headers=headers)
                if patch_response.status_code != 200:
                    return Response({
                        "error": "Failed to update subscriber",
                        "details": patch_response.json()
                    }, status=status.HTTP_400_BAD_REQUEST)
                return Response({"message": "Subscriber updated successfully"}, status=status.HTTP_200_OK)

            elif get_response.status_code == 404:
                # Subscriber not found – use POST to create
                payload["email"] = sender_email  # Include email for creation
                post_response = requests.post(SENDER_API_BASE, json=payload, headers=headers)
                if post_response.status_code != 200:
                    return Response({
                        "error": "Failed to create subscriber",
                        "details": post_response.json()
                    }, status=status.HTTP_400_BAD_REQUEST)
                return Response({"message": "Subscriber created successfully"}, status=status.HTTP_201_CREATED)

            else:
                # Unexpected error on GET
                return Response({
                    "error": "Failed to check subscriber existence",
                    "details": get_response.json()
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=["POST"], detail=False)
    def change_email(self, request):
        try:
            user = get_user_from_token(request)
            new_email = request.data.get("new_email")
            print(user.id, user.email, user.username, new_email)

            if (not new_email) or (new_email == user.email):
                return Response({"message": "New email is required"}, status=status.HTTP_400_BAD_REQUEST)

            # Optional: validate email format
            try:
                validate_email(new_email)
            except ValidationError:
                return Response({"message": "Invalid email format"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                old_email = user.email
                user.email = new_email
                user.save()
            except IntegrityError as e:
                return Response({"message": "Email already Exists"}, status=status.HTTP_400_BAD_REQUEST)

            token_response = OutlookView().get_token(request, user=user)
            if token_response.status_code == 200:
                token_content = token_response.content.decode('utf-8')
                token_data = json.loads(token_content)

                # Append meeting link based on user preferences & available token data
                google_access_token = token_data.get('google_access_token')
                if google_access_token:
                        # Remove Google tokens
                        user.google_access_token = None
                        user.google_refresh_token = None
                        user.google_token_expiry_time = None
                        user.save()
                        return JsonResponse({"message": f"Email updated from {old_email} to {new_email}, and token refreshed"},
                                                status=status.HTTP_200_OK)

                # ----- Outlook Calendar Rescheduling -----
                outlook_access_token = token_data.get('outlook_access_token')
                if outlook_access_token:
                        Outlook.objects.filter(fk_user=user).delete()
                        return JsonResponse({"message": f"Email updated from {old_email} to {new_email}, and token refreshed"},
                                            status=status.HTTP_200_OK)

                caldav_user = token_data.get('caldav_user')
                if caldav_user:
                    CalDav.objects.filter(fk_user=user).delete()
                    return JsonResponse(
                        {"message": f"Email updated from {old_email} to {new_email}, and token refreshed"},
                        status=status.HTTP_200_OK)


            return JsonResponse({'message': f"Email updated from {old_email} to {new_email}.",
                                 "error": "No valid tokens found"},
                                    status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)