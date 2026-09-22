# import re
import unicodedata

import phonenumbers
from api.utils.stripe_compat import stripe
from django.db import models
from rest_framework import status
from rest_framework.response import Response

from api.models import CalDav, User, AdvisorAppointment, EmailOTP, StripeDetails, Profiles, PaymentBilling, \
    ProfileVisit, PotentialContact, Timeline, Email, Appointment
from rest_framework.authentication import get_authorization_header
from apscheduler.schedulers.background import BackgroundScheduler
from django.core.files.uploadedfile import InMemoryUploadedFile
from phonenumbers.phonenumberutil import NumberParseException
from rest_framework.exceptions import AuthenticationFailed
from django.template.loader import render_to_string

from api.models.Email import Thread
from api.models.PaymentBilling import Order
from api.utils.encryption import decrypt_password
from django.core.exceptions import ValidationError
from email.mime.multipart import MIMEMultipart
from PIL import Image, ImageDraw, ImageFont
from api.models.refer import ReferralCode
from email.mime.image import MIMEImage
from email.mime.base import MIMEBase
from email.mime.text import MIMEText
from django.core.validators import *
from django.http import HttpResponse
from django.utils import timezone
from urllib.parse import quote
from email import encoders
import mimetypes
import datetime
import requests
import smtplib
import random
import string
import qrcode
import json
import time
import uuid
import pytz
import jwt
import io
import os

from caldav import DAVClient, Principal
from caldav.lib.error import NotFoundError
from django.utils.timezone import now
from datetime import datetime, timedelta

from api.models.Contact import Contact
from django.conf import settings


def get_user_from_token(request):
    token = get_authorization_header(request).decode().split(" ")[1]
    if not token:
        raise AuthenticationFailed('Unauthenticated')
    try:
        jwt_secret = getattr(settings, "JWT_SECRET", settings.SECRET_KEY)
        payload = jwt.decode(token, jwt_secret, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed('Unauthenticated')
    user = User.objects.filter(id=payload['id']).first()
    return user


def email_sender(server, sender_email, sender_password, receiver, subject, message, reply_to="team@nsgcrm.com",
                 attachment_type='html', marketing_digital_card=False, user=None):
    if not getattr(settings, "SMTP_ENABLED", False):
        try:
            from django.core.mail import EmailMultiAlternatives
            from_email = sender_email or getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@nsgcrm.com")
            email_msg = EmailMultiAlternatives(
                subject=subject,
                body=message if attachment_type != 'html' else "Please view this email in an HTML compatible email viewer.",
                from_email=from_email,
                to=[receiver] if isinstance(receiver, str) else receiver,
                reply_to=[reply_to] if reply_to else None,
            )
            if attachment_type == 'html' or '<html' in message.lower() or '<p' in message.lower():
                email_msg.attach_alternative(message, "text/html")
            if marketing_digital_card and user:
                try:
                    image_data = marketing_card(user, "black", "Financial Education and Services").content
                    email_msg.attach(f"{user.name}.png", image_data, "image/png")
                except Exception as ex:
                    logger.warning("Could not attach marketing card: %s", ex)
            email_msg.send(fail_silently=False)
            logger.info("Email dispatched to %s via %s", receiver, getattr(settings, "EMAIL_BACKEND", "console"))
            return True
        except Exception as e:
            logger.warning("Django console/email backend error: %s", e)
            return False

    try:
        smtp_port = 587
        smtp_server = smtplib.SMTP(server, smtp_port)
        smtp_server.starttls()
        smtp_server.login(sender_email, sender_password)
        msg = MIMEMultipart()
        msg['To'] = receiver
        msg['From'] = sender_email
        msg['Subject'] = subject
        msg['Reply-To'] = reply_to
        if attachment_type == 'html':
            html = MIMEText(message, 'html')
            msg.attach(html)
        else:
            msg.attach(MIMEText(message, 'plain'))
        if marketing_digital_card and user:
            image_data = marketing_card(user, "black", "Financial Education and Services").content
            image_attachment = MIMEImage(image_data, name=f"{user.name}.png")
            msg.attach(image_attachment)
        smtp_server.sendmail(sender_email, receiver, msg.as_string())
        smtp_server.quit()
        return True
    except Exception as e:
        try:
            sender_email = 'noreply@nsgcrm.com'
            sender_password = getattr(settings, "EMAIL_HOST_PASSWORD", "")
            server = 'smtp.gmail.com'
            smtp_port = 587
            smtp_server = smtplib.SMTP(server, smtp_port)
            smtp_server.starttls()
            smtp_server.login(sender_email, sender_password)
            msg = MIMEMultipart()
            msg['To'] = receiver
            msg['From'] = sender_email
            msg['Subject'] = subject
            msg['Reply-To'] = reply_to
            html = MIMEText(message, 'html')
            msg.attach(html)
            if marketing_digital_card and user:
                image_data = marketing_card(user, "black", "Financial Education and Services").content
                image_attachment = MIMEImage(image_data, name=f"{user.name}.png")
                msg.attach(image_attachment)
            smtp_server.sendmail(sender_email, receiver, msg.as_string())
            smtp_server.quit()
            return True
        except Exception as ex:
            logger.warning("SMTP delivery failed: %s", ex)
            return False

def send_email(receiver_email, sender_email, subject, message, sender_password, server, reply_to=''):
    if not getattr(settings, "SMTP_ENABLED", False):
        try:
            from django.core.mail import EmailMultiAlternatives
            from_email = sender_email or getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@nsgcrm.com")
            email_msg = EmailMultiAlternatives(
                subject=subject,
                body="Please view this email in an HTML reader.",
                from_email=from_email,
                to=[receiver_email] if isinstance(receiver_email, str) else receiver_email,
                reply_to=[reply_to] if reply_to else None,
            )
            email_msg.attach_alternative(message, "text/html")
            email_msg.send(fail_silently=False)
            return True
        except Exception as e:
            logger.warning("Django console/email backend error: %s", e)
            return False

    try:
        msg = MIMEMultipart()
        msg['To'] = receiver_email
        msg['From'] = sender_email
        msg['Subject'] = subject
        msg['Reply-To'] = reply_to if reply_to else receiver_email
        html = MIMEText(message, 'html')
        msg.attach(html)
        # Create a connection to the SMTP server
        smtp_port = 587
        smtp_username = sender_email
        smtp_password = sender_password
        smtp_server = server

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.sendmail(smtp_username, receiver_email, msg.as_string())
        server.quit()

        return True
    except Exception as e:
        logger.warning("send_email failed: %s", e)
        return False

def get_ordinal_suffix(day):
    if 10 <= day % 100 <= 20:  # Covers 'th' cases like 11th, 12th, 13th
        suffix = 'th'
    else:
        suffix = {1: 'st', 2: 'nd', 3: 'rd'}.get(day % 10, 'th')
    return suffix


def email_confirmation(appointment, schedule, appointment_timezone, time_zone,
                       message, title, click, subject, ctz=None, deleted_guest=(),
                       deleted=False):
    receiver = None
    user_contact = appointment.fk_contact
    user_appointments = AdvisorAppointment.objects.filter(fk_appointment=appointment)
    duration = appointment.duration
    # end_time = timedelta(minutes=duration)
    is_caldav_user = False
    caldav_user = None
    start_datetime, end_datetime = appointment_in_timezone(appointment, time_zone)

    # Format time for email display
    mail_start_time = start_datetime.strftime("%I:%M %p")
    mail_end_time = end_datetime.strftime("%I:%M %p")
    day_with_suffix = f"{start_datetime.day}{get_ordinal_suffix(start_datetime.day)}"
    date_str = start_datetime.strftime(f'%A, %B {day_with_suffix}, %Y')

    # For calendar URLs (UTC)
    start_datetime_utc = start_datetime.astimezone(pytz.utc)
    end_datetime_utc = end_datetime.astimezone(pytz.utc)
    appointment_dt = start_datetime_utc.strftime('%Y%m%d')
    c_start_time = start_datetime_utc.strftime('%H%M%SZ')
    c_end_time = end_datetime_utc.strftime('%H%M%SZ')

    # URL-encoded timestamps for Outlook
    start_formatted = f"{start_datetime.date()}T{start_datetime.time()}"
    end_formatted = f"{end_datetime.date()}T{end_datetime.time()}"
    start_encoded = quote(start_formatted)
    end_encoded = quote(end_formatted)

    main_user = ""
    try:
        guests_list = appointment.get_guests_list()
    except KeyError as e:
        str(e)
        guests_list = []

    sender_email = 'noreply@nsgcrm.com'
    sender_password = getattr(settings, "EMAIL_HOST_PASSWORD", "")
    server = 'smtp.gmail.com'

    for apt_user in user_appointments:
        user = apt_user.fk_user
        meet_platform = "Google"

        if appointment.meet_link is None or appointment.meet_link == "":
            meet_link = user.meet_url
        else:
            meet_link = appointment.meet_link
            meet_platform = "Zoom" if "zoom" in meet_link else "Google"
        # if user.is_superuser:
        #     message0 = " for building your brand"
        # else:
        #     message0 = ""
        message0 = ""

        description = f"""
        Meet With {user.name}
        Event Name: 30 Minute Meeting

        Location: This is a {meet_platform} Meet web conference.
        You can join this meeting from your computer, tablet, or smartphone.
        {meet_link}


        {user.name} - organiser
        {user.email}

        Reply to {user.email}
        Powered by NSG.tech
        """
        description = quote(description)
        calendar_url = f"""
            https://www.google.com/calendar/render?action=TEMPLATE&text=Meet+With+{user.name.replace(' ', '+')}
            &dates={appointment_dt}T{c_start_time}/{appointment_dt}T{c_end_time}
            &ctz={ctz}
            &details={description}"""
        calendar_url = calendar_url.replace('\n', '').replace(' ', '')
        outlook_calendar_url = f"""
        https://outlook.live.com/calendar/0/action/compose?allday=false
        &body=Meet+With+{user.name.replace(' ', '+')}+Meeting+Link+{meet_link.replace('/', '%2E').replace('-', '%2F')}
        &subject={description}
        &enddt={start_encoded}
        &location=india
        &path=%2Fcalendar%2Faction%2Fcompose&rru=addevent
        &startdt={end_encoded}"""
        outlook_calendar_url = outlook_calendar_url.replace('\n', '').replace(' ', '')
        context = {
            "contact_name": user_contact.name,
            "contact_email": user_contact.email,
            "contact_phone": user_contact.phone,
            "user_name": user.name,
            "user_email": user.email,
            "appointment_date": date_str,
            "appointment_start_time": mail_start_time,
            "appointment_end_time": mail_end_time,
            "appointment_duration": duration,
            "meet_link": meet_link,
            "schedule": schedule,
            "calendar_url": outlook_calendar_url if (user.platform == 'outlook' or
                                                     user.platform == 'hotmail') else calendar_url,
            "time_zone": time_zone,
            "message": message,
            "click": click,
            "title": title,
            "message0": message0,
            "meet_platform": meet_platform,
            "contact_message": f'Your appointment with {user.name} has been successfully '
                               f'{schedule}!'
        }

        contact_message = render_to_string('contactEmail.html', context)

        user_message = render_to_string('userEmail.html', context)
        guests_message = f'{user.surname} {user.name} invited you for a {schedule} meeting'
        # return user_message, calendar_url, outlook_calendar_url
        try:
            from api.views.OutlookView import OutlookView
            response = OutlookView().get_token(None, user=user)
            if response.status_code == 200:
                response_content = response.content.decode('utf-8')  # Decode bytes to string
                response_data = json.loads(response_content)  # Convert JSON string to dictionary
                google_access_token = response_data.get('google_access_token')
                if google_access_token:
                    userinfo_endpoint = 'https://www.googleapis.com/oauth2/v1/userinfo'
                    params = {'access_token': google_access_token}
                    response = requests.get(userinfo_endpoint, params=params)
                    if response.status_code == 200:
                        user_info = response.json()
                        google_mail = user_info.get('email')
                        receiver = google_mail
                outlook_access_token = response_data.get('outlook_access_token')
                if outlook_access_token:
                    userinfo_endpoint = 'https://graph.microsoft.com/v1.0/me'
                    headers = {'Authorization': f'Bearer {outlook_access_token}'}
                    response = requests.get(userinfo_endpoint, headers=headers)
                    if response.status_code == 200:
                        user_info = response.json()
                        outlook_mail = user_info.get('mail')
                        receiver = outlook_mail

                is_caldav_user = response_data.get('caldav_user', False)
                if is_caldav_user:
                    caldav_user = CalDav.objects.get(fk_user=user)
                    receiver = caldav_user.username
            else:
                receiver = user.email
            if user.email not in guests_list:
                main_user = user.email
                email_sender(server, sender_email, sender_password, receiver,
                             subject + f"{user_contact.name}",
                             user_message)
            if user.app_password.strip():
                sender_email = user.email
                sender_password = user.app_password
                if user.platform == 'outlook' or user.platform == 'hotmail':
                    server = 'smtp.office365.com'
                elif user.platform == 'yahoo':
                    server = 'smtp.mail.yahoo.com'
                else:
                    server = 'smtp.' + user.platform + '.com'
            receiver = user_contact.email
            # reply_to = user.email
            if contact_message and is_caldav_user:
                mail = send_caldav_email(
                    user=user,
                    caldav_user=caldav_user,
                    email_content=contact_message,
                    email_subject=subject + f"{user.name} !",
                    email_recipients_list=[receiver],
                    custom_content=True
                )
                print("------mail", mail)

                if not mail:
                    return False
                # email_sender(
                #         server,
                #         sender_email,
                #         sender_password,
                #         receiver,
                #         contact_message,
                #         reply_to
                # )
            if len(guests_list) != 0:
                for guest in guests_list:
                    if guest == user.email:
                        guest_email = user.email
                    else:
                        guest_email = guest.split('@')[0]
                    guest_message = render_to_string('contactEmail.html', {
                        "contact": user_contact.name,
                        "contact_name": guest_email,
                        "appointment_date": date_str,
                        "appointment_start_time": mail_start_time,
                        "appointment_end_time": mail_end_time,
                        "appointment_duration": duration,
                        "meet_link": meet_link,
                        "calendar_url": calendar_url,
                        "time_zone": time_zone.split(' ', 3)[-1],
                        "message": " Looking forward to meeting you soon.",
                        "click": click,
                        "title": title,
                        "contact_message": guests_message
                    })
                    receiver = guest
                    reply_to = main_user
                    email_sender(server, sender_email, sender_password, receiver, subject, guest_message, reply_to)
            if len(guests_list) != 0:
                for guest in deleted_guest:
                    if guest == user.email:
                        guest_email = user.email
                    else:
                        guest_email = guest.split('@')[0]
                    guest_message = render_to_string('contactEmail.html', {
                        "contact": user_contact.name,
                        "contact_name": guest_email,
                        "appointment_date": date_str,
                        "appointment_start_time": mail_start_time,
                        "appointment_end_time": mail_end_time,
                        "appointment_duration": duration,
                        "meet_link": meet_link,
                        "calendar_url": calendar_url,
                        "time_zone": time_zone.split(' ', 3)[-1],
                        "message": "",
                        "click": "Meeting Deleted",
                        "title": "Appointment Deleted",
                        "google_calender": "Remove from",
                        "contact_message": f'Sorry to inform you that you have been removed from a scheduled meeting by'
                                           f'{user.surname} {user.name}'
                    })
                    receiver = guest
                    reply_to = main_user
                    subject = "NSG | Appointment Deleted"
                    email_sender(server, sender_email, sender_password, receiver, subject, guest_message, reply_to)
            return True
        except Exception as e:
            raise Exception(str(e))
    return None


def validate_username(user_name):
    # Define the list of restricted route path segments
    restricted_paths = {
        "card", "dashboard", "account", "calendar", "client-logs", "referral", "communication",
        "help", "feedback", "admin-dashboard", "admin-client-logs", "integrations",
        "user-info", "contact-info", "campaign", "people", "reset-password-dash",
        "pricing", "checkout", "domain", "signup", "metasignup", "metasignup2",
        "metasignup3", "offer", "metademo", "forgot-password", "reset-password",
        "confirm-booking", "otp-password", "cms"
    }
    # Check if the username is alphanumeric
    if not re.match(r'^[a-zA-Z0-9_-]+$', user_name):
        raise ValidationError("Username must contain only alphanumeric characters, underscores, and hyphens.")
    # Check if the username length is between 4 and 20 characters
    if len(user_name) > 80:
        raise ValidationError("Username must be less 20 characters.")
    # Check if username is in restricted path list
    if user_name.lower() in restricted_paths:
        raise ValidationError("This username is not allowed. Please choose a different one.")


def validate_https_url(value):
    url_validator = URLValidator(schemes=['https'])
    if value.strip() == '':
        return  # Empty string is considered valid
    try:
        url_validator(value)
    except ValidationError:
        raise ValidationError('Invalid URL format or scheme. Only URLs starting with "https://" are allowed.')


def duration_validator(value):
    try:
        minute = int(value)
        if minute < 0 or minute > 60:
            raise ValueError()
    except ValueError:
        raise ValidationError("Invalid minute value: must be between 00 and 60.")


def team_member_confirmation(team_member, messages="", delete=False):
    subject = f'Congratulations || You are added to the Team by {team_member.fk_user.name}'
    user_subject = f'Congratulations || You have added {team_member.fk_member.fk_user.name} to the Team.'
    message = f"""
Hello {team_member.fk_member.fk_user.name}, 
Congratulations, you are added to the team by {team_member.fk_user.name}!
                {messages}
                
<br>
Love digital business cards? Create your own with NSG! Share info, manage contacts, and stand out. 
<a href="https://nsgcrm.com/">Get started here.</a>.            """
    user_message = f"""
Hello {team_member.fk_user.name}, 
Congratulations, you have added {team_member.fk_member.fk_user.name} to the team!

<br>
Love digital business cards? Create your own with NSG! Share info, manage contacts, and stand out. 
<a href="https://nsgcrm.com/">Get started here.</a>.
                """
    if delete:
        subject = f'Sorry you are removed from the Team by {team_member.fk_user.name}'
        user_subject = f'You removed {team_member.fk_member.fk_user.name} from the Team.'
        message = f"""
Hello {team_member.fk_member.fk_user.name}, 
We regret to inform you that you are removed from {team_member.fk_user.name}'s team!
If you think this is a mistake, please contact your team lead or us at team@nsgcrm.com.

<br>
Love digital business cards? Create your own with NSG! Share info, manage contacts, and stand out. 
<a href="https://nsgcrm.com/">Get started here.</a>.
                """
        user_message = f"""
Hello {team_member.fk_user.name}, 
You have successfully removed {team_member.fk_member.fk_user.name} from the team!
If you think this is a mistake, please contact us at team@nsgcrm.com.

<br>
Love digital business cards? Create your own with NSG! Share info, manage contacts, and stand out. 
<a href="https://nsgcrm.com/">Get started here.</a>.
                        """

    sender_email = 'noreply@nsgcrm.com'
    sender_password = getattr(settings, "EMAIL_HOST_PASSWORD", "")
    server = 'smtp.gmail.com'
    try:
        receiver = team_member.fk_user.email
        reply_to = sender_email
        email_sender(server, sender_email, sender_password, receiver, user_subject, user_message, reply_to,
                     attachment_type='plain')
        if team_member.fk_user.app_password.strip():
            sender_email = team_member.fk_user.email
            sender_password = team_member.fk_user.app_password
            if team_member.fk_user.platform == 'outlook' or team_member.fk_user.platform == 'hotmail':
                server = 'smtp.office365.com'
            elif team_member.fk_user.platform == 'yahoo':
                server = 'smtp.mail.yahoo.com'
            else:
                server = 'smtp.' + team_member.fk_user.platform + '.com'
        receiver = team_member.fk_member.fk_user.email
        reply_to = team_member.fk_user.email
        email_sender(server, sender_email, sender_password, receiver, subject, message, reply_to,
                     attachment_type='plain')
        return True
    except Exception as e:
        raise Exception(str(e))


def ask_for_review(name, email, message, user_name, username):
    try:
        # Set up the email server
        smtp_server = 'smtp.gmail.com'
        smtp_port = 587
        smtp_username = 'noreply@nsgcrm.com'
        smtp_password = getattr(settings, "EMAIL_HOST_PASSWORD", "")

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)

        # Compose the email
        msg = MIMEMultipart()
        sender_email = 'noreply@nsgcrm.com'
        msg['From'] = sender_email
        msg['To'] = email
        msg['Subject'] = 'Request for Review'

        email_text = f"""

        Dear {name},
        You are receiving this mail because {user_name} wants a review from your end on our platform.
        Please go through {user_name}’s profile and submit a review.
       
        {message if message else ''}

        Website: https://nsgcrm.com/{username}
        
        Love digital business cards? Create your own with NSG! Share info, manage contacts, and stand out. 
        Get started here: https://nsgcrm.com/
        
        Sincerely,
        Team NSG


        """
        msg.attach(MIMEText(email_text, 'plain'))

        # Send the email
        server.sendmail(smtp_username, email, msg.as_string())
        server.quit()

        return "Email sent successfully"
    except Exception as e:
        return str(e)


def marketing_card(user, color, profession):
    name = user.name
    email = user.email
    phone = user.phone
    website = user.username + ".youradviser.ca"
    card_template = Image.open(f"templates/card_template_{color}.jpg")
    card_template = card_template.convert("RGB")

    name_font = ImageFont.truetype("templates/Arial.ttf", 62)
    font = ImageFont.truetype("templates/Arial.ttf", 24)
    draw = ImageDraw.Draw(card_template)
    name_position = (90, 50)  # Adjust the position as needed
    profession_position = (90, 120)  # Adjust the position as needed
    phone_icon = Image.open(f"templates/Ringer Volume {color}.png")
    phone_icon_position = (530, 400)
    phone_position = (570, 400)  # Adjust the position as needed
    phone = f"{phone}"
    email_icon = Image.open(f"templates/mail {color}.png")
    email_icon_position = (530, 450)
    email_position = (570, 450)  # Adjust the position as needed
    email_text = f"{email}"
    website_icon = Image.open(f"templates/Globe {color}.png")
    website_icon_position = (530, 500)
    website_position = (570, 500)  # Adjust the position as needed
    website_text = f"{website}"
    def img(fontcolor):
        img_draw = ImageDraw.Draw(card_template)
        img_draw.text(name_position, name, fill=fontcolor, font=name_font)
        img_draw.text(profession_position, profession, fill=fontcolor, font=font)
        qr = qrcode.QRCode(version=1, box_size=5, border=1)
        qr.add_data(website)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white")
        qr_img = qr_img.resize((200, 200))
        return qr_img

    if color == "black":
        font_color = "white"
        qr_image = img(font_color)
        card_template.paste(qr_image, (100, 330), mask=qr_image)
        phone_icon_with_bg = Image.new("RGBA", phone_icon.size, (0, 0, 0, 0))
        phone_icon_with_bg.paste(phone_icon, (0, 0), phone_icon)
        card_template.paste(phone_icon_with_bg, phone_icon_position)
        draw.text(phone_position, phone, fill=font_color, font=font)
        email_icon_with_bg = Image.new("RGBA", email_icon.size, (0, 0, 0, 0))
        email_icon_with_bg.paste(email_icon, (0, 0), email_icon)
        card_template.paste(email_icon_with_bg, email_icon_position)
        draw.text(email_position, email_text, fill=font_color, font=font)
        website_icon_with_bg = Image.new("RGBA", website_icon.size, (0, 0, 0, 0))
        website_icon_with_bg.paste(website_icon, (0, 0), website_icon)
        card_template.paste(website_icon_with_bg, website_icon_position)
        draw.text(website_position, website_text, fill=font_color, font=font)
    elif color == "white":
        font_color = "black"
        qr_image = img(font_color)
        card_template.paste(qr_image, (100, 330))
        phone_icon_with_bg = Image.new("RGBA", phone_icon.size, (255, 255, 255, 255))
        phone_icon_with_bg.paste(phone_icon, (0, 0), phone_icon)
        card_template.paste(phone_icon_with_bg, phone_icon_position)
        draw.text(phone_position, phone, fill=font_color, font=font)
        email_icon_with_bg = Image.new("RGBA", email_icon.size, (255, 255, 255, 255))
        email_icon_with_bg.paste(email_icon, (0, 0), email_icon)
        card_template.paste(email_icon_with_bg, email_icon_position)
        draw.text(email_position, email_text, fill=font_color, font=font)
        website_icon_with_bg = Image.new("RGBA", website_icon.size, (255, 255, 255, 255))
        website_icon_with_bg.paste(website_icon, (0, 0), website_icon)
        card_template.paste(website_icon_with_bg, website_icon_position)
        draw.text(website_position, website_text, fill=font_color, font=font)
    buffer = io.BytesIO()
    card_template.save(buffer, format="PNG")
    buffer.seek(0)
    response = HttpResponse(content_type="image/png")
    response.write(buffer.read())

    return response


def card_email(user, color, profession, user_email, message, sender_name):
    try:
        sender_email = 'noreply@nsgcrm.com'
        sender_password = getattr(settings, "EMAIL_HOST_PASSWORD", "")
        server = 'smtp.gmail.com'
        name = user.name
        try:
            if user.app_password.strip():
                sender_email = user.email
                sender_password = user.app_password
                if user.platform == 'outlook' or user.platform == 'hotmail':
                    server = 'smtp.office365.com'
                elif user.platform == 'yahoo':
                    server = 'smtp.mail.yahoo.com'
                else:
                    server = 'smtp.' + user.platform + '.com'
        except Exception as e:
            str(e)
            sender_email = 'noreply@nsgcrm.com'
            sender_password = getattr(settings, "EMAIL_HOST_PASSWORD", "")
            server = 'smtp.gmail.com'

        msg = MIMEMultipart()
        sender_email = sender_email
        msg['From'] = sender_email
        msg['To'] = user_email
        msg['Reply-To'] = sender_email
        msg['Subject'] = 'Unlock Your Digital Potential'
        # image_path = marketing_card()
        # with open(image_response, 'rb') as card_image_file:
        image_data = marketing_card(user, color, profession).content
        image_attachment = MIMEImage(image_data, name=f"{name}.png")
        msg.attach(image_attachment)
        email_text = f"""
Dear {sender_name},
You are receiving this mail because {name} wants to share their Digital Card with you.
Please go through his Digital Card and and you can download it as well.
{name} also shared one message for you below:
                
{message}

Sincerely,
{name}  
Website: https://nsgcrm.com/{user.username}

<br>
Love digital business cards? Create your own with NSG! Share info, manage contacts, and stand out. 
<a href="https://nsgcrm.com/">Get started here.</a>.
                """
        msg.attach(MIMEText(email_text, 'plain'))

        # Create a connection to the SMTP server
        smtp_port = 587
        smtp_username = sender_email
        smtp_password = sender_password
        smtp_server = server

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        # print(smtp_username, user_email, email_text)
        server.sendmail(smtp_username, user_email, msg.as_string())
        server.quit()

    except Exception as e:
        raise Exception(e)


def image_compressor(picture, user, quality=70):
    image = Image.open(picture)

    # Convert if needed
    if image.mode != "RGB":
        image = image.convert("RGB")

    # Resize large images
    MAX_SIZE = (1080, 1080)
    image.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)

    # Save to WebP with better quality
    webp_buffer = io.BytesIO()
    image.save(webp_buffer, format="WEBP", quality=quality, optimize=True)
    size = webp_buffer.tell()  # GET SIZE BEFORE seek(0)

    webp_buffer.seek(0)

    unique_id = uuid.uuid4().hex[:8]
    file_path = f"img/{user.username}/"
    webp_name = f"{file_path}{unique_id}.webp"

    resized_file = InMemoryUploadedFile(
        file=webp_buffer,
        field_name=None,
        name=webp_name,
        content_type="image/webp",
        size=size,
        charset=None,
    )

    return resized_file



def webp_convertor(picture):
    image = Image.open(picture)
    print(image.size)

    resized_image = image  # Add resizing here if needed

    # Generate a unique filename
    unique_filename = f"{uuid.uuid4().hex}.webp"

    # Save the resized image as .webp
    webp_folder = "img/webp"
    os.makedirs(webp_folder, exist_ok=True)
    # webp_name = os.path.join(webp_folder, unique_filename)

    webp_buffer = io.BytesIO()
    resized_image.save(webp_buffer, format="WEBP")

    # Seek to the beginning of the buffer
    size = webp_buffer.tell()

    webp_buffer.seek(0)

    # Create an InMemoryUploadedFile
    webp_file = InMemoryUploadedFile(
        file=webp_buffer,
        field_name=None,
        name=unique_filename,  # ✅ safer name
        content_type="image/webp",
        size=size,
        charset=None,
    )

    return webp_file


def send_coupon(email_id, coupon_code):
    try:
        # Set up the email server
        smtp_port = 587
        smtp_username = 'noreply@nsgcrm.com'
        smtp_password = getattr(settings, "EMAIL_HOST_PASSWORD", "")
        smtp_server = 'smtp.gmail.com'

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)

        # Compose the email
        msg = MIMEMultipart()
        sender_email = 'noreply@nsgcrm.com'
        msg['From'] = sender_email
        msg['To'] = email_id
        msg['Subject'] = 'Your Exclusive 10% Off Coupon Inside – Limited Time Offer! '

        email_text = f"""
Dear,

We hope you're having a fantastic day!Thank you for unlocking the savings. 
As promised, here's your exclusive 10% off coupon for our NFC business cards.

Your Personalized Coupon Code:"{coupon_code}"

Simply enter this code at checkout to enjoy your EXTRA discount. 

Hurry! This offer is for a limited time only. We appreciate you joining the NSG community. 
Leap into seamless networking with our NFC business cards!


<br>
Love digital business cards? Create your own with NSG! Share info, manage contacts, and stand out. 
<a href="https://nsgcrm.com/">Get started here.</a>.
<br>
Sincerely,
Team NSG  
        """
        msg.attach(MIMEText(email_text, 'plain'))

        # Send the email
        server.sendmail(smtp_username, email_id, msg.as_string())
        server.quit()

        return "Email sent successfully"
    except Exception as e:
        return str(e)


def business_card_email(user, receiver_email, message, receiver_name):
    try:
        name = user.name
        personal_message = message if message.strip() else ""
        if user.app_password.strip():
            sender_email = user.email
            sender_password = user.app_password.strip()
            if user.platform == 'outlook' or user.platform == 'hotmail':
                server = 'smtp.office365.com'
            elif user.platform == 'yahoo':
                server = 'smtp.mail.yahoo.com'
            else:
                server = 'smtp.' + user.platform + '.com'
        else:
            sender_email = 'noreply@nsgcrm.com'
            sender_password = getattr(settings, "EMAIL_HOST_PASSWORD", "")
            server = 'smtp.gmail.com'

        subject = ' Connecting with {} – Digital Business Card'.format(name)

        email_text = f"""
Hi {receiver_name},<br><br>
Hope this message finds you well. It's {name}, and I wanted to share my digital business card with you for easy access 
to my contact information.<br><br>
You can view my NSG Business Card here: https://nsgcrm.com/{user.username}/.<br><br>
Looking forward to staying in touch and exploring opportunities to collaborate further.<br>
{personal_message}<br>

<br>
Love digital business cards? Create your own with NSG! Share info, manage contacts, and stand out. 
<a href="https://nsgcrm.com/">Get started here.</a>.
<br>
Thanks,
<br>
{name}<br><br>

<hr> 
                """
        send_email(receiver_email=receiver_email,sender_email=sender_email,subject=subject,
                          sender_password=sender_password, message=email_text, server=server)

    except Exception as e:
        raise Exception(e)


def send_referral_email(user, referral_email, code, refer_code):
    try:
        # Use secure environment variables or config files for credentials
        sender_email = 'noreply@nsgcrm.com'
        sender_password = getattr(settings, "EMAIL_HOST_PASSWORD", "")
        server = 'smtp.gmail.com'
        name = user.name

        subject = 'Welcome to the NSG Family!'

        email_text = f"""
Dear,<br><br>

Congratulations on becoming a part of the NSG community! Your friend,<br> 
<b>{name}</b>, referred you to avail an exciting offer, allowing you to elevate your networking effectively with a<br> 
<b>Premium digital business card</b>.<br><br>

Create Your premium business card for free :https://nsgcrm.com/signup/{code} <br>
and use this coupon code {refer_code} to get 22% off - Valid for 15 Days<br><br>

If you have any questions or need assistance, our customer support team is always here to help you.<br><br>

Thank you for choosing <b>NSG</b><br><br>

Sincerely,<br>
<b>NSG</b><br>
Website: https://nsgcrm.com/
"""

        send_email(receiver_email=referral_email, sender_email=sender_email, subject=subject,
                   sender_password=sender_password, message=email_text, server=server)

    except Exception as e:
        raise Exception(e)


def send_confirm_referral_email(host_user, referral_code, referred_user):
    try:
        sender_password = getattr(settings, "EMAIL_HOST_PASSWORD", "")
        server = 'smtp.gmail.com'
        receiver_email = host_user.email
        name = host_user.name
        friend = referred_user.name
        sender_email = 'noreply@nsgcrm.com'
        subject = 'You have successfully referred one person'

        email_text = f"""
Dear {name},<br><br>

Your outstanding commitment to your network and friends deserves special recognition, and we<br>
want to express our gratitude.<br><br>

You successfully referred <b>{friend}</b> and he completed their sign up in our website.<br><br>

As a token of our gratitude, we're thrilled to present you with an exclusive <b>18% offer promo<br> 
code</b>. This code can be used for your future purchases or towards any marketing services we offer.<br> 
<b><a href="https://nsgcrm.com/contact-sales">Learn more</a></b><br><br>

Here is your unique promo code: <b>{referral_code}</b> - Valid For 30 Days<br><br>

You can also share this code with your friends and family, who would benefit from <b>NSG</b>.<br><br>

Thank you once again for being a valued member of our community.<br><br>
<br>
Love digital business cards? Create your own with NSG! Share info, manage contacts, and stand out. 
<a href="https://nsgcrm.com/">Get started here.</a>.
<br>
Sincerely,<br>
<b>NSG</b><br>
Website: https://nsgcrm.com/
"""
        send_email(receiver_email=receiver_email, sender_email=sender_email, subject=subject,
                   sender_password=sender_password, message=email_text, server=server)

        return "Email sent successfully"
    except Exception as e:
        return str(e)


def receive_card_email(user, receiver_email):
    try:
        name = user.name
        # try:
        #     if user.app_password.strip():
        # if user.platform == 'outlook' or user.platform == 'hotmail':
        #     server = 'smtp.office365.com'
        # elif user.platform == 'yahoo':
        #     server = 'smtp.mail.yahoo.com'
        # else:
        #     server = 'smtp.' + user.platform + '.com'
        # except Exception as e:
        #     str(e)
        sender_email = 'noreply@nsgcrm.com'
        sender_password = getattr(settings, "EMAIL_HOST_PASSWORD", "")
        server = 'smtp.gmail.com'

        subject = '{}’s Digital Business Card'.format(name)
        # image_path = marketing_card()
        # with open(image_response, 'rb') as card_image_file:

        email_text = f"""
Hey there,<br><br>
It’s {name}. Thank you for reaching out and expressing interest in connecting with me<br><br>
You can access my NSG Business Card here: https://nsgcrm.com/{user.username}/. Feel free to save or share it at your 
convenience.<br><br>
Looking forward to staying in touch and exploring opportunities to collaborate further.<br><br>
<br>
Love digital business cards? Create your own with NSG! Share info, manage contacts, and stand out. 
<a href="https://nsgcrm.com/">Get started here.</a> <br><br>

Best regards,<br>
{name}<br><br>
<hr>
                """
        send_email(receiver_email=receiver_email, sender_email=sender_email, subject=subject,
                   sender_password=sender_password, message=email_text, server=server)

    except Exception as e:
        raise Exception(e)


def email_otp(email, otp, user, email_verification=0):
    try:
        sender_email = 'noreply@nsgcrm.com'
        sender_password = getattr(settings, "EMAIL_HOST_PASSWORD", "")
        server = 'smtp.gmail.com'
        name = user.name
        subject = 'NSG | Your OTP'
        request = "We received a request to reset your password!"
        if email_verification == 1:
            request = "We received a request to verify your email!"
        email_text = f"""
                Hi {name},<br><br>

                {request}<br>
                Your OTP is {otp}. This code is valid for 5 minutes.<br><br>

                If you think this is a mistake, please ignore the email or contact us at team@nsgcrm.com.<br><br>
                Sincerely,<br>
                NSG <br>
                https://nsgcrm.com/
                                """
        if email_verification == 2:
            subject = 'Your Email is Verified!'
            email_text = f"""
                    Hi {name},<br><br>

                    Your email address has been successfully verified.<br><br>

                    Continue setting up your account and explore all the features NSG has to offer.<br>

                    We're here to support you every step of the way.<br><br>
<br>
Love digital business cards? Create your own with NSG! Share info, manage contacts, and stand out. 
<a href="https://nsgcrm.com/">Get started here.</a>.
<br>
                    Sincerely,<br>
                    Team NSG
                                """
        send_email(receiver_email=email, sender_email=sender_email, subject=subject,
                   sender_password=sender_password, message=email_text, server=server)

    except Exception as e:
        raise Exception(e)


def send_team_referral_email(name, email, admin):
    try:
        user = admin.fk_user
        sender_email = 'noreply@nsgcrm.com'
        sender_password = getattr(settings, "EMAIL_HOST_PASSWORD", "")
        server = 'smtp.gmail.com'

        subject = 'Create Your Premium Business Card Account!'

        email_text = f"""
Dear {name},<br><br>

We are excited to have you on board!  Your account has already been created by <strong>{user.name}</strong>.<br><br>
<strong>Account Details:</strong><br> 
<strong>Email Address:</strong>{email}<br><br>
To access your account, please follow these steps to set up your password:<br><br>

<ol>
    <li><strong>Reset Your Password:</strong>
        <ul>
            <li>Visit our password reset page: 
            <a href="https://nsgcrm.com/forgot-password" class="button">Reset Password</a></li>
            <li>Enter your email address associated with this account.</li>
        </ul>
    </li><br>
    <li><strong>Verify Your Email:</strong>
        <ul>
            <li>You will receive a One-Time Password (OTP) in your email.</li>
            <li>Please check your inbox for the OTP. <strong>Note: Please check your spam folder as well.</strong></li>
        </ul>
    </li><br>
    <li><strong>Set Up a New Password:</strong>
        <ul>
            <li>Enter the OTP on the password reset page.</li>
            <li>Create and confirm your new password.</li>
        </ul>
    </li>
</ol>

Once you have successfully reset your password, you can log in to your account and start using our services.<br>

If you have any questions or need assistance, our customer support team is always here to help you.<br><br>

<strong>Welcome aboard!</strong><br><br>

Thank you for choosing <b>NSG</b><br><br>

Sincerely,<br>
<b>NSG</b><br>
Website: https://nsgcrm.com/
"""

        send_email(receiver_email=email, sender_email=sender_email, subject=subject,
                   sender_password=sender_password, message=email_text, server=server)

    except Exception as e:
        raise Exception(e)


def sanitize_customer_data(customer):
    # Remove sensitive information like credit card details
    sanitized_data = {key: value for key, value in customer.items() if key not in ['sources', 'default_source']}
    return sanitized_data


def send_exchange_contact_email(user, email, name, user_name, username, company):
    try:
        referral = ReferralCode.objects.filter(fk_user=user).first()
        referral_code = referral.code if referral else None

        sender_email = 'noreply@nsgcrm.com'
        sender_password = getattr(settings, "EMAIL_HOST_PASSWORD", "")
        server = 'smtp.gmail.com'

        subject = f"Thanks for Connecting with {user_name}"

        email_text = f"""
Hi {name},<br><br>
Here’s {user_name}’s NSG Card. You can easily access their contact information and stay connected:<br><br>

<a href="https://nsgcrm.com/{username}/">https://nsgcrm.com/{username}/</a><br><br>

<b>Name:</b><br>
{user_name}<br><br>

{f'<b>Company:</b><br>{company}<br><br>' if company else ''}

{f'<b>Email:</b><br>{user.email}<br><br>' if user.email else ''}

{f'<b>Phone:</b><br>{user.phone}<br><br>' if user.phone else ''}

Love the convenience of digital business cards? Create your own with NSG!<br>
Easily share your information, manage contacts, and stand out from the crowd.<br>
<a href="https://nsgcrm.com/signup/{referral_code}" style="color:#5640FA; text-decoration: underline;">Create yours here</a>.<br><br>

Best regards,<br>
Team NSG<br>
"""

        send_email(
            receiver_email=email,
            sender_email=sender_email,
            subject=subject,
            sender_password=sender_password,
            message=email_text,
            server=server
        )

    except Exception as e:
        raise Exception(e)

def delete_email_otp():
    # Retrieve expired OTP objects before deleting them
    expired_otp_objects = EmailOTP.objects.filter(
        expiry_time__lte=timezone.now()
    )

    # Create a dictionary of deleted OTP details
    deleted_items = {otp.otpId: {'email': otp.email, 'otp': otp.otp} for otp in expired_otp_objects}

    # Delete the expired OTP objects
    expired_otp_objects.delete()

    # Print or log the deleted items
    print("Deleted OTPs:", deleted_items)


def schedule_delete_task():
    scheduler = BackgroundScheduler()
    scheduler.start()

    # trigger_time = subscription_end_date - timedelta(days=1)
    # for testing purpose use below line to schedule it to next 10 sec
    trigger_time = timezone.now() + timedelta(seconds=10)
    print("Scheduling job to run...")

    scheduler.add_job(
        delete_email_otp,
        'date',
        run_date=trigger_time,
    )

    print(f"Job scheduled for: {trigger_time}")

    # Optional: Delay the shutdown to allow the scheduler to run
    time.sleep(15)
    scheduler.shutdown(wait=False)
    print("Scheduler shutdown .")


def generate_random_username(length=5):
    letters = string.ascii_lowercase + string.digits
    return ''.join(random.choice(letters) for _ in range(length))


def handle_price_events(stripe_object, event_type):
    """
    Handle price-related events and update the StripeDetails model.
    """
    price_id = stripe_object['id']
    month = stripe_object.recurring.interval == "month"
    print("Month: ", month)
    amount = stripe_object.get('unit_amount', 0) / 100  # Convert cents to dollars
    if event_type == 'price.created':
        # Logic for creating or updating price
        if month:
            StripeDetails.objects.update_or_create(
                product_id=stripe_object.product,
                defaults={"monthly_price": amount,
                          "monthly_price_id": price_id}
            )
        else:
            StripeDetails.objects.update_or_create(
                product_id=stripe_object.product,
                defaults={"yearly_price": amount,
                          "yearly_price_id": price_id}
            )
    elif event_type == 'price.updated':
        # Logic for updating price
        if month:
            StripeDetails.objects.filter(product_id=stripe_object.product).update(
                monthly_price=amount,
                monthly_price_id=price_id
            )
        else:
            StripeDetails.objects.filter(product_id=stripe_object.product).update(
                yearly_price=amount,
                yearly_price_id=price_id
            )
    elif event_type == 'price.deleted':
        # Logic for deleting price
        StripeDetails.objects.filter(product_id=stripe_object.product).update(
            status=False
        )


def handle_product_events(stripe_object, event_type):
    """
    Handle product-related events and update the StripeDetails model.
    """
    product_id = stripe_object['id']
    if event_type == 'product.created':
        # Logic for creating or updating product
        StripeDetails.objects.update_or_create(
            product_id=product_id,
            defaults={
                "product_name": stripe_object.get("name"),
                "desc": stripe_object.get("description", ""),
            }
        )
    elif event_type == 'product.updated':
        # Logic for updating product
        StripeDetails.objects.filter(product_id=product_id).update(
            product_name=stripe_object.get("name"),
            desc=stripe_object.get("description", "")
        )
    elif event_type == 'product.deleted':
        # Logic for deleting product
        StripeDetails.objects.filter(product_id=product_id).update(
            status=False
        )


def contact_image_upload_to(picture, contact, quality=40):
    image = Image.open(picture)

    # Convert the image to the WebP format with specified quality
    webp_buffer = io.BytesIO()
    image.save(webp_buffer, format="WEBP", quality=quality, optimize=True)

    # Seek to the beginning of the buffer
    webp_buffer.seek(0)

    # Define the file path for the new WebP image
    user_name = re.sub('[^a-zA-Z0-9]', '', str(contact.owner.name))

    # Clean the contact name to remove special characters
    contact_name = re.sub('[^a-zA-Z0-9]', '', str(contact.name))

    # Return the upload path in the format user_name/contacts/contact_name/pictures/filename
    file_path = f'img/{user_name}/contacts/{contact_name}_{contact.id}/pictures/'
    webp_name = file_path + str(picture.name.split(".")[0]) + ".webp"

    # Create an InMemoryUploadedFile for the WebP image
    resized_file = InMemoryUploadedFile(
        file=webp_buffer,
        field_name=None,
        name=webp_name,
        content_type="image/webp",  # Set the content type to WebP
        size=webp_buffer.tell(),
        charset=None,
    )

    return resized_file


def alphabet_color(first_letter: str):
    try:
        alphabet_color_dict = {
            'A': "#83B0F3", 'B': "#B5756C", 'C': "#7A883B", 'D': "#AE9CC6",
            'E': "#C49D58", 'F': "#AE9CC6", 'G': "#7A883B", 'H': "#C49D58",
            'I': "#7A883B", 'J': "#83B0F3", 'K': "#AFA5FF", 'L': "#B5756C",
            'M': "#AFA5FF", 'N': "#C49D58", 'O': "#AFA5FF", 'P': "#B5756C",
            'Q': "#7A883B", 'R': "#C49D58", 'S': "#AE9CC6", 'T': "#83B0F3",
            'U': "#C49D58", 'V': "#B5756C", 'W': "#C49D58", 'X': "#83B0F3",
            'Y': "#7A883B", 'Z': "#AFA5FF", '1': "#83B0F3", '2': "#B5756C",
            '3': "#7A883B", '4': "#AE9CC6", '5': "#C49D58", '6': "#AE9CC6",
            '7': "#7A883B", '8': "#C49D58", '9': "#7A883B", '0': "#83B0F3",
        }
        return alphabet_color_dict[first_letter]
    except KeyError as e:
        str(e)
        return "#83B0F3"


def validate_phone(phone_number):
    if not phone_number or phone_number == "null":
        return None

    try:
        # Default region = US (covers Canada as well)
        parsed_number = phonenumbers.parse(phone_number, "US")

        if not phonenumbers.is_valid_number(parsed_number):
            raise ValidationError("Invalid phone number.")

        # Convert to E.164 (SuprSend requirement)
        return phonenumbers.format_number(
            parsed_number,
            phonenumbers.PhoneNumberFormat.E164
        )

    except NumberParseException:
        raise ValidationError(
            "Invalid phone number format. Example: +1 (555) 555-5555"
        )


def send_feedback_mail(emoji, comment, user):
    try:
        user_name = user.name
        sender_email = 'noreply@nsgcrm.com'
        sender_password = getattr(settings, "EMAIL_HOST_PASSWORD", "")
        server = 'smtp.gmail.com'
        recipients = ['notifications@nsgcrm.com']

        # Create email message
        receiver_email = ", ".join(recipients)  # Convert list to comma-separated string
        subject = f'Feedback from {user_name}'

        # Assign actual emojis
        if emoji == "Satisfied":
            emoji_icon = "😍"
        elif emoji == "Moderately satisfied":
            emoji_icon = "😌"
        else:
            emoji_icon = "😡"

        email_text = f"""
        Dear Team,<br><br>
        We received feedback from {user_name}.<br><br>
        <b>Emoji:</b> {emoji_icon} {emoji}<br>
        <b>Comment:</b> {comment}<br><br>
        
        <br>
Love digital business cards? Create your own with NSG! Share info, manage contacts, and stand out. 
<a href="https://nsgcrm.com/">Get started here.</a>.
<br>
        Sincerely,<br>
        Team NSG<br>
        """
        send_email(receiver_email=receiver_email, sender_email=sender_email, subject=subject,
                   sender_password=sender_password, message=email_text, server=server)

        return True  # Indicate success

    except Exception as e:
        return str(e)


def send_caldav_email(user, caldav_user, email_content, email_subject,
                      email_recipients_list, attachments=None,
                      cc_recipients_list=None, contact_names=None, custom_content=False):
    try:
        user_name = user.name
        sender_email = caldav_user.username
        sender_password = decrypt_password(caldav_user.password)
        platform = caldav_user.platform

        if platform == "icloud":
            smtp_server = "smtp.mail.me.com"
        elif platform == "zoho":
            smtp_server = "smtp.zoho.com"
        elif platform == "webnames":
            smtp_server = "securemail.webnames.ca"
        else:
            return "Unsupported email platform"

        smtp_port = 465
        contact_names = contact_names if contact_names else []

        server = smtplib.SMTP_SSL(smtp_server, smtp_port)
        server.login(sender_email, sender_password)

        for i, recipient in enumerate(email_recipients_list):
            msg = MIMEMultipart()
            msg['From'] = sender_email
            msg['To'] = recipient
            msg['Subject'] = email_subject
            msg['Reply-To'] = sender_email

            # Add CC only for single recipient
            if cc_recipients_list and len(email_recipients_list) == 1:
                msg['Cc'] = ", ".join(cc_recipients_list)

            contact_name = contact_names[i] if i < len(contact_names) else recipient

            if custom_content:
                html = email_content
            else:
                html = f"""
                Hi {contact_name},<br><br>
                {email_content}<br><br>
                Best Regards,<br>
                {user_name}<br>
                Send Via <a href="https://nsgcrm.com/">NSG</a><br>
                """
            msg.attach(MIMEText(html, 'html'))

            # Attach files
            if attachments:
                for attachment in attachments:
                    # Guess MIME type based on file name
                    mime_type, _ = mimetypes.guess_type(attachment.name)
                    if mime_type is None:
                        mime_type = 'application/octet-stream'
                    maintype, subtype = mime_type.split('/', 1)

                    # Create MIME part
                    part = MIMEBase(maintype, subtype)
                    part.set_payload(attachment.read())
                    encoders.encode_base64(part)
                    part.add_header('Content-Disposition', f'attachment; filename="{attachment.name}"')
                    msg.attach(part)

                    # Rewind the file pointer in case you use the file again
                    attachment.seek(0)

            final_recipients = [recipient]
            if cc_recipients_list and len(email_recipients_list) == 1:
                final_recipients += cc_recipients_list

            server.sendmail(sender_email, final_recipients, msg.as_string())

        server.quit()
        return True

    except Exception as e:
        return str(e)


def notify_team_about_new_lead(contact_data):
    try:
        sender_email = 'noreply@nsgcrm.com'
        sender_password = getattr(settings, "EMAIL_HOST_PASSWORD", "")
        server = 'smtp.gmail.com'

        recipients = ['team@nsgcrm.com', 'notifications@nsgcrm.com', 'nikhil@nsgcrm.com']
        receiver_email = ", ".join(recipients)
        subject = 'New Contact Sales Lead Received'

        email_body = f"""
Hello Team,

A new lead has been submitted via the website:

First Name: {contact_data['first_name']}
Last Name: {contact_data['last_name']}
Email: {contact_data['email']}
Phone: {contact_data['phone']}
Message: {contact_data['message']}

You can follow up accordingly.

Best,
NSG Sales Bot
        """

        send_email(receiver_email=receiver_email, sender_email=sender_email, subject=subject,
                   sender_password=sender_password, message=email_body, server=server)

        return "Notification sent successfully"
    except Exception as e:
        return f"Error sending notification: {str(e)}"


def caldav_event(user, event_id):
    try:
        # Connect to CalDAV
        caldav_user = CalDav.objects.get(fk_user=user)
        client = DAVClient(
            url=caldav_user.url,
            username=caldav_user.username,
            password=decrypt_password(caldav_user.password)
        )
        principal = client.principal()
        calendars = principal.calendars()
        if not calendars:
            raise Exception("No calendars found for the user")
        target_calendar = calendars[0]
        event = None
        # Try direct lookup if available
        if hasattr(target_calendar, 'event_by_uid'):
            event = target_calendar.event_by_uid(event_id)
        if event is None:
            # Fallback: iterate all events (could be optimized with filters)
            for e in target_calendar.events():
                vevent = e.vobject_instance.vevent
                if str(vevent.uid.value) == event_id:
                    event = e
                    break
        if event is None:
            raise ValueError(f"Event with UID {event_id} not found")  #
        return event
    except Exception as e:
        raise e

def cancel_caldav_event(event_id, user):
    try:
        # Set up DAV client using user's CalDAV credentials
        event = caldav_event(user=user, event_id=event_id)
        if event:
            event.delete()
            return True
        else:
            return False

    except NotFoundError:
        return False
    except Exception as e:
        raise e

def reschedule_caldav_event(user, event_id, new_date, new_time, duration, timezone_name):
    try:

        try:
            event = caldav_event(user, event_id)
            # Format new times
            tz = pytz.timezone(timezone_name)

            # Parse and localize dtstart
            dtstart_naive = datetime.strptime(f"{''.join(new_date.split('-'))}T{''.join(new_time.split(':'))}", "%Y%m%dT%H%M%S")
            dtstart_local = tz.localize(dtstart_naive)

            # Convert to UTC
            dtstart_utc = dtstart_local.astimezone(pytz.utc)

            # Format as iCalendar datetime string with 'Z' suffix
            dtstart = dtstart_utc.strftime("%Y%m%dT%H%M%SZ")

            # Parse and localize dtend
            try:
                dur_minutes = int(duration)
            except (TypeError, ValueError):
                return False, f"Invalid duration: {duration}"

            duration = timedelta(minutes=dur_minutes)
            # dtend_naive = datetime.strptime(dtend_str, "%Y%m%dT%H%M%S")
            # dtend_local = timezone.localize(dtend_naive)

            # Convert to UTC
            # dtend_utc = dtend_local.astimezone(pytz.utc)
            dtend_utc = dtstart_local + duration

            # Format as iCalendar datetime string with 'Z' suffix
            dtend = dtend_utc.strftime("%Y%m%dT%H%M%SZ")

            # Parse duration



            event.icalendar_instance.subcomponents[0]["DTSTART"] = dtstart
            event.icalendar_instance.subcomponents[0]["DTEND"] = dtend

            event.save()
            return True, event
        except Exception as e:
            raise RuntimeError(f"Failed to reschedule event {event_id}: {e}")

    except Exception as e:
        return False, str(e)

def get_user_from_request(request):
    """Authenticate user: prefer username, else fallback to JWT token."""
    username = request.data.get("username")

    # If username is provided, authenticate using username/profile
    if username:
        try:
            validate_username(username)
        except ValidationError as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(username=username).first()
        if not user:
            profile = Profiles.objects.filter(username=username).first()
            if not profile:
                return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            user = User.objects.filter(id=profile.fk_user_id).first()

        return user

    # If no username given, try authenticating via token
    try:
        return get_user_from_token(request)
    except Exception as e:
        str(e)
        return Response({'message': 'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED)


def ensure_aware_utc(dt_value):
    if dt_value is None:
        return None
    if timezone.is_naive(dt_value):
        return timezone.make_aware(dt_value, timezone.utc)
    return dt_value.astimezone(timezone.utc)


def combine_local_to_utc(date_value, time_value, timezone_name):
    tz = pytz.timezone(timezone_name or "UTC")
    if isinstance(date_value, str):
        date_value = datetime.strptime(date_value, "%Y-%m-%d").date()
    if isinstance(time_value, str):
        time_value = datetime.strptime(time_value, "%H:%M:%S").time()
    local_dt = tz.localize(datetime.combine(date_value, time_value))
    return local_dt.astimezone(pytz.utc)


def appointment_start_utc(appointment):
    if appointment.appointment_start_at:
        return ensure_aware_utc(appointment.appointment_start_at)
    return combine_local_to_utc(
        appointment.appointment_date,
        appointment.appointment_time,
        appointment.timezone or "UTC",
    )


def appointment_end_utc(appointment):
    if appointment.appointment_end_at:
        return ensure_aware_utc(appointment.appointment_end_at)
    return appointment_start_utc(appointment) + timedelta(minutes=appointment.duration or 0)


def appointment_in_timezone(appointment, timezone_name):
    target_tz = pytz.timezone(timezone_name or "UTC")
    start_dt = appointment_start_utc(appointment).astimezone(target_tz)
    end_dt = appointment_end_utc(appointment).astimezone(target_tz)
    return start_dt, end_dt

def get_contact_url(contact):
    return f"/contact/{contact.public_id}-{contact.slug}"

def handle_checkout_completed(session):
    customer_id = session.get("customer")
    email = session.get("customer_details", {}).get("email")
    amount_total = session.get("amount_total", 0) / 100  # cents → dollars

    subscription_id = session.get("subscription")
    payment_intent_id = session.get("payment_intent")

    is_subscription = bool(subscription_id)

    setup_intent_id = None

    # If subscription exists, fetch setup intent
    if subscription_id:
        subscription = stripe.Subscription.retrieve(subscription_id)
        setup_intent_id = subscription.get("pending_setup_intent")

    # -------------------------------
    # UPSERT LOGIC (EMAIL UNIQUE)
    # -------------------------------
    PaymentBilling.objects.update_or_create(
        email=email,
        defaults={
            "amount": amount_total,
            "stripe_customer_id": customer_id,
            "stripe_subscription_id": subscription_id if is_subscription else None,
            "set_up_intent_id": setup_intent_id if is_subscription else None,
            "payment_intent_id": payment_intent_id if not is_subscription else None,
            "is_subscription": is_subscription,
        }
    )

    # Retrieve payment intent to get payment method
    pi = stripe.PaymentIntent.retrieve(payment_intent_id)
    payment_method_id = pi.payment_method

    # Get total from metadata
    total_amount = float(session["metadata"].get("total_amount", 0))
    amount_paid = session.get("amount_total", 0) / 100
    remaining_amount = total_amount - amount_paid

    if remaining_amount != 0:

        # Save order in DB
        Order.objects.update_or_create(
            email=email,
            defaults={
                "stripe_customer_id": customer_id,
                "stripe_payment_method_id": payment_method_id,
                "total_amount": total_amount,
                "deposit_amount": amount_paid,
                "remaining_amount": remaining_amount,
                "deposit_paid": True,
                "remaining_paid": False,
                # "auto_charge_date": timezone.now() + timedelta(days=15),
                "auto_charge_date": timezone.now() + timedelta(hours=12),
                "status": "deposit_paid"
            }
        )

def calculate_weekly_growth(user):
    now = timezone.now()

    current_week_start = now - timedelta(days=7)
    previous_week_start = now - timedelta(days=14)

    current_week_count = ProfileVisit.objects.filter(
        fk_user=user,
        timestamp__gte=current_week_start
    ).count()

    previous_week_count = ProfileVisit.objects.filter(
        fk_user=user,
        timestamp__gte=previous_week_start,
        timestamp__lt=current_week_start
    ).count()
    print(" percentage: ",current_week_count, previous_week_count)

    if previous_week_count == 0:
        if current_week_count > 0:
            return 100, current_week_count
        return 0, 0


    percentage = ((current_week_count - previous_week_count) / previous_week_count) * 100

    return round(percentage), current_week_count

def handle_partial_checkout_completed(session):
    customer_id = session.get("customer")
    email = session.get("customer_details", {}).get("email")
    payment_intent_id = session.get("payment_intent")

    # Retrieve payment intent to get payment method
    pi = stripe.PaymentIntent.retrieve(payment_intent_id)
    payment_method_id = pi.payment_method

    # Get total from metadata
    total_amount = float(session["metadata"].get("total_amount", 0))
    amount_paid = session.get("amount_total", 0) / 100
    remaining_amount = total_amount - amount_paid

    if remaining_amount == 0:
        return False, None

    # Save order in DB
    order, created = Order.objects.update_or_create(
        email=email,
        defaults={
            "stripe_customer_id": customer_id,
            "stripe_payment_method_id": payment_method_id,
            "total_amount": total_amount,
            "deposit_amount": amount_paid,
            "remaining_amount": remaining_amount,
            "deposit_paid": True,
            "remaining_paid": False,
            # "auto_charge_date": timezone.now() + timedelta(days=15),
            "auto_charge_date": timezone.now() + timedelta(hours=12),
            "status": "deposit_paid"
        }
    )
    return order, created

def get_google_headers(user):
    return {
        "Authorization": f"Bearer {user.google_access_token}",
        "Content-Type": "application/json"
    }


import base64

import base64
import re

def decode_body(payload):
    # clean text

    def clean_text(text):
        if not text:
            return ""
        # Normalize unicode (fancy fonts -> normal)
        text = unicodedata.normalize("NFKD", text)
        # Convert to ASCII only
        text = text.encode("ascii", "ignore").decode("ascii")
        # Keep only safe filename chars
        text = re.sub(r"[^A-Za-z0-9._ -]", "", text)
        # Remove extra spaces
        text = re.sub(r"\s+", " ", text).strip()
        return "".join(c for c in text if ord(c) <= 0xFFFF)

    # ✅ If already plain text/string
    if isinstance(payload, str):
        return clean_text(payload)

    # ✅ If invalid/empty
    if not payload or not isinstance(payload, dict):
        return ""

    # Recursive extractor
    def extract(parts):
        for part in parts:
            mime = part.get("mimeType", "")
            body = part.get("body", {}).get("data")

            # Prefer plain text
            if mime == "text/plain" and body:
                return base64.urlsafe_b64decode(body).decode(
                    "utf-8",
                    errors="ignore"
                )

            # Fallback to HTML
            if mime == "text/html" and body:
                html = base64.urlsafe_b64decode(body).decode(
                    "utf-8",
                    errors="ignore"
                )

                # Strip HTML tags
                clean = re.sub("<[^<]+?>", "", html)
                return clean

            # Nested parts
            if "parts" in part:
                result = extract(part["parts"])
                if result:
                    return result

        return ""

    # Try multipart body
    data = extract(payload.get("parts", []))

    # Fallback direct body
    if not data:
        data = payload.get("body", {}).get("data")

        if data:
            return base64.urlsafe_b64decode(data).decode(
                "utf-8",
                errors="ignore"
            )

    return data or ""

def resolve_contact(user, email, name, source, created_from):
    contact = Contact.objects.filter(email=email, owner=user).first()

    if contact:
        return contact, None

    potential, _ = PotentialContact.objects.get_or_create(
        owner=user,
        email=email,
        defaults={
            "name": name,
            "source": source,
            "created_from": created_from,
        }
    )
    return None, potential

# def sync_google_emails(user):
#     url = "https://gmail.googleapis.com/gmail/v1/users/me/messages"
#     params = {
#         "maxResults": 20,
#         "q": "newer_than:7d"
#     }
# 
#     res = requests.get(url, headers=get_google_headers(user), params=params)
# 
#     if res.status_code != 200:
#         print("Gmail fetch error", res.text)
#         return
# 
#     messages = res.json().get("messages", [])
# 
#     for msg in messages:
#         msg_id = msg["id"]
# 
#         msg_url = f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{msg_id}"
#         msg_res = requests.get(msg_url, headers=get_google_headers(user))
# 
#         if msg_res.status_code != 200:
#             continue
# 
#         payload = msg_res.json()
#         headers = payload.get("payload", {}).get("headers", [])
#         thread_id = payload.get("threadId")
#         label_ids = payload.get("labelIds", [])
# 
#         sender_email, sender_name, subject = None, None, ""
# 
#         for h in headers:
#             if h["name"] == "From":
#                 from_value = h["value"]
#                 if "<" in from_value:
#                     sender_name = from_value.split("<")[0].strip()
#                     sender_email = from_value.split("<")[1].replace(">", "").strip()
#                 else:
#                     sender_email = from_value
# 
#             if h["name"] == "Subject":
#                 # subject = h["value"]
#                 subject = h["value"]
# 
# 
#         if not sender_email:
#             continue
#         if not sender_name:
#             sender_name = sender_email
# 
#         is_read = "UNREAD" not in label_ids
#         is_archived = "INBOX" not in label_ids
#         is_deleted = "TRASH" in label_ids
# 
#         # contact_obj = None
#         # potential_contact_obj = None
#         # contact = Contact.objects.filter(email=sender_email, owner=user).first()
#         # if contact:
#         #     contact_obj = contact
#         # else:
#         #     potential_contact_obj, _ = PotentialContact.objects.get_or_create(
#         #         owner=user,
#         #         email=sender_email,
#         #         defaults={
#         #             "name": sender_name,
#         #             "source": "gmail",
#         #             "created_from": "email",
#         #         }
#         #     )
#         contact_obj, potential_contact_obj = resolve_contact(user, sender_email, sender_name, "gmail", "email")
# 
#         # ✅ Decode email body
#         # Inside sync_outlook_emails
#         subject = remove_emoji(subject)
#         body = remove_emoji(decode_body(payload.get("payload", {})))
#         print(f"subject: {subject}\n, body: {body}")
# 
# 
#         # body = payload.get("payload", {})
#         # ✅ Create / Update Email
#         # ✅ Thread handling
#         thread, _ = Thread.objects.get_or_create(
#             fk_user=user,
#             thread_id=thread_id,
#             defaults={
#                 "contact": contact_obj,
#                 "potential_contact": potential_contact_obj
#             }
#         )
# 
#         email_obj, created = Email.objects.update_or_create(
#             external_id=msg_id,
#             defaults={
#                 "fk_user": user,
#                 "subject": subject,
#                 "body": body,
#                 "fk_thread": thread,
#                 "from_email": sender_email,
#                 "is_read": is_read,
#                 "is_archived": is_archived,
#                 "is_deleted": is_deleted,
#                 "provider": "gmail"
#             }
#         )
# 
#         # ✅ Link email to thread
#         email_obj.thread = thread
#         email_obj.save()
# 
#         # ✅ Timeline
#         create_email_timeline(user, potential_contact_obj, contact_obj, subject, body, email_obj)



def sync_google_calendar(user):
    url = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
    params = {
        "maxResults": 20,
        "singleEvents": True,
        "orderBy": "startTime",
        "timeMin": now().isoformat()
    }

    res = requests.get(url, headers=get_google_headers(user), params=params)

    if res.status_code != 200:
        print("Calendar fetch error", res.text)
        return

    events = res.json().get("items", [])

    for event in events:
        print(event)
        event_id = event.get("id")
        event_name = event.get("summary", "Meeting")
        start_data = event.get("start", {})

        start_str = start_data.get("dateTime") or start_data.get("date")
        if not start_str:
            continue

        dt = datetime.fromisoformat(start_str.replace("Z", "+00:00"))

        if event.get("status") == "cancelled":
            Appointment.objects.filter(eventId=event_id).delete()
            continue

        appointment, created = Appointment.objects.update_or_create(
            eventId=event_id,
            defaults={
                "appointment_date": dt.date(),
                "appointment_time": dt.time() if start_data.get("dateTime") else None,
                "appointment_name": event_name,
                "timezone": start_data.get("timeZone", "UTC")
            }
        )

        AdvisorAppointment.objects.get_or_create(
            fk_appointment=appointment,
            fk_user=user
        )
        if not created:
            print("Updated existing event")


        # 2. Now handle Attendees (Potential Contacts and Timelines)
        attendees = event.get("attendees", [])
        for attendee in attendees:
            email = attendee.get("email")
            name = attendee.get("displayName", email)

            if not email or email == user.email:
                continue

            contact_obj, potential_contact_obj = resolve_contact(user, email, name, "gmail",
                                                                 "meeting")
            create_meeting_timeline(user, potential_contact_obj, contact_obj, event_name, appointment.appointment_id)


def get_outlook_headers(outlook):
    return {
        "Authorization": f"Bearer {outlook.accesstoken}",
        "Content-Type": "application/json"
    }


# def sync_outlook_emails(user, outlook):
#     url = "https://graph.microsoft.com/v1.0/me/messages?$top=20"
#     res = requests.get(url, headers=get_outlook_headers(outlook))
#
#     if res.status_code != 200:
#         print("Outlook mail error", res.text)
#         return
#
#     messages = res.json().get("value", [])
#
#     for msg in messages:
#         msg_id = msg.get("id")
#         sender = msg.get("from", {}).get("emailAddress", {})
#
#         email = sender.get("address")
#         name = sender.get("name")
#         subject = msg.get("subject", "")
#         body = msg.get("body", {}).get("content", "")
#
#         if not email:
#             continue
#
#         contact, created = PotentialContact.objects.get_or_create(
#             owner=user,
#             email=email,
#             defaults={
#                 "name": name,
#                 "source": "outlook",
#                 "created_from": "email",
#             }
#         )
#
#         existing_email = Email.objects.filter(
#             fk_user=user,
#             external_id=msg_id
#         ).first()
#
#         if existing_email:
#             continue
#
#         # ✅ Save Email
#         email_obj = Email.objects.create(
#             fk_user=user,
#             subject=subject,
#             body=body,
#             external_id=msg_id
#         )
#
#         create_email_timeline(user, contact, subject, body, email_obj)

def sync_outlook_emails(user, outlook):
    url = "https://graph.microsoft.com/v1.0/me/messages?$top=20"
    res = requests.get(url, headers=get_outlook_headers(outlook))

    if res.status_code != 200:
        print("Outlook mail error", res.text)
        return

    messages = res.json().get("value", [])

    for msg in messages:
        msg_id = msg.get("id")
        sender = msg.get("from", {}).get("emailAddress", {})

        email = sender.get("address")
        name = sender.get("name")
        subject = msg.get("subject", "")
        body = msg.get("body", {}).get("content", "")
        thread_id = msg.get("conversationId")

        if not email:
            continue

        contact_obj, potential_contact_obj = resolve_contact(
            user, email, name, "outlook", "email"
        )

        # ✅ Thread handling
        thread, _ = Thread.objects.get_or_create(
            fk_user=user,
            thread_id=thread_id,
            defaults={
                "contact": contact_obj,
                "potential_contact": potential_contact_obj
            }
        )

        # 🔁 Upgrade thread if needed
        updated = False
        if contact_obj and not thread.contact:
            thread.contact = contact_obj
            thread.potential_contact = None
            updated = True

        elif potential_contact_obj and not thread.contact and not thread.potential_contact:
            thread.potential_contact = potential_contact_obj
            updated = True

        if updated:
            thread.save()

        # ✅ Email upsert
        email_obj, created = Email.objects.update_or_create(
            external_id=msg_id,
            defaults={
                "fk_user": user,
                "subject": subject,
                "body": body,
                "thread_id": thread,
                "from_email": email,
                "provider": "outlook"
            }
        )

        # ✅ Timeline
        create_email_timeline(user, potential_contact_obj, contact_obj, subject, body, email_obj)


# def sync_outlook_calendar(user, outlook):
#     url = "https://graph.microsoft.com/v1.0/me/events?$top=20"
#     res = requests.get(url, headers=get_outlook_headers(outlook))
#
#     if res.status_code != 200:
#         print("Outlook calendar error", res.text)
#         return
#
#     events = res.json().get("value", [])
#
#     for event in events:
#         attendees = event.get("attendees", [])
#         event_id = event.get("id")
#         event_name = event.get("subject", "Meeting")
#
#         for attendee in attendees:
#             email = attendee.get("emailAddress", {}).get("address")
#             name = attendee.get("emailAddress", {}).get("name")
#
#             if not email or email == user.email:
#                 continue
#
#             contact, created = PotentialContact.objects.get_or_create(
#                 owner=user,
#                 email=email,
#                 defaults={
#                     "name": name,
#                     "source": "outlook",
#                     "created_from": "meeting",
#                 }
#             )
#
#             existing_appointment = Appointment.objects.filter(
#                 eventId=event_id
#             ).first()
#
#             if existing_appointment:
#                 continue
#
#             start = event.get("start", {}).get("dateTime")
#
#             dt = datetime.fromisoformat(start.replace("Z", "+00:00"))
#
#             appointment = Appointment.objects.create(
#                 appointment_date=dt.date(),
#                 appointment_time=dt.time(),
#                 appointment_name=event.get("summary", "Meeting"),
#                 eventId=event_id,
#                 timezone=event.get("start", {}).get("timeZone", "UTC")
#             )
#             AdvisorAppointment.objects.create(
#                 fk_appointment=appointment,
#                 fk_user=user
#             )
#
#             create_meeting_timeline(user, contact, event_name, event_id)

def sync_outlook_calendar(user, outlook):
    url = "https://graph.microsoft.com/v1.0/me/events?$top=20"
    res = requests.get(url, headers=get_outlook_headers(outlook))

    if res.status_code != 200:
        print("Outlook calendar error", res.text)
        return

    events = res.json().get("value", [])

    for event in events:
        event_id = event.get("id")
        event_name = event.get("subject", "Meeting")

        start = event.get("start", {}).get("dateTime")
        if not start:
            continue

        dt = datetime.fromisoformat(start.replace("Z", "+00:00"))

        # ✅ Upsert appointment
        appointment, created = Appointment.objects.update_or_create(
            eventId=event_id,
            defaults={
                "appointment_date": dt.date(),
                "appointment_time": dt.time(),
                "appointment_name": event_name,
                "timezone": event.get("start", {}).get("timeZone", "UTC")
            }
        )

        AdvisorAppointment.objects.get_or_create(
            fk_appointment=appointment,
            fk_user=user
        )

        attendees = event.get("attendees", [])

        for attendee in attendees:
            email = attendee.get("emailAddress", {}).get("address")
            name = attendee.get("emailAddress", {}).get("name")

            if not email or email == user.email:
                continue

            contact_obj, potential_contact_obj = resolve_contact(
                user, email, name, "outlook", "meeting"
            )

            # 🔁 Upgrade existing timeline
            create_meeting_timeline(user, potential_contact_obj, contact_obj, event_name, appointment.appointment_id)

def assign_tag_to_contact(contact, pc, tag_list=None):
    from api.models import Tag, ContactTag
    from django.db.models import Max

    tags_to_apply = []

    # 1. Determine which tags to process
    if tag_list:
        # If user provided specific tags, fetch those
        tags_to_apply = Tag.objects.filter(name__in=tag_list)
    else:
        # Fallback to system tags based on 'created_from'
        tag_name = None
        if pc.created_from == "email":
            tag_name = "Email"
        elif pc.created_from == "meeting":
            tag_name = "Meeting"

        if tag_name:
            system_tag = Tag.objects.filter(name=tag_name, is_default=True).first()
            if system_tag:
                tags_to_apply = [system_tag]

    # 2. Apply the tags
    for tag in tags_to_apply:
        # Avoid duplicate tag for this contact
        if not ContactTag.objects.filter(fk_contact=contact, fk_tag=tag).exists():
            # Find next position
            last_position = ContactTag.objects.filter(
                fk_contact=contact
            ).aggregate(Max("position"))["position__max"] or 0

            ContactTag.objects.create(
                fk_contact=contact,
                fk_tag=tag,
                position=last_position + 1
            )

def create_email_timeline(user, potential_contact, contact, subject, body, email_obj=None):
    Timeline.objects.create(
        fk_user=user,
        fk_potential_contact=potential_contact,
        fk_contact=contact,
        action_type="email",
        content=f"Email received: {subject}",
        email_id=email_obj.email_id if email_obj else None
    )

def create_meeting_timeline(user, potential_contact, contact, event_name, meeting_id=None):
    timeline, created = Timeline.objects.get_or_create(
        fk_user=user,
        meeting_id=meeting_id,
        defaults={
            "fk_potential_contact": potential_contact,
            "fk_contact": contact,
            "action_type": "schedule_meeting",
            "content": f"Meeting scheduled: {event_name}"
        }
    )

    # Optional: update content if meeting name changed
    if not created and timeline.content != f"Meeting scheduled: {event_name}":
        timeline.content = f"Meeting updated: {event_name}"
        timeline.save()
