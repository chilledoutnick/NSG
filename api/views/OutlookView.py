from datetime import datetime, timedelta, timezone
from venv import create

from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
import requests
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.decorators import action

from advisorapp.settings import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, OUTLOOK_CLIENT_ID, OUTLOOK_CLIENT_SECRET
from api.models import *
from api.models.Outlook import Outlook
from api.views.Services import get_user_from_token, sync_outlook_emails, sync_outlook_calendar
from django.utils.timezone import now

OUTLOOK_SCOPE =  'openid profile email User.Read Mail.Send offline_access Calendars.ReadWrite  Mail.Read Contacts.Read'
def save_outlook_token(user, token_data):
    outlook, _ = Outlook.objects.update_or_create(
        fk_user=user,
        defaults={
            'accesstoken': token_data['access_token'],
            'refreshtoken': token_data.get('refresh_token', ''),
            'create_time': datetime.now(),
            'expiry_time': datetime.now(timezone.utc) + timedelta(seconds=token_data.get('expires_in', 0)),
        }
    )
    sync_outlook_emails(user, outlook)
    sync_outlook_calendar(user, outlook)

class OutlookView(viewsets.GenericViewSet):
    @action(methods=['POST'], detail=False)
    def outlookToken(self, request):
        user = get_user_from_token(request)
        code = request.data['code']
        redirect_uri = request.data['redirect_uri']

        if not code or not redirect_uri:
            return JsonResponse({'error': 'Missing required fields'}, status=400)

        # Azure AD Token endpoint
        token_url = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'

        # Request body for the token exchange
        payload = {
            'client_id': OUTLOOK_CLIENT_ID,
            'scope': 'User.Read Mail.Send offline_access Calendars.ReadWrite',
            'code': code,
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code',
            'client_secret': OUTLOOK_CLIENT_SECRET,
        }

        # Send the request to Azure
        try:
            response = requests.post(token_url, data=payload)
            token_data = response.json()
            print (token_data)
            token, created = Outlook.objects.update_or_create(
            fk_user=user,  
            defaults={
                'accesstoken': token_data['access_token'],
                'refreshtoken': token_data.get('refresh_token', ''),
                'create_time': datetime.now(),
                'expiry_time': datetime.now(timezone.utc) + timedelta(seconds=token_data.get('expires_in', 0)),
            }
        )
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
        

    @action(methods=['POST'], detail=False)
    def get_token(self, request,user):
        try:
            response_data = {
                'google_access_token': '',
                'outlook_access_token': '',
                'caldav_user': False  # Default to False
            }

            # Handle Google Token
            google_refresh_token = user.google_refresh_token
            if google_refresh_token:
                if user.is_expired():
                    new_token = self.google_refresh_token(google_refresh_token)
                    if new_token:
                        user.google_access_token = new_token['access_token']
                        user.google_refresh_token = new_token.get('refresh_token', google_refresh_token)
                        user.google_token_expiry_time = datetime.now(timezone.utc) + timedelta(seconds=new_token['expires_in'])
                        user.save()
                    else:
                        return JsonResponse({'error': 'Failed to refresh Google token'}, status=400)
                response_data['google_access_token'] = user.google_access_token

            # Handle Outlook Token
            try:
                outlook_token_entry = Outlook.objects.get(fk_user=user)
                if outlook_token_entry.is_expired():
                    new_token_data = self.refresh_token(outlook_token_entry.refreshtoken)
                    if new_token_data:
                        outlook_token_entry.accesstoken = new_token_data['access_token']
                        outlook_token_entry.refreshtoken = new_token_data.get('refresh_token', outlook_token_entry.refreshtoken)
                        outlook_token_entry.expiry_time = datetime.now(timezone.utc) + timedelta(seconds=new_token_data['expires_in'])
                        outlook_token_entry.save()
                    else:
                        return JsonResponse({'error': 'Failed to refresh Outlook token'}, status=400)
                response_data['outlook_access_token'] = outlook_token_entry.accesstoken
            except Outlook.DoesNotExist:
                # Outlook token does not exist, proceed without it
                pass

            # Check if the user is a CalDAV user
            try:
                caldav_user = CalDav.objects.get(fk_user=user)
                response_data['caldav_user'] = True
            except CalDav.DoesNotExist:
                response_data['caldav_user'] = False

            # Return the response with whichever tokens are available
            if response_data['google_access_token'] or response_data['outlook_access_token'] or response_data['caldav_user']:
                return JsonResponse(response_data, status=200)
            else:
                return JsonResponse({'error': 'No valid tokens found'}, status=404)

        except Exception as e:
            # Log the exception here
            return JsonResponse({'error': str(e)}, status=500)



    def refresh_token(self, refresh_token):
        # Define Microsoft token endpoint and payload
        token_url = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
        payload = {
           
            'refresh_token': refresh_token,
            'grant_type': 'refresh_token',
            'scope': 'User.Read Mail.Send offline_access Calendars.ReadWrite',
            'client_id': OUTLOOK_CLIENT_ID,
            'client_secret': OUTLOOK_CLIENT_SECRET,
        }

        # Send request to refresh token
        try:
            response = requests.post(token_url, data=payload)
            if response.status_code == 200:
                return response.json()
            else:
                return None
        except Exception as e:
            return None
        

    def google_refresh_token(self,refresh_token):
        token_url = 'https://oauth2.googleapis.com/token'
        payload = {
            'client_id': GOOGLE_CLIENT_ID,
            'client_secret': GOOGLE_CLIENT_SECRET,
            'refresh_token': refresh_token,
            'grant_type': 'refresh_token'
        }
        
        # Send request to refresh token
        try:
            response = requests.post(token_url, data=payload)
            if response.status_code == 200:
                return response.json()
            else:
                return None
        except Exception as e:
            return None

