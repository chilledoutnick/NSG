import os
import logging
import firebase_admin
from celery import shared_task
from django.utils import timezone
from django.conf import settings
from firebase_admin import messaging, credentials, initialize_app
from api.models import PaymentBilling, User, UserFCMToken
from api.views.ReferView import *
from api.views.Services import email_sender

logger = logging.getLogger(__name__)


# Firebase initialization - Ensures its only initialized once
def get_firebase_app():
    if not firebase_admin._apps:
        fc_cred_path = getattr(settings, "FIREBASE_CREDENTIALS_PATH", os.getenv("FIREBASE_CREDENTIALS_PATH", os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")))
        if fc_cred_path and os.path.exists(fc_cred_path):
            cred = credentials.Certificate(fc_cred_path)
            initialize_app(cred)
        else:
            try:
                cred = credentials.ApplicationDefault()
                initialize_app(cred)
            except Exception as e:
                logger.warning(f"Firebase credentials unconfigured or default credentials unavailable: {e}")
                return None
    return firebase_admin.get_app()


@shared_task
def send_email_task(message, subject, recipient_list, marketing_digital_card=False, user_id=None):
    try:
        sender_email = getattr(settings, "EMAIL_HOST_USER", os.getenv("EMAIL_HOST_USER", "noreply@nsgcrm.com"))
        sender_password = getattr(settings, "EMAIL_HOST_PASSWORD", os.getenv("EMAIL_HOST_PASSWORD", ""))
        server = getattr(settings, "EMAIL_HOST", os.getenv("EMAIL_HOST", "smtp.gmail.com"))

        user = User.objects.filter(id=user_id).first()

        logger.info(f"Sending email to {recipient_list} with subject: {subject}")
        email_sender(
            server,
            sender_email,
            sender_password,
            recipient_list,
            subject,
            message,
            marketing_digital_card=marketing_digital_card,
            user=user,
        )
        logger.info(f"Email sent successfully to {recipient_list}")
        return {"success": True, "sender": sender_email}
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        raise


# @shared_task
# def send_delayed_notification(user_id, title, body, email=False,
#                               url="http://localhost:3000/people", msg=None, sub=None):
#     try:
#         user = User.objects.filter(id=int(user_id)).first()
#         logger.info(f"User found: {user}")
#
#         if not user or not user.fcm_token:
#             logger.warning(f"User {user_id} has no valid FCM tokens.")
#             return {"success": False, "error": "User has no valid FCM tokens."}
#
#         get_firebase_app()  # Initialize Firebase if not already done
#         config = messaging.WebpushConfig(
#             fcm_options=messaging.WebpushFCMOptions(
#                 link=url
#             ),
#             notification=messaging.WebpushNotification(
#                 title=title,
#                 body=body,
#                 icon="https://gdm-catalog-fmapi-prod.imgix.net/ProductScreenshot/d54b8f5b-b340-4a19-8cfe"
#                      "-d32e15550957.png?w=600&h=450&fit=fill&fill=blur&auto=format&q=50",  # Replace with
#                 # your app icon URL
#                 # custom_data={"link": url},  # Action when the notification is clicked,
#                 badge="https://storage.googleapis.com/nsg-crm-storage-public/media/webp_images/Group_1_png.webp",
#                 require_interaction=True,
#                 # actions=[
#                 #     messaging.WebpushNotificationAction(
#                 #         action="open_url",
#                 #         title="View More",
#                 #         # icon="https://your-icon-url.com/view-more-icon.png"  # Optional
#                 #     ),
#                 #     messaging.WebpushNotificationAction(
#                 #         action="dismiss",
#                 #         title="Dismiss",
#                 #         # icon="https://your-icon-url.com/dismiss-icon.png"  # Optional
#                 #     )
#                 # ]
#             )
#         )
#
#         # messages = [
#         #     messaging.Message(
#         #         notification=messaging.Notification(title=title, body=body),
#         #         token=token,
#         #         webpush=config,
#         #         data={"url": url}
#         #
#         #     )
#         #     for token in user.fcm_token
#         # ]
#
#         # response = messaging.send_all(messages)
#
#         multicast_message = messaging.MulticastMessage(
#             tokens=[token for token in user.fcm_token],
#             notification=messaging.Notification(title=title, body=body),
#             webpush=config,
#             data={"url": url}
#         )
#         response = messaging.send_each_for_multicast(multicast_message)
#
#         # response = messaging.send(
#         #     messaging.Message(
#         #         notification=messaging.Notification(title=title, body=body),
#         #         token=fcm_token,
#         #         webpush=messaging.WebpushConfig(
#         #             fcm_options=messaging.FCMOptions(link=url)
#         #         ),
#         #         topic= f"user_{user_id}",
#         #         data={"url": url}
#         #     )
#         # )
#         print(f"config sent: {config}")
#         print(f"Notification sent: {multicast_message}")
#         response_data = {
#             "success_count": response.success_count,
#             "failure_count": response.failure_count,
#             "responses": [
#                 {
#                     "message_id": res.message_id,
#                     "exception": str(res.exception) if res.exception else None
#                 }
#                 for res in response.responses
#             ]
#         }
#
#         logger.info(f"Notification sent: {response_data}")
#         if email is True:  # Explicitly check for the boolean True
#             try:
#                 sender_email = os.getenv("EMAIL_SENDER", "noreply@nsgcrm.com")
#                 sender_password = os.getenv("EMAIL_PASSWORD", "your-secure-password")
#                 server = os.getenv("EMAIL_SERVER", "smtp.gmail.com")
#
#                 email_sender(
#                     server,
#                     sender_email,
#                     sender_password,
#                     user.email,
#                     msg if msg else title,
#                     sub if sub else body,
#                     user=user,
#                 )
#                 logger.info(f"Email sent successfully to {user.email}")
#                 return {"success": True, "sender": sender_email, "response": response}
#             except Exception as e:
#                 logger.error(f"Error sending email: {str(e)}")
#                 raise
#         return {"success": True, "response": response_data}
#     except User.DoesNotExist:
#         logger.error(f"User with ID {user_id} does not exist.")
#         return {"success": False, "error": "User not found."}
#     except IOError as e:
#         logger.error(f"Error in send_delayed_notification task: {str(e)}")
#         return {"success": False, "error": str(e)}


@shared_task
def send_delayed_notification(user_id, title, body, email=False,
                              url="https://nsgcrm.com/people", msg=None, sub=None):
    response_data = {}
    try:
        user = User.objects.filter(id=int(user_id)).first()
        if not user:
            logger.error(f"User with ID {user_id} not found.")
            return {"success": False, "error": "User not found."}

        get_firebase_app()  # Ensure Firebase is initialized

        # Fetch all tokens for the user
        user_tokens = list(UserFCMToken.objects.filter(user=user))
        if not user_tokens:
            logger.warning(f"No FCM tokens found for user {user_id}")
            return {"success": False, "error": "No FCM tokens found for user."}

        valid_tokens = []
        for token_obj in user_tokens:
            try:
                messaging.send(messaging.Message(token=token_obj.token), dry_run=True)
                valid_tokens.append(token_obj.token)
            except messaging.UnregisteredError:
                logger.warning(f"Invalid token found and removed: {token_obj.token}")
                token_obj.delete()
            except Exception as e:
                logger.error(f"Unexpected error validating token: {token_obj.token} | {str(e)}")

        if not valid_tokens:
            logger.warning(f"All FCM tokens invalid for user {user_id}")
            return {"success": False, "error": "No valid FCM tokens for user."}

        get_firebase_app()  # Initialize Firebase if not already done
        config = messaging.WebpushConfig(
            fcm_options=messaging.WebpushFCMOptions(
                link=url
            ),
            notification=messaging.WebpushNotification(
                title=title,
                body=body,
                icon="https://gdm-catalog-fmapi-prod.imgix.net/ProductScreenshot/d54b8f5b-b340-4a19-8cfe"
                     "-d32e15550957.png?w=600&h=450&fit=fill&fill=blur&auto=format&q=50",  # Replace with
                # your app icon URL
                # custom_data={"link": url},  # Action when the notification is clicked,
                badge="https://storage.googleapis.com/nsg-crm-storage-public/media/webp_images/Group_1_png.webp",
                require_interaction=True,
            )
        )

        multicast_message = messaging.MulticastMessage(
            tokens=[token for token in valid_tokens],
            notification=messaging.Notification(title=title, body=body),
            webpush=config,
            data={"url": url}
        )
        response = messaging.send_each_for_multicast(multicast_message)

        print(f"config sent: {config}")
        print(f"Notification sent: {multicast_message}")
        response_data = {
            "success_count": response.success_count,
            "failure_count": response.failure_count,
            "responses": [
                {
                    "message_id": res.message_id,
                    "exception": str(res.exception) if res.exception else None
                }
                for res in response.responses
            ]
        }

        logger.info(f"Notification sent: {response_data}")
        # Optionally send email
        if email:
            try:
                sender_email = getattr(settings, "EMAIL_HOST_USER", os.getenv("EMAIL_HOST_USER", "noreply@nsgcrm.com"))
                sender_password = getattr(settings, "EMAIL_HOST_PASSWORD", os.getenv("EMAIL_HOST_PASSWORD", ""))
                server = getattr(settings, "EMAIL_HOST", os.getenv("EMAIL_HOST", "smtp.gmail.com"))

                email_sender(
                    server=server,
                    sender_email=sender_email,
                    sender_password=sender_password,
                    receiver=user.email,
                    subject=msg if msg else title,
                    message=sub if sub else body,
                    user=user,
                )
                logger.info(f"Email sent to {user.email}")
                response_data["email_sent"] = True
            except Exception as e:
                logger.error(f"Error sending email: {str(e)}")
                response_data["email_sent"] = False

        return {"success": True, "res": response_data, "response": response_data}

    except Exception as e:
        logger.error(f"send_delayed_notification error: {str(e)}")
        return {"success": False, "res": response_data, "error": str(e)}


@shared_task
def send_weekly_summary():
    try:
        users = User.objects.filter(is_superuser=True)  # Adjust filter as needed
        for user in users:
            print("user", user.id, user.name)
            # Example summary content
            subject = "Weekly Summary"
            message = f"Hi {user.name}, here is your weekly summary!"

            sender_email = getattr(settings, "EMAIL_HOST_USER", os.getenv("EMAIL_HOST_USER", "noreply@nsgcrm.com"))
            sender_password = getattr(settings, "EMAIL_HOST_PASSWORD", os.getenv("EMAIL_HOST_PASSWORD", ""))
            server = getattr(settings, "EMAIL_HOST", os.getenv("EMAIL_HOST", "smtp.gmail.com"))

            # Use your email sending function
            email_sender(
                server=server,
                sender_email=sender_email,
                sender_password=sender_password,
                receiver=user.email,
                subject=subject,
                message=message,
            )
            logger.info(f"Weekly summary email sent to {user.email}")
            print(f"Weekly summary email sent to {user.email}")

    except Exception as e:
        logger.error(f"Error sending weekly summary: {str(e)}")
        print(f"Error sending weekly summary: {str(e)}")

        raise


@shared_task
def send_event_summary_email(user_id, count=5):
    user = User.objects.filter(id=user_id).first()
    if not user:
        return  # Exit if user is not found

    contacts = Contact.objects.filter(owner_id=user_id).order_by('-date_added')[:count]

    contact_details = "\n".join([
        ''.join(f"<li><strong>{contact.name}</strong> (Email: {contact.email}, Phone: {contact.phone})</li>")
        for contact in contacts
    ])
    print("func called send_event_summary_email", user_id, count, contact_details)

    subject = "Great Networking Today! What’s Next?"
    message = f"""
    <html>
    <head></head>
    <body>
        <p>Hey {user.name},</p>

        <p>You made a new connections today! Here’s who you connected with:</p>

        <ul>
            {contact_details}
        </ul>

        <p>Now, let’s make sure you don’t lose touch!</p>
        <ul>
            <li>✅ Add tags to keep your contacts organized</li>
            <li>✅ Send follow-ups to get valuable conversations started</li>
        </ul>

        <p>Tap below to manage your network in minutes!</p>

        <p><a href="https://nsgcrm.com/people" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">👉 Add Tags & Send Follow-Up</a></p>

        <p>Keep building those meaningful connections!</p>

        <p>Best,</p>
        <p>The NSG Team</p>
    </body>
    </html>
    """

    user = User.objects.filter(id=user_id).first()
    sender_email = getattr(settings, "EMAIL_HOST_USER", os.getenv("EMAIL_HOST_USER", "noreply@nsgcrm.com"))
    sender_password = getattr(settings, "EMAIL_HOST_PASSWORD", os.getenv("EMAIL_HOST_PASSWORD", ""))
    server = getattr(settings, "EMAIL_HOST", os.getenv("EMAIL_HOST", "smtp.gmail.com"))

    email_sender(
        server=server,
        sender_email=sender_email,
        sender_password=sender_password,
        receiver=user.email,
        subject=subject,
        message=message,
    )



@shared_task
def reward_host_user_for_referral(host_user):
    try:
        print(f"Rewarding host user with ID: {host_user}")
        # Count all unrewarded referrals for the host user
        host_user = User.objects.filter(id=host_user).first()
        unrewarded_referrals_count = ReferralRelationship.objects.filter(
            host_user=host_user,
            is_rewarded=False,
            is_scheduled=True  # Exclude scheduled referrals
        ).count()
        print(unrewarded_referrals_count)
        print(host_user.email)
        stripe_subscription_id = None
        if unrewarded_referrals_count > 0:
            user_billing_id = host_user.fk_payment_billing_id
            stripe_user = PaymentBilling.objects.get(billing_id=user_billing_id)
            subscription_id = stripe_user.stripe_subscription_id
            stripe_subscription_id = subscription_id
            print(stripe_subscription_id)

        if stripe_subscription_id:
            # Extend the subscription if there are unrewarded referrals
            extend_subscription(stripe_subscription_id, unrewarded_referrals_count, host_user)
    except Exception as e:
        # Log any errors related to rewarding the host user
        print(f"Error rewarding host user: {str(e)}")


@shared_task
def beat_debug():
    logger.info("Beat debug task executed")
    print("beat called")
