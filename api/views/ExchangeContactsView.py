from api.views.Services import get_user_from_token, send_exchange_contact_email, validate_phone, alphabet_color
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from django.core.paginator import Paginator
from api.models import *
import datetime


class ExchangeContactsView(viewsets.GenericViewSet):

    @action(methods=['POST'], detail=False)
    def get_exchange_contact_log(self, request):
        try:
            user = get_user_from_token(request)
            page_size = request.data['page_size']
            page_number = request.data['page_number']
            exchange_contact = ExchangeContacts.objects.filter(fk_user=user).order_by('-id')
            paginator = Paginator(exchange_contact, per_page=page_size)
            page_no = request.query_params.get('page', page_number)
            page_obj = paginator.get_page(page_no)
            data = {}
            contact_data = []
            for contact in page_obj:
                contact_data.append({
                    'exchange_contact_id': contact.exchange_contact_id,
                    'email': contact.email,
                    'name': contact.name,
                    'phone': contact.phone,
                    'social_media': contact.social_media,
                    'timestamp': contact.timestamp,
                })
                data["total_data"] = len(exchange_contact)
                data["total_pages"] = paginator.num_pages
                data["contacts_data"] = contact_data

            return Response(data=data)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def create_exchange_contact(self, request):
        try:
            username = request.data.get('username')
            if not username:
                return Response({"message": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
            user = User.objects.filter(username=username).first()

            if user:
                user_name = user.name
                username = user.username
                company = user.company
            else:
                profile = Profiles.objects.filter(username=username).first()
                if not profile:
                    return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
                user = profile.fk_user
                user_name = profile.name
                username = profile.username
                company = profile.company

            contact_name = request.data['name']
            email = request.data['email'].strip()
            phone = request.data.get('phone', "")

            try:
                phone = validate_phone(phone)
            except ValidationError as e:
                return Response({'message': e.message},
                                status=status.HTTP_400_BAD_REQUEST)

            try:
                validate_email(email)
            except ValidationError:
                return Response({'message': 'Invalid email format'}, status=status.HTTP_400_BAD_REQUEST)

            send_exchange_contact_email(user, email, contact_name, user_name, username, company)
            exchange_contact = ExchangeContacts.objects.filter(email=email, fk_user=user).first()
            # print(exchange_contact)user
            if exchange_contact:
                return Response([{"message": "You already shared contact with this person"}], status=status.HTTP_200_OK)
            contact = Contact.objects.filter(email=email, owner=user).first()
            if contact:
                return Response([{"message": "You already shared contact with this person"}], status=status.HTTP_200_OK)

            exchange_contact = ExchangeContacts.objects.create(
                fk_user=user,
                name=contact_name,
                email=email,
                phone=phone,
                timestamp=datetime.datetime.now()
            )

            contact = Contact.objects.create(
                name=contact_name,
                email=email,
                owner=user,
                date_added=datetime.datetime.now(),
                phone=phone,
                pfp_color=alphabet_color(contact_name.strip()[0].upper()),
            )
            tag_obj = Tag.objects.get(name="Business card")
            ContactTag.objects.create(fk_contact=contact, fk_tag=tag_obj,
                                      position=1)
            contact.generated_text = f"{contact.name} was added to contacts on " \
                                     f"{contact.date_added.strftime('%d %B %Y')}"

            contact.save()
            
            note = NoteReminder.objects.create(
                fk_contact=contact,
                fk_user=user,
                note_text=f"You added {contact.name} in your Contact",
                note_status=1,
                editable=0

            )
            Timeline.objects.create(
                action_type="note",
                content="contact",
                fk_user=user,
                fk_contact=contact,
                note_id=note.id
            )
            # schedule_user_notification(
            #     user_id=user.id,
            #     title="New Contact from Business Card",
            #     body="You've just added a contact from a business card. Tag and prioritize them for better follow-up!",
            #     countdown=2
            # )

            data = {
                'name': contact_name,
                'phone': phone,
                "contact_id": contact.id,
                'exchange_contact_id': exchange_contact.exchange_contact_id,
                'email': email,
            }
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def validate_and_respond(self, request):
        email = request.data.get('email', "").strip()

        print(f"Email to validate: {email}")
        try:
            validate_email(email)
            return Response({'message': 'Valid email format'}, status=status.HTTP_200_OK)
        except ValidationError:
            return Response({'message': 'Invalid email format'}, status=status.HTTP_400_BAD_REQUEST)
