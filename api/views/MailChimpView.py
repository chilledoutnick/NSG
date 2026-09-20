from advisorapp.settings import MAILCHIMP_API_KEY, MAILCHIMP_AUDIENCE_ID, MAILCHIMP_DC
from rest_framework.decorators import action
from django.http import JsonResponse
from rest_framework import viewsets
import requests
import hashlib

class AddContactView(viewsets.GenericViewSet):
    @action(methods=["POST"], detail=False)
    def post_email(self, request):
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        email = request.data['email'].strip()
        tags=request.data['tags']
        if not email:
            return JsonResponse({'error': 'Email is required'}, status=400)
        
        if not isinstance(tags, list):
            tags = [tags]
        

        # Ensure that MAILCHIMP_AUDIENCE_ID and mailchimp_dc are properly defined in settings
        if not MAILCHIMP_AUDIENCE_ID or not MAILCHIMP_DC:
            return JsonResponse({'error': 'Mailchimp settings are not configured correctly'}, status=500)

        # Mailchimp API endpoint
        #url = f'https://{MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/{MAILCHIMP_AUDIENCE_ID}/members/'

        # Calculate the MD5 hash of the email address
        email_hash = hashlib.md5(email.lower().encode('utf-8')).hexdigest()

        # Mailchimp API endpoint for a specific member
        member_url = f'https://{MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/{MAILCHIMP_AUDIENCE_ID}/members/{email_hash}'

        # Make the GET request to check if the member exists
        auth = ('apikey', MAILCHIMP_API_KEY)
        response = requests.get(member_url, auth=auth)

        # Payload to be sent to Mailchimp
        data = {
            "email_address": email,
            "status": "subscribed",
            "merge_fields": {
                "FNAME": first_name,
                "LNAME": last_name
            }
        }

        if response.status_code == 200:
            # Member exists, update them with PATCH
            response = requests.patch(member_url, auth=auth, json=data)
            if response.status_code != 200:
                return JsonResponse({'error': 'Failed to update contact', 'details': response.json()}, status=response.status_code)
        elif response.status_code == 404:
            # Member does not exist, create them with POST
            add_member_url = f'https://{MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/{MAILCHIMP_AUDIENCE_ID}/members/'
            response = requests.post(add_member_url, auth=auth, json=data)
            if response.status_code != 200:
                return JsonResponse({'error': 'Failed to add contact', 'details': response.json()}, status=response.status_code)
        else:
            return JsonResponse({'error': 'Failed to check contact status', 'details': response.json()}, status=response.status_code)

        # Add/Update tags
        if tags:
            tags_payload = {
                "tags": [{"name": tag, "status": "active"} for tag in tags]
            }
            tags_url = f'https://{MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/{MAILCHIMP_AUDIENCE_ID}/members/{email_hash}/tags'
            tags_response = requests.post(tags_url, auth=auth, json=tags_payload)
            if tags_response.status_code != 204:
                return JsonResponse({'error': 'Failed to update tags', 'details': tags_response.json()}, status=tags_response.status_code)

        return JsonResponse({'message': 'Contact added/updated successfully'}, status=200)