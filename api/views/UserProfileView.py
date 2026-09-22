from django.conf import settings
from advisorapp.settings import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, STRIPE_SECRET_KEY
from django.core.files.uploadedfile import TemporaryUploadedFile
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from django.core.files.base import ContentFile
from rest_framework.decorators import action
from django.utils.timezone import make_aware
from rest_framework import viewsets
from googleapiclient.discovery import build
from pytz import timezone as pytz_timezone

from api.models.EmailOTP import RedemptionCode
from api.views.OutlookView import OutlookView
from api.views.Services import *
from api.models import *
import requests
import os
import datetime
from api.views.suprsend_helpers import sync_user_profile

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY


class UserProfileView(viewsets.GenericViewSet):

    # @action(methods=['POST'], detail=False)
    # def get_user(self, request):
    #     try:
    #         # Attempt to retrieve user and user from token
    #         try:
    #             user = get_user_from_token(request)
    #         except Exception as e:
    #             str(e)
    #             username = request.data.get("username")
    #             user = User.objects.filter(username=username).first()
    #             if user is None:
    #                 return Response({'message': 'No user found'}, status=status.HTTP_200_OK)
    #         profile_picture = user.profile_picture.url if user.profile_picture else ""
    #         background_colour = user.background_colour
    #         # Check if the user is part of a team
    #         is_team_member = False
    #         team_relationship = TeamReferralRelationship.objects.filter(team_user=user).first()
    #         if team_relationship:
    #             is_team_member = True
    #             admin_user = AdminAdvisor.objects.filter(fk_user=team_relationship.admin_user).first()
    #             if admin_user:
    #                 background_colour = admin_user.color

    #         else:
    #             admin_user = AdminAdvisor.objects.filter(fk_user=user).first()
    #             if admin_user:
    #                 background_colour = admin_user.color

    #         # Retrieve the user's Stripe billing info
    #         user_billing_id = user.fk_payment_billing_id
    #         stripe_user = PaymentBilling.objects.get(billing_id=user_billing_id)
    #         subscription_id = stripe_user.stripe_subscription_id
    #         plan_interval = None
    #         plan_interval_count = 0

    #         if subscription_id:
    #             # Retrieve subscription details from Stripe
    #             try:
    #                 subscription = stripe.Subscription.retrieve(subscription_id)
    #             except:
    #                 subscription = None
    #             # Get subscription plan details (interval: monthly/yearly)
    #             if subscription is None:
    #                 plan_interval = "month"
    #                 plan_interval_count = 1
    #             else:
    #                 plan_interval = subscription.plan.interval  # "month" or "year"
    #                 plan_interval_count = subscription.plan.interval_count # quarterly = 3


    #         if user.fk_package_id in [4, 6]:
    #             plan_type = "Pro"

    #         elif user.account_status == 0:
    #             plan_type = "Free"


    #         else:
    #             # Check if the user has a Smart Card
    #             has_smart_card = NSGSmartCard.objects.filter(fk_user=user, has_smart_card=True).exists()
    #             # Determine plan type based on interval and smart card ownership
    #             plan_type = f"Pro ({'Yearly' if plan_interval == 'year' else 'Quarterly' if plan_interval_count == 3 else 'Monthly'})"
    #             if has_smart_card:
    #                 plan_type += " + Smart Business Card"

    #         # Prepare the response data
    #         data = {
    #             'user_id': user.id,
    #             'email': user.email,
    #             'name': user.name,
    #             'username': user.username,
    #             'phone': user.phone,
    #             'about': user.about,
    #             'profile_picture': profile_picture,
    #             'meet_url': user.meet_url,
    #             'company': user.company,
    #             'background_pattern': user.background_pattern,
    #             'background_pattern_profile': user.background_pattern_profile,
    #             "scheduling": user.scheduling,
    #             "is_review": user.is_review,
    #             "background_colour": background_colour,
    #             "payment_status": user.payment_status,
    #             "account_status": plan_type,
    #             "is_team_member": is_team_member,
    #             "Designation": user.designation,
    #             "is_team_admin": user.is_team_admin,
    #             "wlcm_message": user.wlcm_message,
    #         }

    #         return Response(data=data)
    #     except Exception as e:
    #         return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def get_user(self, request):
        try:
            try:
                user=get_user_from_token(request)
                username=user.username
            except Exception as e:
                str(e)
                username = request.data.get("username")
            user = User.objects.filter(username=username).first()
            if not user:
                user= None
            data = {}
            if user:
                profile_picture = user.profile_picture.url if user.profile_picture else ""
                background_colour = user.background_colour
                # Check if the user is part of a team
                is_team_member = False
                team_relationship = TeamReferralRelationship.objects.filter(team_user=user).first()
                if team_relationship:
                    is_team_member = True
                    admin_user = AdminAdvisor.objects.filter(fk_user=team_relationship.admin_user).first()
                    if admin_user:
                        background_colour = admin_user.color

                else:
                    admin_user = AdminAdvisor.objects.filter(fk_user=user).first()
                    if admin_user:
                        background_colour = admin_user.color

                # Retrieve the user's Stripe billing info
                user_billing_id = user.fk_payment_billing_id
                stripe_user = PaymentBilling.objects.get(billing_id=user_billing_id)
                subscription_id = stripe_user.stripe_subscription_id
                plan_interval = None
                plan_interval_count = 0

                if subscription_id:
                    # Retrieve subscription details from Stripe
                    try:
                        subscription = stripe.Subscription.retrieve(subscription_id)
                    except Exception as e:
                        str(e)
                        subscription = None
                    # Get subscription plan details (interval: monthly/yearly)
                    if subscription is None:
                        plan_interval = "month"
                        plan_interval_count = 1
                    else:
                        plan_interval = subscription.plan.interval  # "month" or "year"
                        plan_interval_count = subscription.plan.interval_count # quarterly = 3


                if user.fk_package_id in [4, 6]:
                        plan_type = "Pro"

                elif user.account_status == 0:
                        plan_type = "Free"


                else:
                    # Check if the user has a Smart Card
                    has_smart_card = NSGSmartCard.objects.filter(fk_user=user, has_smart_card=True).exists()
                    # Determine plan type based on interval and smart card ownership
                    plan_type = f"Pro ({'Yearly' if plan_interval == 'year' else 'Quarterly' if plan_interval_count == 3 else 'Monthly'})"
                    if has_smart_card:
                        plan_type += " + Smart Business Card"

                # Prepare the response data
                data.update({
                    'user_id': user.id,
                    'email': user.email,
                    'name': user.name,
                    'username': user.username,
                    'phone': user.phone,
                    'about': user.about,
                    'profile_picture': profile_picture,
                    'meet_url': user.meet_url,
                    'company': user.company,
                    'background_pattern': user.background_pattern,
                    'background_pattern_profile': user.background_pattern_profile,
                    "scheduling": user.scheduling,
                    "is_review": user.is_review,
                    "background_colour": background_colour,
                    "payment_status": user.payment_status,
                    "account_status": plan_type,
                    "is_team_member": is_team_member,
                    "Designation": user.designation,
                    "is_team_admin": user.is_team_admin,
                    "wlcm_message": user.wlcm_message,
                    "is_service":user.is_service,
                    "is_links":user.is_links,
                    "is_feature_images":user.is_feature_images,
                    "is_feature_video":user.is_feature_video,


                })
            else:
                profile = Profiles.objects.filter(username=username).first()
                profile_picture_profile = profile.profile_picture.url if profile.profile_picture else ""
                if not profile:
                    return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
                background_colour = profile.background_colour
                # Check if the user is part of a team
                is_team_member = False
                team_relationship = TeamReferralRelationship.objects.filter(team_user=profile.fk_user).first()
                if team_relationship:
                    is_team_member = True
                    admin_user = AdminAdvisor.objects.filter(fk_user=team_relationship.admin_user).first()
                    if admin_user:
                        background_colour = admin_user.color

                else:
                    admin_user = AdminAdvisor.objects.filter(fk_user=profile.fk_user).first()
                    if admin_user:
                        background_colour = admin_user.color

                # Retrieve the user's Stripe billing info
                user_billing_id = profile.fk_user.fk_payment_billing_id
                stripe_user = PaymentBilling.objects.get(billing_id=user_billing_id)
                subscription_id = stripe_user.stripe_subscription_id
                plan_interval = None
                plan_interval_count = 0

                if subscription_id:
                    # Retrieve subscription details from Stripe
                    try:
                        subscription = stripe.Subscription.retrieve(subscription_id)
                    except Exception as e:
                        str(e)
                        subscription = None
                    # Get subscription plan details (interval: monthly/yearly)
                    if subscription is None:
                        plan_interval = "month"
                        plan_interval_count = 1
                    else:
                        plan_interval = subscription.plan.interval  # "month" or "year"
                        plan_interval_count = subscription.plan.interval_count # quarterly = 3


                if profile.fk_user.fk_package_id in [4, 6]:
                    plan_type = "Pro"

                elif profile.fk_user.account_status == 0:
                    plan_type = "Free"


                else:
                    # Check if the user has a Smart Card
                    has_smart_card = NSGSmartCard.objects.filter(fk_user=profile.fk_user, has_smart_card=True).exists()
                    # Determine plan type based on interval and smart card ownership
                    plan_type = f"Pro ({'Yearly' if plan_interval == 'year' else 'Quarterly' if plan_interval_count == 3 else 'Monthly'})"
                    if has_smart_card:
                        plan_type += " + Smart Business Card"

                data.update({
                    'user_id': profile.fk_user.id,
                    'email': profile.fk_user.email,
                    'name': profile.name,
                    'username': profile.username,
                    'phone': profile.fk_user.phone,
                    'about': profile.about,
                    'profile_picture': profile_picture_profile,
                    'meet_url': profile.fk_user.meet_url,
                    'company': profile.company,
                    'background_pattern': profile.background_pattern,
                    'background_pattern_profile': profile.background_pattern_profile,
                    "scheduling": profile.fk_user.scheduling,
                    "background_colour": background_colour,
                    "payment_status": profile.fk_user.payment_status,
                    "account_status": plan_type,
                    "is_team_member": is_team_member,
                    "Designation": profile.designation,
                    "is_team_admin": profile.fk_user.is_team_admin,
                    "wlcm_message": profile.wlcm_message,
                    "is_review": profile.is_review,
                    "is_service":profile.is_service,
                    "is_links":profile.is_links,
                    "is_feature_images":profile.is_feature_images,
                    "is_feature_video":profile.is_feature_video,

                })


            return Response(data=data)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def get_user_by_token(self, request):
        try:
            user = get_user_from_token(request)
            data = {
                'email': user.email,
                'name': user.name,
                'profile_picture': user.profile_picture.url,
                'meet_url': user.meet_url
            }
            return Response(data=data)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def get_user_by_user_name(self, request):
        try:
            username = request.data.get('username')
            if not username:
                user=get_user_from_token(request)
                username=user.username
            else:
                try:
                    validate_username(username)
                except ValidationError as e:
                    return Response({'message': e.message},
                                    status=status.HTTP_400_BAD_REQUEST)
                user = User.objects.filter(username=username).first()

            if user:
                return Response({"username": username,
                                    "user_id": user.id,
                                    "template": user.fk_package_id,
                                    "name": user.name,
                                    "email": user.email}, status=status.HTTP_200_OK)

            else:
                profile=Profiles.objects.filter(username=username).first()
                if profile is None:
                        return Response({'message': 'No User found'}, status=status.HTTP_404_NOT_FOUND)
                else:
                        return Response({
                            "username": username,
                            "name": profile.name,
                            "email": profile.fk_user.email,
                            "user_id": profile.fk_user.id,
                            "template": profile.fk_user.fk_package_id,
                        }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def bulk_email(self, request):
        try:
            user = get_user_from_token(request)
            sender_email = getattr(settings, 'EMAIL_HOST_USER', os.environ.get('EMAIL_HOST_USER', 'noreply@nsgcrm.com'))
            sender_password = getattr(settings, 'EMAIL_HOST_PASSWORD', os.environ.get('EMAIL_HOST_PASSWORD', ''))
            server = getattr(settings, 'EMAIL_HOST', os.environ.get('EMAIL_HOST', 'smtp.gmail.com'))

            if user.app_password.strip():
                sender_email = user.email
                sender_password = user.app_password
                if user.platform in ['outlook', 'hotmail']:
                    server = 'smtp.office365.com'
                elif user.platform == 'yahoo':
                    server = 'smtp.mail.yahoo.com'
                else:
                    server = f'smtp.{user.platform}.com'

            recipient_emails = request.data.get('recipients', [])
            subject = request.data.get('subject', '')
            message = request.data.get('message', '')

            if not recipient_emails:
                return Response({'message': 'Recipients list is empty'}, status=status.HTTP_400_BAD_REQUEST)

            smtp_port = 587
            smtp_server = smtplib.SMTP(server, smtp_port)
            smtp_server.ehlo()
            smtp_server.starttls()
            smtp_server.login(sender_email, sender_password)

            email_instance = Email.objects.create(
                subject=subject,
                body=message,
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

                # Prepare and send email
                msg = MIMEMultipart()
                msg['From'] = sender_email
                msg['To'] = recipient_email
                msg['Subject'] = subject
                msg['reply-to'] = user.email
                body = f'Hello {contact.name}, \n\n{message}'
                msg.attach(MIMEText(body, 'plain'))
                smtp_server.sendmail(sender_email, recipient_email, msg.as_string())

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

            smtp_server.quit()
            return Response({'message': 'Emails sent successfully'}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def create_user(self, request):
        try:
            name = request.data['name']
            email = request.data['email'].strip()
            phone = request.data['phone']
            username = request.data['username'].strip()
            surname = request.data.get('surname', '')
            about = request.data.get("about", "")
            meet_url = request.data.get("meet_url", "")
            app_password = request.data.get("app_password", "")
            platform = request.data.get("platform", "gmail")
            is_team_member_str = request.data.get("is_team_member", "").lower()
            is_team_member = True if is_team_member_str == "true" else False
            address = request.data.get("address", "")
            team_member_count = request.data.get("team_member_count", 0)
            profile_picture = request.data.get("profile_picture")
            package = request.data.get("package", 1)
            organization_size = request.data.get("organization_size", "0-10")
            source = request.data.get("source", "")
            purpose = request.data.get("purpose", [])
            payment_plan = request.data.get("payment_plan", 0)
            scheduling_value = False  # Default value
            scheduling_value_str = request.data.get("scheduling", "")
            # Welcome message
            wlcm_heading = request.data.get('wlcm_heading', "")
            wlcm_subheading = request.data.get('wlcm_subheading', "")
            wlcm_message = {
                "heading": wlcm_heading,
                "subheading": wlcm_subheading
            }
            promo_code = request.data.get("promo_code", "")

            required_fields = ['name', 'email', 'password', 'username']

            missing_fields = [field for field in required_fields if field not in request.data]
            if missing_fields:
                return Response({'message': f'Missing required fields: {", ".join(missing_fields)}'},
                                status=status.HTTP_400_BAD_REQUEST)
            try:
                validate_email(email)
            except ValidationError:
                return Response({'message': 'Invalid email format'},
                                status=status.HTTP_400_BAD_REQUEST)

            try:
                phone = validate_phone(phone)
            except ValidationError as e:
                return Response({'message': e.message},
                                status=status.HTTP_400_BAD_REQUEST)
            if isinstance(scheduling_value_str, str):
                scheduling_value_lower = scheduling_value_str.lower()
                if scheduling_value_lower == "true":
                    scheduling_value = True
                elif scheduling_value_lower == "false":
                    scheduling_value = False
            is_review = False
            is_review_str = request.data.get("is_review", "")
            if isinstance(is_review_str, str):
                is_review_lower = is_review_str.lower()
                if is_review_lower == "true":
                    is_review = True
                elif is_review_lower == "false":
                    is_review = False

            urls = [meet_url]
            for url in urls:
                try:
                    validate_https_url(url)
                except ValidationError:
                    return Response({'message': f'Invalid URL format or scheme for {url}. Only URLs starting with '
                                                f'https://abc.com are allowed.'},
                                    status=status.HTTP_400_BAD_REQUEST)
            app_password_validator = RegexValidator(
                regex=r'^\w{16}$|^$|^\s*$',
                message='Invalid password format.'
            )
            try:
                app_password_validator(app_password)
            except ValidationError:
                return Response({'message': 'Invalid password format'},
                                status=status.HTTP_400_BAD_REQUEST)

            if User.objects.filter(email=email).exists():
                user_data = {
                    'message': """Email ID already exists.
                Please Login instead of creating a new account.
                                    """,
                    'email': email,
                }
                return Response(user_data, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(username=username).exists():
                user_data = {
                    'message': 'The username is already taken',
                    'username': username
                }
                return Response(user_data, status=status.HTTP_400_BAD_REQUEST)

            # New users
            user = User.objects.create(
                name=name,
                email=email,
                phone=phone,
                username=username,
                surname=surname,
                address=address,
                about=about,
                meet_url=meet_url,
                is_team_member=is_team_member,
                app_password=app_password,
                team_member_count=team_member_count,
                platform=platform,
                fk_package_id=package,
                organization_size=organization_size,
                source=source,
                purpose=purpose,
                scheduling=scheduling_value,
                is_review=is_review,
                payment_plan=payment_plan,
                wlcm_message=wlcm_message,
            )
            if profile_picture:
                if not isinstance(profile_picture, (InMemoryUploadedFile, TemporaryUploadedFile)):
                    response = requests.get(profile_picture)
                    response.raise_for_status()
                    file_name = "profile_picture"
                    # Add an appropriate extension if the file doesn't have one
                    if not os.path.splitext(file_name)[1]:
                        file_name += ".jpg"  # Assuming the image is a JPG
                    profile_picture = ContentFile(response.content, name=file_name)
                profile_picture_file = image_compressor(profile_picture, user)

            else:
                profile_picture_file = "webp_images/Left_grey_png.webp"
            user.profile_picture = profile_picture_file
            user.set_password(request.data['password'])
            user.save()

            # Add Nikhil as default contact for newcomers
            n_email = "nikhil@nsgcrm.com"
            n_phone = "+1 605-605-0394"
            n_name = "Nick (Example)"
            existing_nikhil_contact = Contact.objects.filter(owner=user, email=n_email).first()
            if not existing_nikhil_contact:
                nikhil_contact = Contact.objects.create(
                        name=n_name,
                        email=n_email,
                        phone=n_phone,
                        owner=user,
                        is_user=0,
                        pfp_color=alphabet_color("N"),
                        date_added=datetime.datetime.now(),
                        generated_text=f"{n_name} was added as your default contact."
                    )
                # Optionally add tag
                tag_obj = Tag.objects.filter(name="Business Card").first()
                if tag_obj:
                    ContactTag.objects.create(fk_contact=nikhil_contact, fk_tag=tag_obj, position=1)

                # Add welcome note
                welcome_note = NoteReminder.objects.create(
                        fk_contact=nikhil_contact,
                        fk_user=user,
                        note_text=f"""
Welcome to NSG! We're excited to see you making the most of networking to grow your business. 
If you ever need support, we're always here—just reach out!
https://nsgcrm.com/nikhilpawar
""",
                        note_status=1,
                        editable=0
                )

                Timeline.objects.create(
                        action_type="note",
                        content="contact",
                        fk_user=user,
                        fk_contact=nikhil_contact,
                        note_id=welcome_note.id
                )
                # schedule_user_notification(
                #         user_id=user.id,
                #         title="First Contact Added",
                #         body="You’ve added your first contact. Great start! Add a note to recall important details!",
                #         countdown=2
                # )
            sync = sync_user_profile(user)
            user_data = {
                "user_id": user.id,
                "name": user.name,
                "address": user.address,
                "username": user.username,
                'suprsend_sync': sync,
            }
            if promo_code:
                code_obj = RedemptionCode.objects.filter(code=promo_code, is_used=False).first()
                if code_obj:
                    code_obj.is_used = True
                    code_obj.redeemed_by = user
                    code_obj.redeemed_at = timezone.now()
                    code_obj.save()
                    user_data['promo_code'] = promo_code
                else:
                    user_data['promo_code'] = "Invalid or already redeemed code."

            return Response(user_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def update_user(self, request):
        try:
            user = get_user_from_token(request)
            updated_fields = {}
            for field in (
                    "name", "phone", "about", "meet_url", "background_pattern",
                    "background_pattern_profile", "background_colour",
                    "company", "description", "team_member_count", "scheduling", "is_review"
            ):
                if field in request.data:
                    if field == 'meet_url':
                        try:
                            validate_https_url(request.data[field])
                        except ValidationError:
                            return Response(
                                {'message': f'Invalid URL format or scheme for {field}. Only URLs starting with '
                                            f'https://abc.com are allowed.'},
                                status=status.HTTP_400_BAD_REQUEST)
                    if field == "phone":
                        try:
                            request.data[field] = validate_phone(request.data[field])
                        except ValidationError as e:
                            return Response({'message': e.message},
                                            status=status.HTTP_400_BAD_REQUEST)
                    setattr(user, field, request.data[field])
                    updated_fields[field] = getattr(user, field)
            if "profile_picture" in request.data:
                profile_picture = request.data["profile_picture"]
                profile_picture = image_compressor(profile_picture, user)
                user.profile_picture = profile_picture
                # user.save()
                updated_fields["profile_picture"] = user.profile_picture.url

            if "scheduling" in request.data:
                scheduling_value = request.data["scheduling"].lower()
                if scheduling_value == "true":
                    user.scheduling = True
                elif scheduling_value == "false":
                    user.scheduling = False
                else:
                    return Response(
                        {'message': 'Invalid value for scheduling. Please provide either "true" or "false".'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                updated_fields["scheduling"] = user.scheduling

            if "is_review" in request.data:
                is_review_value = request.data["is_review"].lower()
                if is_review_value == "true":
                    user.is_review = True
                elif is_review_value == "false":
                    user.is_review = False
                else:
                    return Response(
                        {'message': 'Invalid value for is_review. Please provide either "true" or "false".'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                updated_fields["is_review"] = user.is_review
            if "designation" in request.data:
                user.designation = request.data['designation']
                updated_fields['designation'] = user.designation

            if "is_google_meet" in request.data:
                is_google_meet_value = request.data["is_google_meet"]
                if isinstance(is_google_meet_value, str):
                    is_google_meet_value = is_google_meet_value.lower() == "true"
                user.google_meet = is_google_meet_value
                updated_fields["is_google_meet"] = user.google_meet

            # Handle welcome message for user
            wlcm_heading = request.data.get("wlcm_heading")
            wlcm_subheading = request.data.get("wlcm_subheading")
            if wlcm_heading or wlcm_subheading:
                user.wlcm_message = {
                        "heading": wlcm_heading or "",
                        "subheading": wlcm_subheading or ""
                }
                updated_fields["wlcm_message"] = user.wlcm_message

            user.save()
            sync = sync_user_profile(user)
            updated_fields["sync"] = sync

            return Response(updated_fields, status=status.HTTP_202_ACCEPTED)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def get_custom_username(self, request):
        try:
            custom_username = request.data.get("custom_username", "").strip()

            # case 1: no custom_username provided
            if not custom_username:
                return Response({"username": "login"}, status=status.HTTP_200_OK)

            # case 2: check in User table (username or custom_username)
            user_instance = (
                User.objects.filter(username=custom_username).first()
                or User.objects.filter(custom_username=custom_username).first()
            )

            if user_instance:
                return Response(
                    {
                        "username": user_instance.username
                        if user_instance.username
                        else user_instance.custom_username
                    },
                    status=status.HTTP_200_OK,
                )

            # case 3: check in Profiles table
            profile_instance = Profiles.objects.filter(username=custom_username).first()
            if profile_instance:
                return Response(
                    {"username": profile_instance.username}, status=status.HTTP_200_OK
                )

            # case 4: nothing found
            return Response(
                {"message": "User not found with the specified custom username."},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def post_payment_status(self, request):
        # Get user
        try:
            user = get_user_from_token(request)
        except Exception as e:
            str(e)
            user_id = request.data.get("user_id")
            if not user_id:
                return Response({'message': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)

            # Validate user_id format
            id_validator = RegexValidator(regex=r'^\d{1,6}$', message='Invalid Id format.')
            try:
                id_validator(user_id)
            except ValidationError:
                return Response({'message': 'Invalid Id format'}, status=status.HTTP_400_BAD_REQUEST)

            # Retrieve user and user details
            user = User.objects.filter(id=user_id).first()
            if not user:
                return Response({'message': 'No user found'}, status=status.HTTP_404_NOT_FOUND)

        # Validate payment status
        payment_status = request.data.get("payment_status")
        if payment_status not in ['true', 'false', True, False]:
            return Response({'message': 'Invalid payment_status value, must be true or false'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Retrieve payment details
        set_up_intent_id = request.data.get("session_id", None)
        payment_intent_id = request.data.get("payment_intent_id", None)
        stripe_subscription_id = request.data.get("stripe_subscription_id")


        is_free = request.data.get("is_free", False)
        sub = "Free"
        payment_user = None
        if not is_free:
            print("not free")
            if set_up_intent_id:
                payment_user = PaymentBilling.objects.filter(set_up_intent_id=set_up_intent_id).first()
            elif payment_intent_id:
                payment_user = PaymentBilling.objects.filter(payment_intent_id=payment_intent_id).first()
            elif stripe_subscription_id:
                payment_user = PaymentBilling.objects.filter(stripe_subscription_id=stripe_subscription_id).first()
            if not payment_user:
                return Response({'message': 'No Payment Details found'}, status=status.HTTP_404_NOT_FOUND)

            user.fk_payment_billing = payment_user
            user.save()
            sub = payment_user.stripe_subscription_id
        user.account_status = not is_free
        user.payment_status = not is_free
        user.save()

        # Return response
        return Response({
            'message': 'Payment status updated successfully',
            'payment_status': user.payment_status,
            "stripe_subscription_id": sub,
            'payment_intent_id': payment_intent_id,
        }, status=status.HTTP_200_OK)

    @action(methods=["POST"], detail=False)
    def get_user_social_media(self, request):
        try:
            try:
                user = get_user_from_token(request)
                username = user.username
            except Exception as e:
                str(e)
                username = request.data.get("username")
                user = User.objects.filter(username=username).first()

            if user:

                    return Response({
                        'instagram': user.instagram,
                        'linkedin': user.linkedin,
                        'facebook': user.facebook,
                        'twitter': user.twitter,
                        'tiktok': user.tiktok,
                        'youtube': user.youtube,
                        'company': user.company,
                        'substack': user.substack
                    }, status=status.HTTP_200_OK)
            else:
                    profile=Profiles.objects.filter(username=username).first()
                    if not profile:
                        return Response({"No user Found"},status=status.HTTP_404_NOT_FOUND)
                    else:
                        return Response({
                        'instagram': profile.instagram,
                        'linkedin': profile.linkedin,
                        'facebook': profile.facebook,
                        'twitter': profile.twitter,
                        'tiktok': profile.tiktok,
                        'youtube': profile.youtube,
                        'company': profile.company,
                    }, status=status.HTTP_200_OK)



        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['POST'], detail=False)
    def create_app_password(self, request):
        try:
            user = get_user_from_token(request)
            app_password = request.data["app_password"]
            platform = request.data["platform"]
            app_password_validator = RegexValidator(
                regex=r'^\w{16}$|^$|^\s*$',
                message='Invalid password format.'
            )
            try:
                app_password_validator(app_password)
            except ValidationError:
                return Response({'message': 'Invalid password format'},
                                status=status.HTTP_400_BAD_REQUEST)
            user.app_password = app_password
            user.platform = platform
            user.save()
            data = {
                "app_password": user.app_password,
                "platform": user.platform
            }
            return Response(data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['POST'], detail=False)
    def get_app_password(self, request):
        try:
            user = get_user_from_token(request)
            data = {
                "app_password": user.app_password,
                "platform": user.platform
            }
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def get_time_slots(self, request):
        try:
            try:
                # Fetch username or get from token
                username = request.data.get("username")

                if username:

                    # Validate username
                    validate_username(username)
                    user = User.objects.filter(username=username).first()
                    if not user:
                        profile = Profiles.objects.filter(username=username).first()
                        if not profile:
                            return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)
                        user = profile.fk_user
                else:
                    user=get_user_from_token(request)
                # username=user.username
            except Exception as e:
                str(e)

                return Response({"message": "User not found.",
                                 "error": f"{e}"}, status=status.HTTP_404_NOT_FOUND)

            frontend_timezone = request.data.get("timezone")
            date = request.data.get("date")
            slot_time = int(request.data.get("slot_time", 30))

            if not all([frontend_timezone, date, slot_time]):
                return Response({"message": "Missing required fields."}, status=status.HTTP_400_BAD_REQUEST)

            date_validator = RegexValidator(
                regex=r'^\d{4}-\d{2}-\d{2}$',
                message='Invalid Date format. It should be YYYY-MM-DD'
            )
            date_validator(date)
            viewer_date = datetime.datetime.strptime(date, '%Y-%m-%d').date()
            frontend_tz = pytz_timezone(frontend_timezone)
            viewer_day_start = frontend_tz.localize(datetime.datetime.combine(viewer_date, datetime.time.min))
            viewer_day_end = viewer_day_start + timedelta(days=1)
            viewer_day_start_utc = viewer_day_start.astimezone(pytz.utc)
            viewer_day_end_utc = viewer_day_end.astimezone(pytz.utc)

            schedule_qs = WorkingHour.objects.filter(fk_user=user, status='active')
            if not schedule_qs.exists():
                return Response({"time": [], "duration": slot_time, "meet_link": user.meet_url, "User Name": user.name,
                                 "message": "Success"}, status=status.HTTP_200_OK)

            advisor_timezone_name = schedule_qs.first().timezone or "UTC"
            advisor_tz = pytz_timezone(advisor_timezone_name)
            advisor_window_start = viewer_day_start.astimezone(advisor_tz)
            advisor_window_end = viewer_day_end.astimezone(advisor_tz)

            advisor_dates = set()
            current_advisor_date = advisor_window_start.date()
            while current_advisor_date <= advisor_window_end.date():
                advisor_dates.add(current_advisor_date)
                current_advisor_date += timedelta(days=1)

            working_hours_by_day = {
                item.dayName: item.working_hour
                for item in schedule_qs.filter(dayName__in=[d.weekday() for d in advisor_dates])
            }

            busy_times = []

            appointments = AdvisorAppointment.objects.filter(
                fk_user=user,
                fk_appointment__appointment_end_at__gt=viewer_day_start_utc,
                fk_appointment__appointment_start_at__lt=viewer_day_end_utc
            ).exclude(status__in=['in_active', 'canceled'])
            for appointment in appointments:
                busy_times.append({
                    "start": appointment_start_utc(appointment.fk_appointment),
                    "end": appointment_end_utc(appointment.fk_appointment),
                })

            try:
                out_user = Outlook.objects.get(fk_user=user)
                if out_user.refreshtoken:
                    response = OutlookView().get_token(request, user=user)
                    access_token = json.loads(response.content.decode('utf-8')).get("outlook_access_token")
                    time_min = viewer_day_start_utc.isoformat()
                    time_max = viewer_day_end_utc.isoformat()

                    headers = {"Authorization": f"Bearer {access_token}"}
                    body = {
                        "schedules": [out_user.email],
                        "startTime": {"dateTime": time_min, "timeZone": frontend_timezone},
                        "endTime": {"dateTime": time_max, "timeZone": frontend_timezone},
                        "availabilityViewInterval": slot_time
                    }
                    outlook_url = "https://graph.microsoft.com/v1.0/me/calendar/getSchedule"
                    response = requests.post(outlook_url, headers=headers, json=body)
                    schedule_items = response.json().get('value', [])[0].get('scheduleItems', [])
                    for item in schedule_items:
                        start = ensure_aware_utc(datetime.datetime.fromisoformat(item['start']['dateTime']))
                        end = ensure_aware_utc(datetime.datetime.fromisoformat(item['end']['dateTime']))
                        busy_times.append({"start": start, "end": end})
            except Exception as e:
                print(f"Outlook error: {e}")

            if user.google_refresh_token:
                try:
                    credentials = Credentials(
                        None,
                        refresh_token=user.google_refresh_token,
                        token_uri='https://oauth2.googleapis.com/token',
                        client_id=GOOGLE_CLIENT_ID,
                        client_secret=GOOGLE_CLIENT_SECRET,
                        scopes=['https://www.googleapis.com/auth/calendar']
                    )
                    if credentials.expired and credentials.refresh_token:
                        credentials.refresh(Request())
                    service = build('calendar', 'v3', credentials=credentials)

                    time_min = viewer_day_start_utc.isoformat()
                    time_max = viewer_day_end_utc.isoformat()

                    events_result = service.freebusy().query(
                        body={
                            "timeMin": time_min,
                            "timeMax": time_max,
                            "timeZone": frontend_timezone,
                            "items": [{"id": "primary"}]
                        }
                    ).execute()
                    for busy_time in events_result['calendars']['primary']['busy']:
                        start = ensure_aware_utc(datetime.datetime.fromisoformat(busy_time['start']))
                        end = ensure_aware_utc(datetime.datetime.fromisoformat(busy_time['end']))
                        busy_times.append({"start": start, "end": end})
                except Exception as e:
                    print(f"Google Calendar error: {e}")
            final_time_slots = []
            sorted_busy_times = sorted(busy_times, key=lambda x: x['start'])

            for advisor_date in sorted(advisor_dates):
                working_hours = working_hours_by_day.get(advisor_date.weekday(), [])
                for hour in working_hours:
                    block_start_local = advisor_tz.localize(
                        datetime.datetime.combine(
                            advisor_date,
                            datetime.datetime.strptime(hour['start_time'], '%H:%M:%S').time()
                        )
                    )
                    block_end_local = advisor_tz.localize(
                        datetime.datetime.combine(
                            advisor_date,
                            datetime.datetime.strptime(hour['end_time'], '%H:%M:%S').time()
                        )
                    )
                    slot_start_utc = block_start_local.astimezone(pytz.utc)
                    block_end_utc = block_end_local.astimezone(pytz.utc)

                    while slot_start_utc + timedelta(minutes=slot_time) <= block_end_utc:
                        slot_end_utc = slot_start_utc + timedelta(minutes=slot_time)
                        slot_local = slot_start_utc.astimezone(frontend_tz)
                        overlaps_selected_day = viewer_day_start <= slot_local < viewer_day_end
                        overlaps_busy = any(
                            slot_start_utc < busy['end'] and slot_end_utc > busy['start']
                            for busy in sorted_busy_times
                        )
                        if overlaps_selected_day and not overlaps_busy and slot_start_utc > timezone.now():
                            final_time_slots.append({
                                "time": slot_local.strftime('%H:%M:%S'),
                                "date": slot_local.strftime('%Y-%m-%d'),
                                "day_offset": (slot_local.date() - viewer_date).days
                            })
                        slot_start_utc += timedelta(minutes=slot_time)

            return Response(
                {"time": final_time_slots, "duration": slot_time, "meet_link": user.meet_url, "User Name": user.name,
                 "message": "Success"}, status=status.HTTP_200_OK)

        except ValidationError as e:
            return Response({'message': e.message}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=["POST"], detail=False)
    def update_link(self, request):
        try:
            user = get_user_from_token(request)
            updated_fields = {}
            links = {"instagram", "facebook", "linkedin", "twitter", "tiktok", "youtube", "substack"}
            for field in request.data:
                if field in links:
                    try:
                        validate_https_url(request.data[field])
                    except ValidationError:
                        return Response(
                            {'message': f'Invalid URL format for {field}. Only URLs starting with '
                                        f'https://abc.com are allowed.'},
                            status=status.HTTP_400_BAD_REQUEST)
                    setattr(user, field, request.data[field])
                    updated_fields[field] = getattr(user, field)

            user.save()

            return Response(updated_fields, status=status.HTTP_202_ACCEPTED)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def signup_code_check(self, request):
        promo_code = request.data.get('promo_code')  # The code from React

        if not promo_code:
            return Response({"error": "Redemption code is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Use a transaction to prevent race conditions (double spending)
        try:
            RedemptionCode.objects.get(code=promo_code, is_used=False)
            return Response({"message": "Valid code"}, status=status.HTTP_200_OK)

        except RedemptionCode.DoesNotExist:
            return Response({"error": "Invalid or already redeemed code."}, status=status.HTTP_400_BAD_REQUEST)