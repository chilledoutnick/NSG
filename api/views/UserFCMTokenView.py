from django.shortcuts import get_object_or_404
from firebase_admin import messaging
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status

from api.models import UserFCMToken
from api.serializers import UserFCMTokenSerializer
from api.views.Services import *
from api.models import *
from api.tasks import send_delayed_notification, get_firebase_app


class UserFCMTokenView(viewsets.GenericViewSet):
    serializer_class = UserFCMTokenSerializer
    queryset = UserFCMToken.objects.all()
