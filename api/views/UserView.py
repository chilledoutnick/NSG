import base64

from rest_framework.exceptions import ValidationError
from django.contrib.auth.hashers import make_password
from advisorapp.settings import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SENDER_TOKEN, JWT_SECRET
from api.models import ApplePass
from api.models.DigitalCard import DigitalCardEmail
from api.models.Referral_email import ReferralEmail
from rest_framework.decorators import action
from api.serializers import UserSerializer
from rest_framework import viewsets
from api.models.User import ProfileProgress
from api.models.Video_Link import ProfileVideoLink, VideoLink
from api.tasks import send_email_task
from django.http import JsonResponse
from api.models.Link import UserLink
from api.views.OutlookView import OutlookView
from api.views.Services import *
from api.models import *
import numpy as np
import requests
from django.db import transaction
from django.apps import apps
from api.views.suprsend_helpers import create_suprsend_user_token, sync_user_profile, client
from django.utils import timezone
import datetime

class UserView(viewsets.GenericViewSet):

    @action(methods=["GET"], detail=False)
    def get_user(self, request):
        try:
            user = get_user_from_token(request)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_401_UNAUTHORIZED)

    @action(methods=["POST"], detail=False)
    def logout(self, request):
        try:
            response = Response()
            response.delete_cookie('jwt')
            response.data = {
                'message': 'success'
            }
            return response
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def login(self, request):
        try:
            email = request.data.get('email').strip()
            try:
                validate_email(email)
            except ValidationError:
                return Response({'message': 'Invalid email format'},
                                status=status.HTTP_400_BAD_REQUEST)
            password = request.data.get('password')
            if not email or not password:
                return Response({"message": "Please provide login credentials"}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.filter(email=email).first()
            print(email)
            if user is None:
                raise AuthenticationFailed("""Your Email ID does not exist.
Sign-up or tap “Continue with Google” to register.
                """)
            if not user.check_password(password):
                raise AuthenticationFailed('Incorrect password')
            user = User.objects.filter(id=user.id).first()
            if user and not user.payment_status and user.account_status:
                return Response({'message': 'Complete your payment to login'}, status=status.HTTP_403_FORBIDDEN)

            payload = {
                'id': user.id,
                'exp': timezone.now() + datetime.timedelta(days=30),
                'iat': timezone.now()
            }
            token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')

            response = Response()
            response.set_cookie(key='jwt', value=token, httponly=True)
            # suprsend_token = create_suprsend_user_token(distinct_id=str(user.id))

            response_data = {
                'jwt': token,
                'id': user.id,
                'name': user.name,
                'username': user.username,
                'email': user.email,
                'phone': user.phone,
                'is_superuser': user.is_superuser,
                'is_team_admin': user.is_team_admin,
                'suprsend_token': "suprsend_token"
            }

            pwd = ""
            if user:
                meet = user.meet_url
                if user.app_password is not None and user.app_password.strip():
                    pwd = user.app_password
            else:
                meet = ""
                
            sync = sync_user_profile(user)
            response_data.update({
                'meet_link': meet,
                'app_password': pwd,

                'package': user.fk_package_id,
                'is_team_admin': user.is_team_admin,
                'google_meet': user.google_meet,
                'suprsend_token': "suprsend_token",
                'suprsend_sync': sync,
            })

            response.data = response_data
            return response
        except AuthenticationFailed as error:
            return Response({'message': str(error)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['post'], detail=False)
    def send_otp_to_email(self, request):
        try:
            email = request.data.get('email').strip()
            if not email:
                return Response({'message': 'Invalid request: Email Required'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                validate_email(email)
            except ValidationError:
                return Response({'message': 'Invalid email format'},
                                status=status.HTTP_400_BAD_REQUEST)
            user = User.objects.filter(email=email).first()
            if not user:
                return Response({"message": "Can't find the email"}, status=status.HTTP_400_BAD_REQUEST)

            otp = np.random.randint(1000, 9999)
            create_time = datetime.datetime.now(datetime.timezone.utc).astimezone()
            expiry_time = create_time + datetime.timedelta(minutes=5)

            otp_object = OTP(
                fk_user=user,
                otp=otp,
                email=email,
                create_time=create_time,
                expiry_time=expiry_time
            )
            otp_object.save()
            try:
                email_otp(email, otp, user)
                return Response({'message': 'OTP sent successfully'}, status=status.HTTP_200_OK)
            except Exception as e:
                str(e)
                return Response({"message": "Failed to send OTP email"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            str(e)
            return Response({"message": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['POST'], detail=False)
    def verify_otp(self, request):
        try:
            email = request.data.get('email').strip()
            try:
                validate_email(email)
            except ValidationError:
                return Response({'message': 'Invalid email format'},
                                status=status.HTTP_400_BAD_REQUEST)
            otp = request.data.get('otp')
            otp_validator = RegexValidator(
                regex=r'\d{4}',
                message='Invalid OTP format.'
            )
            try:
                otp_validator(otp)
            except ValidationError:
                return Response({'message': 'Invalid OTP format'},
                                status=status.HTTP_400_BAD_REQUEST)
            if not email or not otp:
                return Response({'message': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)

            otp_object = OTP.objects.filter(email=email, otp=otp).order_by('-otpId').first()
            if not otp_object:
                return Response({'message': 'OTP is not correct'}, status=status.HTTP_400_BAD_REQUEST)

            if timezone.now() > otp_object.expiry_time:
                return Response({'message': 'OTP expired'}, status=status.HTTP_400_BAD_REQUEST)

            otp_object.verified = True
            otp_object.save()

            return Response({'otp': 'verified'}, status=status.HTTP_202_ACCEPTED)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def update_password(self, request):
        try:
            email = request.data.get('email').strip()
            try:
                validate_email(email)
            except ValidationError:
                return Response({'message': 'Invalid email format'},
                                status=status.HTTP_400_BAD_REQUEST)
            otp = request.data.get('otp')
            otp_validator = RegexValidator(
                regex=r'\d{4}',
                message='Invalid OTP format.'
            )
            try:
                otp_validator(otp)
            except ValidationError:
                return Response({'message': 'Invalid OTP format'},
                                status=status.HTTP_400_BAD_REQUEST)
            password = request.data.get('password')
            if not email or not otp or not password:
                return Response({'message': 'Please Provide Password'}, status=status.HTTP_400_BAD_REQUEST)

            if len(password) < 8:
                return Response({'message': 'Password length is less than eight characters'},
                                status=status.HTTP_400_BAD_REQUEST)

            otp_object = OTP.objects.filter(email=email, otp=otp).order_by('-otpId').first()
            if not otp_object:
                return Response({'message': 'OTP is not correct'}, status=status.HTTP_400_BAD_REQUEST)

            if otp_object.used:
                return Response({'message': 'OTP already used'}, status=status.HTTP_400_BAD_REQUEST)

            if timezone.now() >= otp_object.expiry_time:
                return Response({'message': 'OTP expired'}, status=status.HTTP_400_BAD_REQUEST)

            otp_object.used = True
            otp_object.save()

            user = User.objects.filter(email=email).first()
            user.password = make_password(password)
            user.save()

            return Response({'message': 'Password changed'}, status=status.HTTP_202_ACCEPTED)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['post'], detail=False)
    def is_token_valid(self, request):
        try:
            token = get_authorization_header(request).decode().split(" ")[1]
            try:
                decoded_token = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
                expiration_time = decoded_token['exp']
                current_time = datetime.datetime.now(timezone.utc).timestamp()
                validity = current_time < expiration_time
                return Response({'Validity': validity}, status=status.HTTP_200_OK)
            except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
                validity = False
                return Response({'message': f'Token validation: {validity}'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["GET"], detail=False)
    def get_username(self, request):
        try:
            users = User.objects.all()
            username = {user.username for user in users}
            return Response(username)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def update_username(self, request):
        try:
            user = get_user_from_token(request)
            updated_fields = {}
            username = request.data["username"]
            try:
                validate_username(username)
            except ValidationError as e:
                return Response({'message': str(e)},
                                status=status.HTTP_400_BAD_REQUEST)
            username_c = User.objects.filter(username=username).first()
            if username_c is None:
                user.username = username
                try:
                    validate_username(username)
                except ValidationError as e:
                    return Response({'message': str(e)},
                                    status=status.HTTP_400_BAD_REQUEST)
                updated_fields['username'] = user.username
                user.save()
                return Response(updated_fields, status=status.HTTP_202_ACCEPTED)
            else:
                return Response({"message": "username already used"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def check_username(self, request):
        try:
            username = request.data.get("username", "").strip()
            new_username = request.data.get("new_username", "").strip()  # ✅ Safe default
            email = request.data.get("email", "").strip()
            # suggested_username = None

            user = None
            profile = None

            # ---- Case 1: Username Check ----
            if username:
                suggested_username = username

                # ✅ Skip duplicate check if it's same username (edit mode)
                if new_username and new_username == username:
                    return Response(
                        {"is_user": False, "suggested_username": suggested_username},
                        status=status.HTTP_200_OK,
                    )

                # ✅ Validate username format
                try:
                    validate_username(username)
                except ValidationError as e:
                    return Response(
                        {"message": str(e)}, status=status.HTTP_400_BAD_REQUEST
                    )

                # ✅ Check existence
                user = User.objects.filter(username=username).first()
                profile = Profiles.objects.filter(username=username).first()

            # ---- Case 2: Email Check ----
            elif email:
                try:
                    validate_email(email)
                except ValidationError:
                    return Response(
                        {"message": "Enter a valid email"}, status=status.HTTP_400_BAD_REQUEST
                    )

                user = User.objects.filter(email=email).first()
                profile = Profiles.objects.filter(fk_user__email=email).first()
                suggested_username = email.split("@")[0]

            else:
                return Response(
                    {"message": "Either username or email is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # ---- Determine result ----
            is_user = bool(user or profile)
            if is_user:
                base_username = username or suggested_username
                while (
                    User.objects.filter(username=suggested_username).exists()
                    or Profiles.objects.filter(username=suggested_username).exists()
                ):
                    random_str = generate_random_username()
                    suggested_username = f"{base_username}_{random_str}"

            return Response(
                {
                    "is_user": is_user,
                    "suggested_username": suggested_username,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)



    @action(methods=["POST"], detail=False)
    def google_proxy(self, request):
        # Extract the access token from the request (sent by the frontend)

        access_token = request.data.get('access_token')
        # Make a request to the Google API with the provided access token
        google_api_url = 'https://www.googleapis.com/oauth2/v1/userinfo'
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(google_api_url, headers=headers)

        # Process the response and return the data to the frontend
        if response.status_code == 200:
            data = response.json()
            return Response(data)
        else:
            return Response(response.json(), status=response.status_code)

    @action(methods=["POST"], detail=False)
    def google_login(self, request):
        access_token = request.data.get('access_token')
        try:
            email = ""
            if access_token:
                # Proceed with using the access_token
                pass
            else:
                # Retrieve the authorization_code and redirect_uri from the request data
                authorization_code = request.data.get('code', '')
                redirect_uri = request.data.get('redirect_uri', '')

                if not authorization_code or not redirect_uri:
                    return Response({"message": "Invalid request"}, status=status.HTTP_400_BAD_REQUEST)

                token_url = "https://oauth2.googleapis.com/token"
                data = {
                    "code": authorization_code,
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "redirect_uri": redirect_uri,  # Must match Google Console
                    "grant_type": "authorization_code",
                }

                try:
                    token_response = requests.post(token_url, data=data)
                    token_response.raise_for_status()
                except requests.exceptions.RequestException as e:
                    return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

                tokens = token_response.json()
                access_token = tokens.get('access_token')

                if not access_token:
                    return Response({"message": "Failed to retrieve access token"}, status=status.HTTP_400_BAD_REQUEST)

                # Proceed with using the access_token
                pass
            # Make a request to the Google API with the provided access token
            google_api_url = 'https://www.googleapis.com/oauth2/v1/userinfo'
            headers = {'Authorization': f'Bearer {access_token}'}
            response = requests.get(google_api_url, headers=headers)

            # Process the response and return the data to the frontend
            if response.status_code == 200:
                data = response.json()
                email = data["email"].strip()
            user = User.objects.filter(email=email).first()

            if user is None:
                raise AuthenticationFailed('User not found. Please Sign Up.')
            if not user.is_active:
                return Response({"message": "Account is inactive. Please contact support."},
                                status=status.HTTP_403_FORBIDDEN)

            user = User.objects.filter(id=user.id).first()
            if user and not user.payment_status and user.account_status and user.fk_payment_billing != 1:
                return Response({'message': 'Complete your payment to login'}, status=status.HTTP_403_FORBIDDEN)

            payload = {
                'id': user.id,
                'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=30),
                'iat': datetime.datetime.now(datetime.timezone.utc)
            }
            token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')

            response = Response()
            response.set_cookie(key='jwt', value=token, httponly=True)
            # suprsend_token = create_suprsend_user_token(distinct_id=str(user.id))
            sync = sync_user_profile(user)

            response_data = {
                'jwt': token,
                'name': user.name,
                'username': user.username,
                'email': user.email,
                'phone': user.phone,
                'is_superuser': user.is_superuser,
                'is_team_admin': user.is_team_admin,
                'suprsend_token': "suprsend_token",
                "suprsend_sync": sync,

            }

            pwd = ""
            if user:
                meet = user.meet_url
                if user.app_password is not None and user.app_password.strip():
                    pwd = user.app_password
            else:
                meet = ""
            response_data.update({
                'meet_link': meet,
                'app_password': pwd,
                'package': user.fk_package_id,
                'is_team_admin': user.is_team_admin,
                'google_meet': user.google_meet

            })

            response.data = response_data
            return response
        except AuthenticationFailed as error:
            return Response({'access_token': access_token}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def email_notification(self, request):

        message = ""
        subject = ""
        marketing_digital_card = False
        email = request.data['email'].strip()
        sales = request.data.get("sales", False)
        pop_up = request.data.get("pop_up", False)
        sign_up = request.data.get("sign_up", False)
        user = User.objects.filter(email=email).first()

        if sales:
            contact_sale = ContactSales.objects.filter(email=email).first()
            name = request.data['name']
            if contact_sale is None:
                return Response({"message": "No user found"})
            message = render_to_string('Contact Sales_Confirmation email.html', {
                "name": name})
            subject = "NSG got your message!"

        if pop_up:
            lead_generation = LeadGeneration.objects.filter(email=email)
            if lead_generation is None:
                return Response({"message": "No user found"})
            message = render_to_string('Popup_email.html')
            subject = "Thanks for your interest in NSG!"

        if sign_up:
            user = User.objects.filter(email=email).first()
            if user is None:
                return Response({"message": "No user found"})
            name = user.name
            message = render_to_string('Sign Up_Confirmation email2.html', {
                "name": name})
            subject = "Here's your Digital Business Card :) Quick Video Inside!"
            marketing_digital_card = True
        try:
            sender = send_email_task(message, subject, email, marketing_digital_card, user.id)
            return Response({'message': f"Email sent from {sender}"})
        except Exception as e:
            return Response({'message': str(e)})

    @action(methods=["POST"], detail=False)
    def get_website(self, request):
        try:
            user = get_user_from_token(request)
            username = user.username
            website = "https://nsgcrm.com/" + username
            return Response({"website": website})
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def profile_picture_deletion(self, request):
        try:
            user = get_user_from_token(request)
            if not user:
                return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            profile_picture_url = "webp_images/Left_grey_png.webp"
            user.profile_picture = profile_picture_url

            user.save()

            return Response({"profile_picture": user.profile_picture.url}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def email_check(self, request):
        try:
            email = request.data['email'].strip()
            try:
                validate_email(email)
            except ValidationError:
                return Response({'message': 'Invalid email format'}, status=status.HTTP_400_BAD_REQUEST)

            res = {'email_exists': False,
                   'payment_status': False,
                   'payment_plan': "",
                   'user_id': 0
                   }
            user_exists = User.objects.filter(email=email).first()
            if user_exists:
                user = User.objects.filter(email=email).first()
                if user:
                    res['email_exists'] = True
                    res['payment_status'] = user.payment_status
                    res['payment_plan'] = user.payment_plan
                    res['user_id'] = user.id

            return Response(res, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def remove_existing_user_token(self, request):
        try:
            user = get_user_from_token(request)
            if user.google_refresh_token:
                url = 'https://oauth2.googleapis.com/revoke'
                headers = {'Content-Type': 'application/x-www-form-urlencoded'}
                params = {'token': user.google_refresh_token}
                response = requests.post(url, params=params, headers=headers)
                if response.status_code == 200:
                    user.google_access_token = None
                    user.google_refresh_token = None
                    user.google_token_expiry_time = None
                    user.save()
                    return Response({'message': 'Token removed successfully'}, status=status.HTTP_200_OK)
                else:
                    return Response({'message': 'Failed to remove token'}, status=response.status_code)
            else:
                return Response({'message': 'No token found'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def save_access_token(self, request):
        try:
            user = get_user_from_token(request)
            code = request.data["code"]
            redirect_uri = request.data["redirect_uri"]

            token_url = 'https://oauth2.googleapis.com/token'

            # Request body for the token exchange
            payload = {
                'client_id': GOOGLE_CLIENT_ID,
                'code': code,
                'redirect_uri': redirect_uri,
                'grant_type': 'authorization_code',
                'client_secret': GOOGLE_CLIENT_SECRET,
            }

            # Send the request to Azure
            try:
                response = requests.post(token_url, data=payload)
                token_data = response.json()
                print(token_data)
                # ❗ Check if token exchange failed
                if response.status_code != 200 or 'access_token' not in token_data:
                    return JsonResponse({
                        'error': 'Failed to exchange token',
                        'details': token_data
                    }, status=400)

                # User.objects.filter(id=user.id).update(
                #     google_access_token=token_data['access_token'],
                #     google_refresh_token=token_data.get('refresh_token', ''),
                #     google_token_expiry_time=datetime.datetime.now(datetime.timezone.utc) + timedelta(
                #         seconds=token_data.get('expires_in', 0))
                # )
                user.google_access_token = token_data['access_token']
                user.google_refresh_token = token_data.get('refresh_token', '')
                user.google_token_expiry_time = datetime.datetime.now(datetime.timezone.utc) + timedelta(
                    seconds=token_data.get('expires_in', 0)
                )
                
                # sync_google_emails(user)
                sync_google_calendar(user)
                user.save()

                if response.status_code != 200:
                    return JsonResponse({
                        'error': 'Failed to exchange token',
                        'details': response.json()  # Include Azure's error response
                    }, status=response.status_code)
                return JsonResponse(response.json(), status=200)
            except requests.exceptions.RequestException as e:
                return JsonResponse(
                    {'error': 'Failed to exchange token', 'details': str(e)},
                    status=500
                )

        except KeyError as e:
            return Response({"message": f"Missing required field: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def get_access_token(self, request):
        try:
            user = None
            platform = None
            user_mail = None
            try:
                username = request.data.get("username")
                if username:
                    user = User.objects.filter(username=username).first()
                if not user:
                    profile=Profiles.objects.filter(username=username).first()
                    user=profile.fk_user
                    if not profile:
                        return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                str(e)
                user = get_user_from_token(request)
            # check is user added any meet url of user.google_meet is true then return true
            has_meet_link = user.meet_url or user.google_meet
            # check if user had already added working hours
            has_working_hours = WorkingHour.objects.filter(fk_user=user).exists()
            if has_working_hours:
                user.availability_added_first_time = True
                user.save()
            availability_added_first_time = user.availability_added_first_time
            # check if user had already added working hours
            has_working_hours = WorkingHour.objects.filter(fk_user=user).exists()
            if has_working_hours:
                user.availability_added_first_time = True
                user.save()

            has_google = bool(user.google_refresh_token)
            outlook_obj = Outlook.objects.filter(fk_user=user).first()
            has_outlook = bool(outlook_obj and outlook_obj.refreshtoken)
            caldav_obj = CalDav.objects.filter(fk_user=user).first()
            has_caldav = bool(caldav_obj)

            response_data = {}
            platforms = []
            errors = []
            user_mail = None

            if has_google:
                try:
                    access_token = user.google_access_token

                    # Refresh if expired
                    if user.is_expired():
                        refresh_payload = {
                            'client_id': GOOGLE_CLIENT_ID,
                            'client_secret': GOOGLE_CLIENT_SECRET,
                            'refresh_token': user.google_refresh_token,
                            'grant_type': 'refresh_token',
                        }

                        r = requests.post('https://oauth2.googleapis.com/token', data=refresh_payload)
                        token_data = r.json()

                        if 'access_token' in token_data:
                            access_token = token_data['access_token']
                            user.google_access_token = access_token
                            user.google_token_expiry_time = datetime.datetime.now(datetime.timezone.utc) + timedelta(
                                seconds=token_data.get('expires_in', 0))
                            user.save()
                        else:
                            raise Exception("Google refresh failed")

                    # Get email
                    userinfo = requests.get(
                        'https://www.googleapis.com/oauth2/v1/userinfo',
                        params={'access_token': access_token}
                    )

                    if userinfo.status_code == 200:
                        user_mail = userinfo.json().get('email')
                        platforms.append("google")
                        response_data["google_access_token"] = access_token

                except Exception as e:
                    str(e)
                    errors.append("Google failed")

            if has_outlook:
                try:
                    outlook_response = OutlookView().get_token(request, user=user)

                    if outlook_response.status_code == 200:
                        outlook_data = json.loads(outlook_response.content.decode('utf-8'))
                        outlook_token = outlook_data.get('outlook_access_token')

                        if outlook_token:
                            headers = {'Authorization': f'Bearer {outlook_token}'}
                            r = requests.get('https://graph.microsoft.com/v1.0/me', headers=headers)

                            if r.status_code == 200:
                                user_mail = r.json().get('mail')
                                platforms.append("outlook")
                                response_data.update(outlook_data)

                    else:
                        errors.append("Outlook refresh failed")

                except Exception as e:
                    str(e)
                    errors.append("Outlook failed")
            if has_caldav:
                try:
                    user_mail = caldav_obj.username
                    platforms.append("caldav")
                    response_data["caldav_user"] = True
                except:
                    errors.append("CalDAV failed")
            response_data["platforms"] = platforms
            response_data["user_mail"] = user_mail
            response_data["has_meet_link"] = has_meet_link
            response_data["availability_added_first_time"] = availability_added_first_time
            response_data["errors"] = errors

            return Response(response_data, status=200)

            ## outdated flow
            # response = OutlookView().get_token(request, user=user)
            # if response.status_code == 200:
            #     response_content = response.content.decode('utf-8')  # Decode bytes to string
            #     response_data = json.loads(response_content)  # Convert JSON string to dictionary
            #     # Revoke Google Access Token
            #     google_access_token = response_data.get('google_access_token')
            #     if google_access_token:
            #         userinfo_endpoint = 'https://www.googleapis.com/oauth2/v1/userinfo'
            #         params = {'access_token': google_access_token}
            #         response = requests.get(userinfo_endpoint, params=params)
            #         if response.status_code == 200:
            #             user_info = response.json()
            #             google_mail = user_info.get('email')
            #             user_mail = google_mail
            #             platform = 'google'
            #     outlook_access_token = response_data.get('outlook_access_token')
            #     if outlook_access_token:
            #         userinfor_endpoint = 'https://graph.microsoft.com/v1.0/me'
            #         headers = {'Authorization': f'Bearer {outlook_access_token}'}
            #         response = requests.get(userinfor_endpoint, headers=headers)
            #         if response.status_code == 200:
            #             user_info = response.json()
            #             outlook_mail = user_info.get('mail')
            #             user_mail = outlook_mail
            #             platform = 'outlook'
            #     caldav_user = response_data.get('caldav_user', False)
            #     if caldav_user:
            #         caldavUser = CalDav.objects.get(fk_user=user)
            #         user_mail = caldavUser.username
            #         platform = "caldav"
            #     response_data['user_mail'] = user_mail
            #     response_data['platform'] = platform
            #     response_data['has_meet_link'] = has_meet_link
            #     response_data['availability_added_first_time'] = availability_added_first_time
            #     return Response(response_data, status=status.HTTP_200_OK)
            # else:
            #
            #     response_content = response.content.decode('utf-8')
            #     error_data = json.loads(response_content)
            #     return Response(error_data, status=response.status_code)

        except KeyError as e:
            return Response({"message": f"Missing required field: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            str(e)
            return Response({"message": "An unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # @action(methods=["POST"], detail=False)
    # def revoke_token(self, request):
    #     try:
    #         user = get_user_from_token(request)  # Implement this function based on your authentication mechanism
    #         response = OutlookView().get_token(request, user=user)
    #
    #         if response.status_code == 200:
    #             response_content = response.content.decode('utf-8')  # Decode bytes to string
    #             response_data = json.loads(response_content)  # Convert JSON string to dictionary
    #         else:
    #             response_content = response.content.decode('utf-8')
    #             error_data = json.loads(response_content)
    #             return Response(error_data, status=response.status_code)
    #
    #         # Revoke Google Access Token
    #         google_access_token = response_data.get('google_access_token')
    #         if google_access_token:
    #             google_revoke_url = 'https://oauth2.googleapis.com/revoke'
    #             params = {'token': google_access_token}
    #             headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    #             google_response = requests.post(google_revoke_url, params=params, headers=headers)
    #             if google_response.status_code == 200:
    #                 user.google_access_token = None
    #                 user.google_refresh_token = None
    #                 user.google_token_expiry_time = None
    #                 response_data['google_revocation'] = 'success'
    #             else:
    #                 response_data['google_revocation'] = 'failed'
    #             user.save()
    #
    #         # Revoke Outlook Access Token
    #         outlook_access_token = response_data.get('outlook_access_token')
    #         if outlook_access_token:
    #             outlook_revoke_url = 'https://login.microsoftonline.com/common/oauth2/v2.0/logout'
    #             headers = {'Authorization': f'Bearer {outlook_access_token}'}
    #             outlook_response = requests.get(outlook_revoke_url, headers=headers)
    #             if outlook_response.status_code in [200, 204]:
    #                 outlook = Outlook.objects.get(fk_user=user)
    #                 outlook.delete()
    #                 response_data['outlook_revocation'] = 'success'
    #             else:
    #                 response_data['outlook_revocation'] = 'failed'
    #
    #         # Delete CalDAV User Data
    #         caldav_user = response_data.get('caldav_user', False)
    #         if caldav_user:
    #             caldav_user = CalDav.objects.get(fk_user=user)
    #             # Implement your CalDAV data deletion logic here
    #             caldav_user.delete()
    #             response_data['caldav_deletion'] = 'success'
    #
    #         return Response(response_data, status=status.HTTP_200_OK)
    #
    #     except Exception as e:
    #         return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def revoke_token(self, request):
        try:
            user = get_user_from_token(request)

            response_data = {}

            # ---------------- GOOGLE ----------------
            google_access_token = user.google_access_token
            if google_access_token:
                google_revoke_url = 'https://oauth2.googleapis.com/revoke'
                params = {'token': google_access_token}

                google_response = requests.post(google_revoke_url, params=params)

                if google_response.status_code == 200:
                    user.google_access_token = None
                    user.google_refresh_token = None
                    user.google_token_expiry_time = None
                    response_data['google_revocation'] = 'success'
                else:
                    response_data['google_revocation'] = 'failed'

            # ---------------- OUTLOOK ----------------
            try:
                outlook = Outlook.objects.get(fk_user=user)
                # Microsoft doesn't have true revoke endpoint like Google
                # So just delete stored tokens
                outlook.delete()
                response_data['outlook_revocation'] = 'success'
            except Outlook.DoesNotExist:
                response_data['outlook_revocation'] = 'not_found'

            # ---------------- CALDAV ----------------
            try:
                caldav_user = CalDav.objects.get(fk_user=user)
                caldav_user.delete()
                response_data['caldav_deletion'] = 'success'
            except CalDav.DoesNotExist:
                response_data['caldav_deletion'] = 'not_found'

            user.save()

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


    @action(methods=["POST"], detail=False)
    def delete_user_profile(self, request):
        try:
            user_ids = request.data.get("user_ids", [])
            emails = request.data.get("emails", [])

            # ---- Config ----
            CLOSE_API_KEY = "api_2ESvQa0ATOlmuDArzOREoV.33qutqgiOslhUIlD78Nrkm"
            CLOSE_BASE_URL = "https://api.close.com/api/v1"
            close_headers = {
                "Content-Type": "application/json",
                "Authorization": "Basic " + base64.b64encode(f"{CLOSE_API_KEY}:".encode()).decode()
            }

            SENDER_API_BASE = "https://api.sender.net/v2/subscribers"
            sender_headers = {
                "Authorization": f"Bearer {SENDER_TOKEN}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            }

            # 🔥 Collect all emails (from user_ids + direct emails)
            all_emails = set(emails)

            for user_id in user_ids:
                user = User.objects.filter(id=user_id).first()
                if user and user.email:
                    all_emails.add(user.email)

            # ============================================
            # 🔁 MAIN LOOP → EMAIL BASED
            # ============================================
            for email in all_emails:

                user = User.objects.filter(email=email).first()

                with transaction.atomic():

                    # ---------------------------
                    # Delete from SuprSend
                    # ---------------------------
                    try:
                        if user:
                            client.users.delete(str(user.id))
                    except Exception as e:
                        print(f"SuprSend delete failed for {email}: {e}")

                    # ---------------------------
                    # Delete from Close CRM
                    # ---------------------------
                    try:
                        search_url = f"{CLOSE_BASE_URL}/lead/?query=email:{email}"
                        res = requests.get(search_url, headers=close_headers, timeout=5)

                        if res.status_code == 200:
                            data = res.json().get("data", [])

                            for lead in data:
                                lead_id = lead["id"]
                                delete_url = f"{CLOSE_BASE_URL}/lead/{lead_id}/"
                                del_res = requests.delete(delete_url, headers=close_headers, timeout=5)

                                if del_res.status_code not in [200, 204]:
                                    print(f"Close delete failed for {email}: {del_res.text}")
                        else:
                            print(f"Close search failed for {email}: {res.text}")

                    except Exception as e:
                        print(f"Close delete error for {email}: {e}")

                    # ---------------------------
                    # Delete from Sender.net
                    # ---------------------------
                    try:
                        payload = {
                            "subscribers": [email]
                        }

                        sender_res = requests.request('DELETE', SENDER_API_BASE, headers=sender_headers, json=payload)

                        if sender_res.status_code not in [200, 204]:
                            print(f"Sender delete failed for {email}: {sender_res.text}")

                    except Exception as e:
                        print(f"Sender delete error for {email}: {e}")

                    # ---------------------------
                    # If user exists → delete DB data
                    # ---------------------------
                    if user:

                        # Delete FK references
                        for model in apps.get_models():
                            for field in model._meta.fields:
                                if field.is_relation and field.related_model == User:
                                    model.objects.filter(**{field.name: user}).delete()

                        # Delete PaymentBilling
                        if user.fk_payment_billing_id and user.fk_payment_billing_id != 1:
                            PaymentBilling.objects.filter(
                                billing_id=user.fk_payment_billing_id
                            ).delete()

                        print("deleted DB user", user.id)
                        user.delete()

                    else:
                        print(f"No DB user found for {email}, external cleanup done")

            return JsonResponse(
                {"message": "User deletion (DB + external) completed."},
                status=200
            )

        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)


    @action(methods=["POST"], detail=False)
    def add_link(self, request):
        try:
            user = get_user_from_token(request)
            link = request.data.get("link")
            title = request.data.get("title")
            description = request.data.get("description")

            try:
                validate_https_url(link)
            except ValidationError:
                return Response({'message': 'Invalid URL format for Link. Only URLs starting with '
                                            'https://abc.com are allowed.'},
                                status=status.HTTP_400_BAD_REQUEST)

            link = UserLink.objects.create(
                fk_user=user,
                link=link,
                title=title,
                description=description
            )

            return Response(data={"message": "Link added successfully", "link_id": link.id})
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def get_links(self, request):
        try:
            user_id = request.data.get("user_id")

            if user_id:
                # If user_id is provided, use it
                user = User.objects.get(id=user_id)
            else:
                # If user_id is not provided, check for the token
                user = get_user_from_token(request)

            links = UserLink.objects.filter(fk_user=user).order_by('sorting_id')

            link_data = [{"user_id": user.id,
                          "link_id": link.id,
                          "link": link.link,
                          "title": link.title,
                          "description": link.description,
                          "sorting_id": link.sorting_id} for link in links]

            return Response(data={"links": link_data})
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def delete_link(self, request):
        try:
            user = get_user_from_token(request)
            link_id = request.data.get("link_id")
            link = UserLink.objects.get(id=link_id, fk_user=user)
            link.delete()

            return Response({"message": "Link deleted successfully"}, status=status.HTTP_200_OK)
        except UserLink.DoesNotExist:
            return Response({"message": "Link not found for the given user"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def add_video(self, request):
        try:
            title = request.data.get("title", "").strip()
            video_link = request.data.get("video_link", "").strip()
            video = request.FILES.get("video")
            if not title.isascii():
            # title = decode_body(title)
                return Response({"message": "Unsupported Filename"}, status=status.HTTP_400_BAD_REQUEST)

            user = get_user_from_token(request)
            if user is None:
                return Response({"message": "User Not found"}, status=status.HTTP_401_UNAUTHORIZED)
            username = request.data.get('username')
            # first check if this is default profile or not
            if not username:
                return Response({"message": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)

            # normalize blank values
            if not video_link:
                    video_link = None
            if not video or not getattr(video, "name", None):
                    video = None
            if username == user.username:
                existing_video = VideoLink.objects.filter(fk_user=user).first()
                if existing_video:
                    # update existing
                    existing_video.title = title
                    if video_link:
                        existing_video.video_link = video_link
                        existing_video.upload_video = None
                    elif video:
                        existing_video.upload_video = video
                        existing_video.video_link = None
                    existing_video.save()
                    return Response(
                        {
                            "message": "Video updated successfully",
                            "video_link_id": existing_video.id,
                            "title": existing_video.title,
                            "video_link": existing_video.video_link,
                            "video":existing_video.upload_video.url if existing_video.upload_video else None
                        }
                    )
                else:
                    new_video = None
                    # create new
                    if video_link:
                        new_video = VideoLink.objects.create(
                            fk_user=user,
                            title=title,
                            video_link=video_link,
                            upload_video=None,
                        )
                    elif video:
                        new_video = VideoLink.objects.create(
                            fk_user=user,
                            title=title,
                            video_link=None,
                            upload_video=video,
                        )
                    return Response(
                        {
                            "message": "Video added successfully",
                            "video_link_id": new_video.id,
                            "title": new_video.title,
                            "video_link": new_video.video_link,
                            "video":new_video.upload_video.url if new_video.upload_video else None
                        }
                    )

            # Else check Profile
            else:
                profile = Profiles.objects.filter(username=username).first()
                if profile:
                    existing_video = ProfileVideoLink.objects.filter(fk_profile=profile).first()
                    if existing_video:
                        existing_video.title = title
                        if video_link:
                            existing_video.video_link = video_link
                            existing_video.upload_video = None
                        elif video:
                            existing_video.upload_video= video
                            existing_video.video_link = None
                        existing_video.save()
                        return Response(
                            {
                                "message": "Video updated successfully",
                                "video_link_id": existing_video.id,
                                "title": existing_video.title,
                                "video_link": existing_video.video_link,
                                "video":existing_video.upload_video.url if existing_video.upload_video else None
                            }
                        )
                    else:
                        new_video = None
                        if video_link:
                            new_video = ProfileVideoLink.objects.create(
                                fk_profile=profile,
                                title=title,
                                video_link=video_link,
                                upload_video=None,
                                fk_user=user,
                            )
                        elif video:
                            new_video = ProfileVideoLink.objects.create(
                                fk_profile=profile,
                                title=title,
                                video_link=None,
                                upload_video=video,
                                fk_user=user,
                            )

                        return Response(
                            {
                                "message": "Video added successfully",
                                "video_link_id": new_video.id,
                                "title": new_video.title,
                                "video_link": new_video.video_link,
                                "video":new_video.upload_video.url if new_video.upload_video else None
                            }
                        )

            return Response({"message": "User/Profile not found"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def get_video_link(self, request):
        try:
            username = request.data.get("username")

            if username is None:
                return Response({"message": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                user = User.objects.filter(username=username).first()
            except User.DoesNotExist:
                user = None
            if user:

                video_link = VideoLink.objects.filter(fk_user=user).first()
                if video_link:
                    video_url = None
                    if video_link.upload_video:
                        # Check if the storage is GoogleCloudStorage before generating a signed URL
                        storage = video_link.upload_video.storage
                        if hasattr(storage, 'generate_signed_url'):
                            video_url = video_link.upload_video.storage.generate_signed_url(video_link.upload_video.name, response_disposition='inline')
                        else:
                            video_url = video_link.upload_video.url


                    link_data = [{"user_id": user.id,
                                "link_id": video_link.id,
                                "video_link": video_url,
                                "Video_title": video_link.title ,
                                "video": video_url
                                }]

                    return Response(data={"links": link_data})
                else:
                    return Response({"message": "No Video Found"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                profile = Profiles.objects.filter(username=username).first()
                if profile is None:
                    return Response({"message": "User/Profile not found"}, status=status.HTTP_404_NOT_FOUND)

                video_link = ProfileVideoLink.objects.filter(fk_profile=profile).first()
                if video_link:
                    video_url = None
                    if video_link.upload_video:
                        storage = video_link.upload_video.storage
                        if hasattr(storage, 'generate_signed_url'):
                             video_url = video_link.upload_video.storage.generate_signed_url(video_link.upload_video.name, response_disposition='inline')
                        else:
                            video_url = video_link.upload_video.url

                    link_data = [{"profile_id": profile.id,
                                "video_link": video_url,
                                "Video_title": video_link.title,
                                "video": video_url
                                }]
                    return Response(data={"links": link_data})
                else:
                    return Response({"message": "No Video Found"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def delete_video_link(self, request):
        try:
            user = get_user_from_token(request)
            if not user:
                return Response({"message": "User not authorized"}, status=status.HTTP_401_UNAUTHORIZED)

            username = request.data.get("username")

            if username is None:
                return Response({"message": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)

            if username == user.username:

                video_link = VideoLink.objects.filter(fk_user=user).first()
            else:
                profile = Profiles.objects.filter(username=username).first()
                if profile is None:
                    return Response({"message": "User/Profile not found"}, status=status.HTTP_404_NOT_FOUND)

                video_link = ProfileVideoLink.objects.filter(fk_profile=profile).first()
            video_link.delete()
            return Response({"message": "Link Deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def refer_friend(self, request):
        try:
            user = get_user_from_token(request)

            referral_email = request.data.get("referral_email").strip()
            refer_code = request.data["refer_code"]

            try:
                validate_email(referral_email)
            except ValidationError:
                return Response({'message': 'Invalid email format'},
                                status=status.HTTP_400_BAD_REQUEST)

            try:
                # Save data to the database
                ReferralEmail.objects.create(
                    referral_email=referral_email,
                    timestamp=datetime.datetime.now(),
                    fk_user=user
                )
                referral_code = ReferralCode.objects.get(fk_user_id=user.id)
                code = referral_code.code
                send_referral_email(user, referral_email, code, refer_code)

            except Exception as e:
                return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

            return Response({"message": "Email Send"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['post'], detail=False)
    def send_email_otp(self, request):
        try:
            email = request.data.get('email').strip()
            name = request.data.get('name')

            if not email:
                return Response({'message': 'Invalid request: Email Required'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                validate_email(email)
            except ValidationError:
                return Response({'message': 'Invalid email format'},
                                status=status.HTTP_400_BAD_REQUEST)
            create_time = datetime.datetime.now(datetime.timezone.utc).astimezone()
            expiry_time = create_time + datetime.timedelta(minutes=5)
            otp_object = EmailOTP.objects.filter(email=email, verified=0).first()
            if otp_object:
                otp_object.create_time = create_time
                otp_object.expiry_time = expiry_time

            else:
                print("New otp generated")
                otp_object = EmailOTP(
                    otp=np.random.randint(1000, 9999),
                    name=name,
                    email=email,
                    create_time=create_time,
                    expiry_time=expiry_time
                )
            otp_object.save()

            try:
                email_otp(email, otp_object.otp, otp_object, 1)
                return Response({'message': 'OTP sent successfully'}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"message": f"Failed to send OTP email, {e}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"message": f"Internal server error, {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['POST'], detail=False)
    def verify_email_otp(self, request):
        try:
            email = request.data.get('email').strip()

            try:
                validate_email(email)
            except ValidationError:
                return Response({'message': 'Invalid email format'},
                                status=status.HTTP_400_BAD_REQUEST)
            otp = request.data.get('otp')
            otp_validator = RegexValidator(
                regex=r'\d{4}',
                message='Invalid OTP format.'
            )
            try:
                otp_validator(otp)
            except ValidationError:
                return Response({'message': 'Invalid OTP format'},
                                status=status.HTTP_400_BAD_REQUEST)
            if not email or not otp:
                return Response({'message': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)

            otp_object = EmailOTP.objects.filter(email=email, otp=otp).order_by('-otpId').first()
            if not otp_object:
                return Response({'message': 'Wrong code, please retry!'}, status=status.HTTP_400_BAD_REQUEST)

            if timezone.now() > otp_object.expiry_time:
                return Response({'message': 'OTP expired'}, status=status.HTTP_400_BAD_REQUEST)

            otp_object.verified = True
            otp_object.save()
            try:
                email_otp(email, otp, otp_object, 2)
            except Exception as e:
                return Response({'otp': f'verified but email not send, {e}'}, status=status.HTTP_200_OK)

            return Response({'otp': 'verified'}, status=status.HTTP_202_ACCEPTED)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def scheduled_delete(self, request):
        # Retrieve expired OTP objects before deleting them
        expired_otp_objects = EmailOTP.objects.filter(
            expiry_time__lte=timezone.now()
        )

        # Create a dictionary of deleted OTP details
        deleted_items = {otp.otpId: {'email': otp.email, 'otp': otp.otp} for otp in expired_otp_objects}

        # Delete the expired OTP objects
        expired_otp_objects.delete()

        for obj in ApplePass.ApplePass.objects.all():
            if not obj.username and obj.fk_user:
                obj.username = obj.fk_user.username
                obj.save()

        # Print or log the deleted items
        print("Deleted OTPs:", deleted_items)
        return Response({'message': 'Expired OTPs deleted',
                         'deleted_otp': deleted_items}, status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=False)
    def profile_percentage(self, request):
        user = get_user_from_token(request)
        completion = 1
        profile_progress, created = ProfileProgress.objects.get_or_create(fk_user=user)

        # Field checks
        has_phone = user.phone if user.phone else ""
        has_profile_picture = user.profile_picture.url if user.profile_picture and user.profile_picture.url else ""
        has_about = user.about if user.about else ""
        name = user.name if user.name else ""
        email = user.email if user.email else ""

        # Social Media Check
        has_social_media = user.facebook or user.instagram or user.twitter or user.linkedin or user.tiktok or \
                           user.substack if (
                user.facebook or user.instagram or user.twitter or user.linkedin or user.tiktok or user.substack
        ) else ""
        if profile_progress.is_open:
            is_opened = True
        else:
            profile_progress.is_open = True
            profile_progress.fk_user = user
            profile_progress.timestamp = datetime.datetime.now()
            profile_progress.save()
            is_opened = False
        # Calculate completion percentage
        if has_phone and name and email and has_profile_picture:
            completion += 33
        if has_about:
            completion += 33
        if has_social_media:
            completion += 33

        return Response({
            'completion_percentage': completion,
            'fields': {
                'contact_info':{
                    'name': name,
                    'email': email,
                    "has_profile_picture": has_profile_picture,
                    'phone': has_phone
                },
                'has_about': has_about,
                'social_media': has_social_media,
                "is_opened": is_opened
            }
        })

    @action(methods=["POST"], detail=False)
    def google_meet(self, request):
        try:
            user = get_user_from_token(request)
            is_google_meet = request.data.get("is_google_meet")

            if is_google_meet is not None:
                # Ensure correct boolean conversion
                if isinstance(is_google_meet, str):
                    is_google_meet = is_google_meet.lower() == "true"

                user.google_meet = bool(is_google_meet)
                user.save()
                return Response({"message": "Google Meet preference updated successfully"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid data"}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=["POST"], detail=False)
    def meet_link_app(self, request):

        # user = None  # Ensure user is always defined

        try:
            username = request.data.get("username")
            if username:
                user = User.objects.filter(username=username).first()
                if not user:
                    profile = Profiles.objects.filter(username=username).first()
                    if not profile:
                        return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
                    user = profile.fk_user
            else:
                user = get_user_from_token(request)
        except Exception as e:
            str(e)
            user = get_user_from_token(request)


        is_google_meet = user.google_meet
        has_meet_link = bool(user.meet_url)
        is_google_integrated = bool(user.google_refresh_token)

        return Response({
            'is_google_meet': is_google_meet,
            'has_meet_link': has_meet_link,
            'is_google_integrated': is_google_integrated
        })

    @action(methods=["POST"], detail=False)
    def user_link_sorting(self, request):
        try:
            user = get_user_from_token(request)
            if not user:
                return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

            sorting = request.data if isinstance(request.data, list) else [request.data]
            res = []

            for sort in sorting:
                link_id = sort.get('link_id')
                sorting_id = sort.get('sorting_id')

                if not link_id or sorting_id is None:
                    continue  # Skip invalid entries

                try:
                    user_link = UserLink.objects.get(fk_user_id=user.id, id=link_id)
                    user_link.sorting_id = sorting_id
                    user_link.save()
                    res.append(sort)
                except UserLink.DoesNotExist:
                    continue  # Skip if the user_link is not found

            return Response({"sorting added": res}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
