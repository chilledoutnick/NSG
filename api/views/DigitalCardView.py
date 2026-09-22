import json

from api.serializers import DigitalCardSerializer
from api.models import Contact, Tag, ContactTag
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from api.models.DigitalCard import *
from api.models import *
from api.views.Services import *
from datetime import datetime
import requests
import base64
import io
import os
from django.conf import settings
from PIL import Image

try:
    from google.cloud import vision
except ImportError:
    vision = None

try:
    from google.oauth2 import service_account
except ImportError:
    service_account = None

try:
    import google.generativeai as genai
except ImportError:
    genai = None

API_KEY = getattr(settings, "GEMINI_API_KEY", os.environ.get("GEMINI_API_KEY", ""))


def parse_contact_details(credentials, text):
    """
    Extract contact details from text using Gemini LLM.
    """
    if not API_KEY or genai is None:
        return {"notes": text}
    try:
        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = f"""
        Extract structured contact details from the following text:

        {text}

        Return the result in dictionary format with the following keys like:
        {{
        "name":"ABC"
        "email":"abc@abc.com"
        "phone":"1234567890"
        "company":"ABC"
        "designation":"abc"
        "website":"abc.in"
        }}
        Note: if any of this value is null replace it with empty string like:
        "email":""
        "phone":""
        "company":""
        "designation":""
        "website":""
        """

        response = model.generate_content(prompt)
        res = eval(response.text.split("```")[1][5:-1])
        return res
    except Exception as e:
        print("Gemini extraction error:", e)
        return {"notes": text}


def generate_vcard(contact):
    """
    Create a vCard (.vcf) file content.
    """
    vcard = f"""
BEGIN:VCARD
VERSION:3.0
N:{contact['name']};;;;
FN:{contact['name']}
EMAIL:{contact['email']}
TEL:{contact['phone']}
ORG:{contact['company']}
TITLE:{contact['designation']}
URL:{contact['website']}
END:VCARD
        """
    return vcard.strip()


class DigitalCardView(viewsets.GenericViewSet):

    @action(methods=['POST'], detail=False)
    def get_all_digital_card(self, request):
        try:
            user = get_user_from_token(request)
            if not user.is_superuser:
                return Response({'message': 'Dont have access'},
                                status=status.HTTP_401_UNAUTHORIZED)

            digital_card_obj = DigitalCard.objects.all().order_by('-created_at')[:100]
            serializer = DigitalCardSerializer(digital_card_obj, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=["POST"], detail=False)
    def vcard(self, request):
        try:
            website = request.data.get("website", "")
            username = request.data.get("username")

            if not username:
                return Response(
                    {"message": "Username is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # 🔹 Step 1: Resolve Owner (User or Profile)
            user = User.objects.filter(username=username).first()
            profile = None

            if user:
                name = user.name
                company = getattr(user, "company", "")
                designation = getattr(user, "designation", "")
                about = getattr(user, "about", "")
                profile_picture = getattr(user, "profile_picture", None)
                linkedin = getattr(user, "linkedin", "")
                facebook = getattr(user, "facebook", "")
                instagram = getattr(user, "instagram", "")
                twitter = getattr(user, "twitter", "")
                youtube = getattr(user, "youtube", "")

                contact_infos = user.main_contact_infos.all()

            else:
                profile = Profiles.objects.filter(username=username).first()

                if not profile:
                    return Response(
                        {"message": "Profile not found"},
                        status=status.HTTP_404_NOT_FOUND
                    )

                user = profile.fk_user
                name = profile.name
                company = getattr(profile, "company", "")
                designation = getattr(profile, "designation", "")
                about = getattr(profile, "about", "")
                profile_picture = getattr(profile, "profile_picture", None)
                linkedin = getattr(profile, "linkedin", "")
                facebook = getattr(profile, "facebook", "")
                instagram = getattr(profile, "instagram", "")
                twitter = getattr(profile, "twitter", "")
                youtube = getattr(profile, "youtube", "")

                contact_infos = profile.contact_infos.all()

            # 🔹 Step 2: Name Handling (Safe Split)
            name_parts = name.split() if name else []
            first_name = name_parts[0] if name_parts else ""
            last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

            # 🔹 Step 3: Fetch Profile Picture
            profile_picture_data = ""
            if profile_picture:
                try:
                    response = requests.get(profile_picture.url, timeout=5)
                    if response.status_code == 200:
                        profile_picture_data = base64.b64encode(
                            response.content
                        ).decode("utf-8")
                except Exception as e:
                    pass  # Fail silently if image fetch fails

            # 🔹 Step 4: Start vCard
            vcard_data = (
                "BEGIN:VCARD\n"
                "VERSION:3.0\n"
                f"N:{last_name};{first_name};;;\n"
                f"FN:{name}\n"
            )

            # 🔹 Step 5: Add Multiple Contact Infos
            if contact_infos.exists():
                for contact in contact_infos:

                    if contact.contact_type == "phone":
                        vcard_data += (
                            f"TEL;TYPE={contact.label},VOICE:"
                            f"{contact.value}\n"
                        )

                    elif contact.contact_type == "email":
                        vcard_data += (
                            f"EMAIL;TYPE={contact.label}:"
                            f"{contact.value}\n"
                        )

            else:
                # Fallback to main user email/phone
                if user.email:
                    vcard_data += f"EMAIL;TYPE=primary:{user.email}\n"

                if hasattr(user, "phone") and user.phone:
                    vcard_data += (
                        f"TEL;TYPE=primary,VOICE:{user.phone}\n"
                    )

            # 🔹 Step 6: Organization & Basic Info
            if company:
                vcard_data += f"ORG:{company}\n"

            if designation:
                vcard_data += f"TITLE:{designation}\n"

            if about:
                vcard_data += f"NOTE:{about}\n"

            if website:
                vcard_data += f"URL:{website}\n"

            # 🔹 Step 7: Social Links
            if linkedin:
                vcard_data += f"URL;TYPE=LinkedIn:{linkedin}\n"

            if facebook:
                vcard_data += f"URL;TYPE=Facebook:{facebook}\n"

            if instagram:
                vcard_data += f"URL;TYPE=Instagram:{instagram}\n"

            if twitter:
                vcard_data += f"URL;TYPE=Twitter:{twitter}\n"

            if youtube:
                vcard_data += f"URL;TYPE=YouTube:{youtube}\n"

            # 🔹 Step 8: Add Profile Picture
            if profile_picture_data:
                vcard_data += (
                    "PHOTO;ENCODING=BASE64;TYPE=JPEG:"
                    f"{profile_picture_data}\n"
                )

            vcard_data += "END:VCARD"

            # 🔹 Step 9: Return File
            response = HttpResponse(
                vcard_data.strip(),
                content_type="text/vcard"
            )

            filename = name.replace(" ", "_") if name else "contact"
            response["Content-Disposition"] = (
                f'attachment; filename="{filename}.vcf"'
            )

            return response

        except Exception as e:
            return Response(
                {"message": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        # try:
        #     website = request.data.get("website", "")
        #
        #     username = request.data.get('username')
        #     if not username:
        #         return Response({"message": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
        #     user = User.objects.filter(username=username).first()
        #
        #     if user:
        #         name = user.username
        #         company = user.company
        #         designation = user.designation
        #         about = user.about
        #         profile_picture = user.profile_picture
        #         linkedin = user.linkedin
        #         facebook = user.facebook
        #         instagram = user.instagram
        #         twitter = user.twitter
        #         youtube = user.youtube
        #
        #     else:
        #
        #         profile = Profiles.objects.filter(username=username).first()
        #         if not profile:
        #             return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
        #         user = profile.fk_user
        #         name = profile.username
        #         company = profile.company
        #         designation = profile.designation
        #         about = profile.about
        #         profile_picture = profile.profile_picture
        #         linkedin = profile.linkedin
        #         facebook = profile.facebook
        #         instagram = profile.instagram
        #         twitter = profile.twitter
        #         youtube = profile.youtube
        #
        #
        #
        #     name_parts = name.split()
        #     first_name = name_parts[0] if len(name_parts) >= 1 else ""
        #     last_name = name_parts[1] if len(name_parts) > 1 else ""
        #
        #     # Fetch profile picture
        #     profile_picture_url = profile_picture.url if profile_picture else ""
        #     profile_picture_data = ""
        #     if profile_picture_url:
        #         try:
        #             response = requests.get(profile_picture_url)
        #             if response.status_code == 200:
        #                 profile_picture_data = base64.b64encode(response.content).decode('utf-8')
        #         except Exception as e:
        #             print(f"Error fetching profile picture: {e}")
        #
        #     # Create the vCard content
        #     vcard_data = (
        #         "BEGIN:VCARD\n"
        #         "VERSION:3.0\n"
        #         f"N:{last_name};{first_name};;;\n"
        #         f"FN:{name}\n"
        #         f"EMAIL:{user.email}\n"
        #         f"TEL:{user.phone}\n"
        #         f"ORG:{company}\n"
        #         f"TITLE:{designation}\n"
        #         f"NOTE:{about}\n"
        #         f"URL:{website}\n"
        #     )
        #
        #
        #     # Add social links with standard URL fields
        #     if linkedin:
        #         vcard_data += f"URL;TYPE=LinkedIn:{linkedin}\n"
        #     if facebook:
        #         vcard_data += f"URL;TYPE=Facebook:{facebook}\n"
        #     if instagram:
        #         vcard_data += f"URL;TYPE=Instagram:{instagram}\n"
        #     if twitter:
        #         vcard_data += f"URL;TYPE=Twitter:{twitter}\n"
        #     if youtube:
        #         vcard_data += f"URL;TYPE=YouTube:{youtube}\n"
        #
        #     # Add profile picture if available
        #     if profile_picture_data:
        #         vcard_data += f"PHOTO;ENCODING=BASE64;TYPE=JPEG:{profile_picture_data}\n"
        #
        #     vcard_data += "END:VCARD"
        #
        #     # Create the response
        #     response = HttpResponse(vcard_data.strip(), content_type='text/vcard')
        #     response['Content-Disposition'] = f'attachment; filename="{name}.vcf"'
        #     return response
        #
        # except Exception as e:
        #     return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def email_digital_card(self, request):
        try:
            user = get_user_from_token(request)
            sender_name = request.data['sender_name']
            profession = request.data['profession']
            color = request.data.get('color', 'black')
            message = request.data.get('message', "")
            user_email = request.data.get('user_email', "").strip()

            try:
                validate_email(user_email)
            except ValidationError:
                return Response({'message': 'Invalid email format'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                contact = Contact.objects.get(email=user_email, owner=user)

                data = {
                    'name': sender_name,
                    'comment_media': message,
                    "contact_id": contact.id,
                    'email': user_email,
                }

                card_email(user, color, profession, user_email, message, sender_name)

                return Response({"message": "Email Send", "data": data}, status=status.HTTP_200_OK)

            except Contact.DoesNotExist:
                digital_card_email = DigitalCardEmail.objects.create(
                    sender_name=sender_name,
                    message=message,
                    user_email=user_email,
                    timestamp=datetime.now(),
                    fk_user=user
                )

                contact = Contact.objects.create(
                    name=sender_name,
                    email=user_email,
                    owner=user,
                    date_added=datetime.now(),
                    work=profession if profession else ""
                )
                tag = Tag.objects.get(name="Business card")
                ContactTag.objects.create(fk_contact=contact, fk_tag=tag,
                                          position=1)
                contact.generated_text = f"{contact.name} was added to contacts on {contact.date_added.strftime('%d %B %Y')}"

                contact.save()

                data = {
                    'name': sender_name,
                    'comment_media': message,
                    "contact_id": contact.id,
                    'digital_card_email_id': digital_card_email.id,
                    'email': user_email,
                }

                card_email(user, color, profession, user_email, message, sender_name)

                return Response({"message": "Email Send", "data": data}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def email_business_card(self, request):
        try:
            user = get_user_from_token(request)
            receiver_name = request.data['receiver_name']
            message = request.data.get('message', "")
            receiver_email = request.data.get('receiver_email', "").strip()
            try:
                validate_email(receiver_email)
            except ValidationError:
                return Response({'message': 'Invalid email format'},
                                status=status.HTTP_400_BAD_REQUEST)

            try:
                contact = Contact.objects.get(email=receiver_email, owner=user)

                data = {
                    'name': receiver_name,
                    'comment_media': message,
                    "contact_id": contact.id,
                    'email': receiver_email,
                }

                business_card_email(user, receiver_email, message, receiver_name)

                return Response({"message": "Email Send", "data": data}, status=status.HTTP_200_OK)
            except Contact.DoesNotExist:

                business_card = BusinessCardEmail.objects.create(
                    receiver_name=receiver_name,
                    message=message,
                    receiver_email=receiver_email,
                    timestamp=datetime.now(),
                    fk_user=user

                )
                contact = Contact.objects.create(
                    name=receiver_name,
                    email=receiver_email,
                    owner=user,
                    date_added=datetime.now()
                )
                tag = Tag.objects.get(name="Business card")
                ContactTag.objects.create(fk_contact=contact, fk_tag=tag,
                                          position=1)
                contact.generated_text = f"{contact.name} was added to contacts on {contact.date_added.strftime('%d %B %Y')}"

                contact.save()

                data = {
                    'name': receiver_name,
                    'comment_media': message,
                    "contact_id": contact.id,
                    'digital_card_email_id': business_card.id,
                    'email': receiver_email,
                }

                business_card_email(user, receiver_email, message, receiver_name)

            return Response({"message": "Email Send", "data": data}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"message": "Email didn't send. Please provide valid app password",
                             "error_message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def receive_card(self, request):
        try:
            receiver_email = request.data.get('receiver_email', "").strip()
            try:
                validate_email(receiver_email)
            except ValidationError:
                return Response({'message': 'Invalid email format'},
                                status=status.HTTP_400_BAD_REQUEST)

            receiver_name = request.data.get('receiver_name', "")

            username = request.data.get('username')
            if not username:
                return Response({"message": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
            user = User.objects.filter(username=username).first()

            if not user:

                profile = Profiles.objects.filter(username=username).first()
                if not profile:
                    return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
                user = profile.fk_user


            try:
                contact = Contact.objects.get(email=receiver_email, owner=user)

                data = {
                    "contact_id": contact.id,
                    'email': receiver_email,
                }

                receive_card_email(user, receiver_email)

                return Response({"message": "Email Send", "data": data}, status=status.HTTP_200_OK)
            except Contact.DoesNotExist:
                receive_card = ReceiveCardEmail.objects.create(
                    receiver_email=receiver_email,
                    timestamp=datetime.now(),
                    fk_user=user

                )
                contact = Contact.objects.create(
                    name=receiver_name,
                    email=receiver_email,
                    owner=user,
                    date_added=datetime.now()
                )
                tag = Tag.objects.get(name="Business card")
                ContactTag.objects.create(fk_contact=contact, fk_tag=tag,
                                          position=1)
                contact.generated_text = f"{contact.name} was added to contacts on {contact.date_added.strftime('%d %B %Y')}"

                contact.save()

                data = {
                    "contact_id": contact.id,
                    'digital_card_email_id': receive_card.id,
                    'email': receiver_email,
                }
                receive_card_email(user, receiver_email)

            return Response({"message": "Email Send", "data": data}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def contact_vcard(self, request):
        contact_id = request.data.get("contact_id")
        if not contact_id:
            return Response({"message": "Contact ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve the contact object
        contact = Contact.objects.filter(id=contact_id).first()
        if not contact:
            return Response({"message": "Contact not found"}, status=status.HTTP_404_NOT_FOUND)

        # Split name into first and last names
        name_parts = contact.name.split() if contact.name else ["", ""]
        first_name = name_parts[0]
        last_name = name_parts[-1] if len(name_parts) > 1 else ""

        # Prepare vCard fields
        phone = contact.phone or ""
        additional_phone = contact.additional_phone or ""
        email = contact.email or ""
        additional_email = contact.additional_email or ""
        company = contact.company or ""
        designation = contact.designation or ""
        address = contact.address or ""
        birthday = contact.birthday.strftime("%Y-%m-%d") if contact.birthday else ""
        profile_picture_url = contact.image.url if contact.image else ""
        social_links = contact.social_links or {}
        about = contact.about or ""  # New about field
        generated_text = contact.generated_text or ""  # Generated text field

        # Sanitize address
        sanitized_address = address.replace(",", "\\,").replace("\n", "\\n") if address else ""

        # Initialize vCard data
        vcard_data = f"""
BEGIN:VCARD
VERSION:3.0
N:{last_name};{first_name};;;
FN:{contact.name or ''}
"""

        # Add contact details
        if phone:
            vcard_data += f"TEL;TYPE=work,VOICE:{phone}\n"
        if additional_phone:
            vcard_data += f"TEL;TYPE=home,VOICE:{additional_phone}\n"
        if email:
            vcard_data += f"EMAIL;TYPE=work:{email}\n"
        if additional_email:
            vcard_data += f"EMAIL;TYPE=home:{additional_email}\n"
        if company:
            vcard_data += f"ORG:{company}\n"
        if designation:
            vcard_data += f"TITLE:{designation}\n"
        if sanitized_address:
            vcard_data += f"ADR;TYPE=WORK,PREF:;;{sanitized_address}\n"
        if birthday:
            vcard_data += f"BDAY:{birthday}\n"
        if about:
            vcard_data += f"NOTE:{about}\n{generated_text}\n"  # Add the about section
        if generated_text:
            vcard_data += f"X-GENERATED-TEXT:{generated_text}\n"  # Add the generated_text section

        # Add profile picture (Base64 encoded)
        if profile_picture_url:
            try:
                response = requests.get(profile_picture_url, timeout=5)
                if response.status_code == 200 and response.headers.get("Content-Type", "").startswith("image"):
                    profile_picture_data = base64.b64encode(response.content).decode('utf-8')
                    mime_type = response.headers.get("Content-Type", "image/jpeg")
                    vcard_data += f"PHOTO;ENCODING=BASE64;TYPE={mime_type}:{profile_picture_data}\n"
            except requests.RequestException:
                print("error:", requests.RequestException)
                pass

        # Add social links
        for link in social_links:
            if link:
                vcard_data += f"X-SOCIALPROFILE:{link}\n"

        # Finalize vCard
        vcard_data += "END:VCARD"

        # Create and return the response
        response = HttpResponse(vcard_data.strip(), content_type='text/vcard')
        filename = contact.name.replace(" ", "_") if contact.name else "contact"
        response['Content-Disposition'] = f'attachment; filename="{filename}.vcf"'
        return response

    @action(methods=["POST"], detail=False)
    def extract_contact(self, request):
        try:
            # Get the image from request
            image_file = request.FILES.get("image")
            is_demo = request.data.get("is_demo", "true").lower() == "true"
            uri = "https://storage.googleapis.com/nsg-crm-storage-public/media/webp_images/NSG_business_Card.png" if is_demo else None
            if not image_file and not is_demo:
                uri = request.data.get("uri")
                # return Response({'message': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

            # Load credentials from the JSON file
            json_path = os.path.join(os.path.dirname(__file__), "../../effective-sonar-415015-c27f2957a4d7.json")
            if service_account is None or vision is None or not os.path.exists(json_path):
                return Response(
                    {'message': 'Google Vision OCR service is not configured or credentials file is missing.'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            with open(json_path) as f:
                GOOGLE_CREDENTIALS = json.load(f)

            credentials = service_account.Credentials.from_service_account_info(GOOGLE_CREDENTIALS)

            # Use Google Vision API for OCR
            client = vision.ImageAnnotatorClient(credentials=credentials)
            if not uri:
                image_content = image_file.read()
                # image_base64 = base64.b64encode(image_content).decode("utf-8")
                image = vision.Image(content=image_content)
            else:
                image = vision.Image()
                image.source.image_uri = uri
            response = client.text_detection(image=image)
            texts = response.text_annotations
            if not texts:
                return Response({'message': 'No text detected'}, status=status.HTTP_400_BAD_REQUEST)

            extracted_text = texts[0].description
            contact_data = parse_contact_details(credentials, extracted_text)

            # Generate VCF file
            vcard_content = generate_vcard(contact_data)

            # Encode VCF to base64
            vcard_base64 = base64.b64encode(vcard_content.encode()).decode()

            return Response({
                "contact_data": contact_data,
                "vcf_file": vcard_base64,
                "file_name": "contact.vcf"
            })

        except IOError as e:
            return Response({'message': str(e)}, status=500)