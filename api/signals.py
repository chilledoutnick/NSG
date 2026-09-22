# signals.py
# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from django.utils import timezone
# from django.core.cache import cache
import pytz
from celery import states

from advisorapp.settings import STRIPE_SECRET_KEY
from api.models import NoteReminder, Appointment, PaymentBilling
from api.tasks import *
from datetime import datetime, timedelta

from django_celery_beat.models import PeriodicTask, IntervalSchedule
# import json

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.timezone import now
from api.models import Contact
from api.tasks import send_event_summary_email

# A cache or similar mechanism can track daily additions
from django.core.cache import cache
from api.utils.stripe_compat import stripe

if STRIPE_SECRET_KEY and hasattr(stripe, 'api_key'):
    stripe.api_key = STRIPE_SECRET_KEY


# @receiver(post_save, sender=Contact)
# def track_daily_contact_additions(sender, instance, created, **kwargs):
#     if not created:  # Exit if the instance is being updated
#         return
#     today = now().date()
#     # Create a user-specific cache key
#     cache_key = f"contacts_added_{instance.owner_id}_{today}"
#     # Increment the daily count in the cache
#     daily_count = cache.get(cache_key, 0) + 1
#     cache.set(cache_key, daily_count, timeout=86400)  # Cache expires in 1 day
#     print("daily_count", daily_count)
#     print("cache", cache.get(cache_key))
#
#     # for every contacts have been added, trigger the email
#     print("Event summary called", instance.owner_id, daily_count)
#     send_event_summary_email.apply_async(args=[instance.owner_id, daily_count])


# @receiver(post_save, sender=User)
# def getting_started(sender, instance, created, **kwargs):
#     if not created:  # Exit if the instance is being updated
#         return
#     message = "Welcome aboard! Here’s everything you need to know to start building connections and managing " \
#               "contacts with ease."
#     subject = "Getting Started Guide"
#     send_email_task.apply_async(
#         args=[message, subject, instance.email, False, instance.id],
#         # countdown=1
#         countdown=(timedelta(hours=1).total_seconds())
#     )
#     title = "Welcome to NSG!"
#     body = "Let’s set up your profile to start seamless networking."
#
#     send_delayed_notification.apply_async(
#         args=[instance.id, title, body, True, "http://localhost:3000/"]
#     )
#     print("getting_started called")
#
#
# @receiver(post_save, sender=User)
# def social_link(sender, instance, created, **kwargs):
#     if not created:  # Exit if the instance is being updated
#         return
#     subject = "Link your social media accounts to your card"
#     message = f"""
#     <html>
#     <head></head>
#     <body>
#         <p>Hey {instance.name},</p>
#
#         <p>You’re all set up with <strong>NSG</strong>! Now, let’s take it a step further.</p>
#
#         <p>Add your social & professional links to:</p>
#         <ul>
#             <li>✅ Make it easy for new connections to explore your work</li>
#             <li>✅ Showcase your expertise across platforms</li>
#             <li>✅ Build stronger relationships with a complete profile</li>
#         </ul>
#
#         <p>It only takes a minute! Log in now and add your LinkedIn, Instagram, portfolio, or any other link that
#         helps tell your story.</p>
#
#         <p><a href="https://nsgcrm.com/card" style="background: #007bff; color: white; padding: 10px 20px;
#         text-decoration: none; border-radius: 5px;">👉 Update My Card</a></p>
#
#         <p>One small update, big networking impact.</p>
#
#         <p>Best,</p>
#         <p>The NSG Team</p>
#     </body>
#     </html>
#     """
#
#     send_email_task.apply_async(
#         args=[message, subject, instance.email, False, instance.id],
#         # countdown=30
#         countdown=(timedelta(days=3).total_seconds())
#     )
#
#     print("social_link called")
#
#
# @receiver(post_save, sender=User)
# def reminder_digital_card(sender, instance, created, **kwargs):
#     if not created:  # Exit if the instance is being updated
#         return
#     body = "Start sharing your card now!"
#     text = "Ready to network?"
#     send_delayed_notification.apply_async(
#         args=[instance.id, text, body, True, "http://localhost:3000/people"],
#         # countdown=2
#         countdown=((timedelta(days=5).total_seconds()) // 2)
#     )
#
#     print("reminder_digital_card called")
#
#
# @receiver(post_save, sender=User)
# def reminder_wallet(sender, instance, created, **kwargs):
#     if not created:  # Exit if the instance is being updated
#         return
#     body = "Link your calendar in NSG and start scheduling meetings."
#     text = "Activate Scheduling with NSG"
#     send_delayed_notification.apply_async(
#         args=[instance.id, text, body, True, "http://localhost:3000/people"],
#         # countdown=2
#         countdown=((timedelta(days=14).total_seconds()) // 2)
#     )
#
#     print("reminder_wallet called")
#
#
# @receiver(post_save, sender=User)
# def reminder_schedule(sender, instance, created, **kwargs):
#     if not created:  # Exit if the instance is being updated
#         return
#     test = "Add your NSG Card to your Apple/Google Wallet for instant sharing."
#     body = "Just a tap away!"
#     send_delayed_notification.apply_async(
#         args=[instance.id, test, body, True, "http://localhost:3000/people"],
#         # countdown=2
#         countdown=((timedelta(days=10).total_seconds()) // 2)
#     )
#
#     print("reminder_wallet called")
#

# @receiver(post_save, sender=Contact)
# def contact_limits(sender, instance, created, **kwargs):
#     if not created:  # Exit if the instance is being updated
#         return
#     print("contact_limits called")
#     url = "http://localhost:3000/people"
#     contacts = Contact.objects.filter(id=instance.id).count()
#     # If more than 5 contacts have been added, trigger the email
#     if contacts == 10:
#         title = "Discover Tagging"
#         body = "Organize your contacts with tags. Try it out—it’s easy!"
#         send_delayed_notification.apply_async(args=[instance.owner_id, title, body])
#     elif contacts == 20:
#         title = "Got key contacts?"
#         body = "Add Priority to each contact for efficient management."
#         subject = "Got Key Contacts? Set Their Priority!"
#         message = f"""
#         <html>
#         <head></head>
#         <body>
#             <p>Hey {instance.owner.name},</p>
#
#             <p>You’ve made <strong>20 connections</strong> so far! But not every connection is the same, right?</p>
#
#             <p>Now’s the perfect time to prioritize your key contacts:</p>
#
#             <ul> <li>🔥 <strong>High Priority</strong> – Must-follow connections, potential clients,
#             key collaborators</li> <li>⚡ <strong>Medium Priority</strong> – Important but not urgent connections</li>
#             <li>🌱 <strong>Low Priority</strong> – Stay in touch, but no immediate action needed</li> </ul>
#
#             <p>Edit your contacts to set a <strong>Priority Label</strong>.</p>
#
#             <p><a href="https://nsgcrm.com/people" style="background: #007bff; color: white; padding: 10px 20px;
#             text-decoration: none; border-radius: 5px;">👉 Set Priorities Now</a></p>
#
#             <p>Stay on top of your connections effortlessly!</p>
#
#             <p>Best,</p>
#             <p>The NSG Team</p>
#         </body>
#         </html>
#         """
#
#         send_delayed_notification.apply_async(args=[instance.owner_id, title, body, True, url, message, subject])
#     elif contacts == 50:
#         title = "You're a networking pro!"
#         body = "50 connections and counting. "
#         send_delayed_notification.apply_async(args=[instance.owner_id, title, body])


# @receiver(post_save, sender=Appointment)
# def meeting_notification(sender, instance, created, **kwargs):
#     if not created:  # Exit if the instance is being updated
#         return
#
#     # Fetch the first contact ID from the many-to-many relation
#     first_contact = instance.contacts.first()  # Get the first related contact
#     if not first_contact:
#         print("No contacts associated with this appointment.")
#         return
#
#     # body = "Tap to view."
#     body = "Dont forget to join"
#     text = f"{instance.appointment_name} booked a meeting with you!"
#
#     # Generate the URL with the first contact ID
#     url = f"http://localhost:3000/people#contact_id={first_contact.id}"
#
#     # Schedule notification
#     send_delayed_notification.apply_async(
#         args=(instance.id, text, body, False, url),
#         # countdown=2
#     )
#
#     print(f"meeting_notification called with URL: {url}")


# def meeting_reminder(apt, countdown, **kwargs):
#     contact = apt.fk_contact
#     user = apt.fk_contact.owner  # Assuming the appointment is linked to a contact's owner
#
#     title = "Meeting Reminder"
#     body = f"Upcoming meeting with {contact.name} in 1 Hour." \
#         # " Tap to view."
#     try:
#         # Convert countdown to an integer
#         countdown = (int(countdown) * 60)  # payload in minutes
#     except ValueError:
#         raise ValueError(f"Invalid countdown value: {countdown}. It must be a number in seconds.")
#
#     try:
#         # Schedule the notification
#         print(f"Scheduling notification for {user.id} in {countdown} seconds")
#         result = send_delayed_notification.apply_async(
#             args=(user.id, title, body),
#             countdown=1 if countdown <= 3600 else countdown - 3600
#             # countdown=1
#         )
#         result_state = result.state
#
#         # Handle success and failure
#         if result_state == states.SUCCESS:
#             return {"status": "success", "message": "Notification scheduled successfully."}
#         else:
#             return {"status": "Failed", "message": result_state + " " + result}
#     except Exception as e:
#         logger.error(f"Error scheduling notification: {e}")
#         return {
#             "status": "error",
#             "message": "An unexpected error occurred while scheduling the notification.",
#             "error_details": str(e),
#         }


# @receiver(post_save, sender=Contact)
# def exchange_contact_follow_up(user_id, **kwargs):
#     print("schedule_user_notification called ", user_id)
#
#     s = send_delayed_notification.apply_async(
#         args=[user_id],
#         # countdown=3600
#         countdown=(timedelta(days=3).total_seconds())
#     )
#     print("id", s.id)
#     print("result.ready()", s.ready())
#     # print(s.get(timeout=2*10))
#     print("status", s.state)
#     return s.id


# def create_or_update_periodic_task(task_name='send_email_task'):
#     # Create or update an interval schedule (5 minutes)
#     print("create_or_update_periodic_task called")
#     schedule, _ = IntervalSchedule.objects.get_or_create(
#         every=5, period=IntervalSchedule.MINUTES
#     )
#
#     # Create or update a periodic task
#     PeriodicTask.objects.update_or_create(
#         name=f"{task_name}",
#         defaults={
#             "interval": schedule,
#             "task": "api.tasks.send_email_task",
#         },
#     )


# # @receiver(post_save, sender=User)
# def schedule_email_task(**kwargs):
#     create_or_update_periodic_task()


# def schedule_user_notification(user_id: int, text="Welcome to NSG!",
#                                body="Let’s set up your profile to start seamless networking.",
#                                countdown=1, **kwargs):
#     print("schedule_user_notification called ", user_id)
#
#
#     # s = send_delayed_notification.apply_async(
#     #     args=[user_id, text, body, False, "http://localhost:3000/people"],
#     #     countdown=countdown
#     #     # countdown=((timedelta(days=1).total_seconds()) // 2)
#     # )
#     # print("id", s.id)
#     # print("result.ready()", s.ready())
#     # # print(s.get(timeout=2*10))
#     # print("status", s.state)
#     # return s.id


# def reminder_notification(note_id, title, body, url, countdown, **kwargs):
#     # Check if the reminder_datetime is set, and it's a valid future time
#     print("reminder_notification called ")
#     note_reminder = NoteReminder.objects.filter(id=note_id).first()
#     if note_reminder.reminder_datetime:
#         print("reminder_notification called ", note_reminder.fk_user.id)
#
#         try:
#             countdown = 1
#             # Convert countdown to an integer
#             # countdown = (int(countdown) * 60)  # payload in minutes
#
#         except ValueError:
#             raise ValueError(f"Invalid countdown value: {countdown}. It must be a number in seconds.")
#         try:
#             # Schedule the notification
#             formatted = note_reminder.reminder_datetime.strftime("%d %b %Y, %-I:%M %p")
#             sub = "Reminder from NSG"
#             msg = f"""
#              <html>
#     <head></head>
#     <body>
#         <p>Hey {note_reminder.fk_user.name},</p>
#
#         <p>{body}</p>
#
#         <ul>
#             Date: {formatted}
#         </ul>
#
#         <p>Now, let’s make sure you don’t lose touch!</p>
#
#         <p>Tap below to manage your network in minutes!</p>
#
#         <p><a href="https://nsgcrm.com/people" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">👉 Add Tags & Send Follow-Up</a></p>
#
#         <p>Keep building those meaningful connections!</p>
#
#         <p>Best,</p>
#         <p>The NSG Team</p>
#     </body>
#     </html>
#             """
#             print(f"Scheduling notification for {note_reminder.fk_user.id} in {countdown} seconds")
#             result = send_delayed_notification.apply_async(
#                 args=(note_reminder.fk_user.id, title, body, True, url, msg, sub), countdown=countdown
#             )
#             if result.successful():
#                 task_result = result.result  # Get the task result
#                 print("FCM Response:", task_result.get("response"))  # Print the FCM response
#                 return {"status": "success", "message": "Notification scheduled successfully."}
#
#             result_state = result.state
#
#             # Handle success and failure
#             if result_state == states.SUCCESS:
#                 return {"status": "success", "message": "Notification scheduled successfully."}
#             else:
#                 return {"status": "Failed", "message": result_state + " " + str(result)}
#         except IOError as e:
#             logger.error(f"Error scheduling notification: {e}")
#             return {
#                 "status": "error",
#                 "message": "An unexpected error occurred while scheduling the notification.",
#                 "error_details": str(e),
#             }
#
#         # print("id", s.id)
#         # print("result.ready()", s.ready())
#         # print("status", s.state)
#         # return s.id
#     return None


# def schedule_notification_email(user_id, days, title, body, email=False, **kwargs):
#     print("schedule_user_notification called ", user_id)
#
#     s = send_delayed_notification.apply_async(
#         args=[user_id, title, body, email],
#         # countdown=3600
#         countdown=(timedelta(days=days).total_seconds())
#     )
#     print("id", s.id)
#     print("result.ready()", s.ready())
#     # print(s.get(timeout=2*10))
#     print("status", s.state)
#     return s.id


# def schedule_email(user_email, days, title, body, **kwargs):
#     print("schedule_user_notification called ", user_email)
#
#     s = send_email_task.apply_async(
#         args=[title, body, user_email],
#         # countdown=7200
#         countdown=(timedelta(days=days).total_seconds())
#     )
#     print("id", s.id)
#     print("result.ready()", s.ready())
#     # print(s.get(timeout=2*10))
#     print("status", s.state)
#     return s.id


@receiver(post_save, sender=ReferralRelationship)
def handle_referral_creation(sender, instance, created, **kwargs):
    if not created:  # Only trigger on new entries
        return

    host_user = instance.host_user
    user_billing_id = host_user.fk_payment_billing_id
    stripe_user = PaymentBilling.objects.get(billing_id=user_billing_id)
    subscription_id = stripe_user.stripe_subscription_id

    # Check if a subscription exists for the host user
    stripe_subscription_id = subscription_id
    if stripe_subscription_id:
        subscription_end_date_str = fetch_next_billing_date(stripe_subscription_id)
        subscription_end_date = datetime.strptime(subscription_end_date_str, '%Y-%m-%d %H:%M:%S').replace(tzinfo=None)
        trigger_time = subscription_end_date - timedelta(days=1)
        print("trigger_time---------", subscription_end_date - timedelta(days=1))
        print("trigger time datatype", type(subscription_end_date - timedelta(days=1)))

        # For testing purposes, schedule in the next 10 seconds

        # trigger_time =datetime.now() + timedelta(seconds=10)
        print(trigger_time)

        # Schedule the task with Celery
        reward_host_user_for_referral.apply_async(
            args=[host_user.id],
            eta=trigger_time  # Schedule the task to run at `trigger_time`
        )
        print(f"Task scheduled for: {trigger_time}")

        # Mark this referral as scheduled
        instance.is_scheduled = True
        instance.save()
        print("reward_host_user_for_referral task called")


# def send_business_card_push_notification(sender, instance, **kwargs):
#     title = "New Contact from Business Card"
#     body = "You've just added a contact from a business card. Tag and prioritize them for better follow-up!"
#     send_delayed_notification.apply_async(args=[instance.owner_id, title, body])
