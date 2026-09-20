from django.shortcuts import get_object_or_404
from django.utils.timezone import make_aware
from datetime import datetime, timedelta
from firebase_admin import messaging
from firebase_admin.exceptions import InvalidArgumentError
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status

from api.models import UserFCMToken
from api.views.Services import *
from api.models import *
from django.contrib.auth import get_user_model
from api.tasks import send_delayed_notification, get_firebase_app
from api.views.suprsend_helpers import (
    sync_user_profile,
    save_push_subscription_on_profile,
    trigger_event
)

get_firebase_app()

from suprsend import Suprsend
# Initialize SDK

class NotificationView(viewsets.GenericViewSet):

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')

    """
        Endpoints managing SuprSend interactions:
        - POST /notifications/sync-profile/          -> sync current logged in user's profile
        - POST /notifications/register-device/      -> register push subscription (from browser)
        - POST /notifications/trigger-event/        -> trigger a named event (server-side)
    """

    @action(detail=False, methods=["POST"])
    def sync_profile(self, request):
        try:
            user = get_user_from_token(request)
        except Exception as e:
            str(e)
            user_id = request.data.get("user_id")
            user = User.objects.filter(id=user_id).first()

        try:
            sync_user_profile(user)
            return Response({"status": "synced"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=["POST"], url_path="register-device")
    def register_device(self, request):
        """
        Called by the frontend when the user grants push permission and we get subscription.
        Body: { subscription: { ... } }
        """
        user = request.user
        if not user or not user.is_authenticated:
            return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        subscription = request.data.get("subscription")
        if not subscription:
            return Response({"detail": "subscription required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Save on SuprSend profile so SuprSend can target push notifications
            save_push_subscription_on_profile(user, subscription)
            return Response({"status": "device_registered"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=["POST"])
    def trigger_event_view(self, request):
        """
        Generic event trigger endpoint (server-side). Useful for admin/testing.
        Body: { event_name: "contact.created", distinct_id: "123", properties: {...} }
        If distinct_id omitted, uses current user id.
        """
        # user = request.user
        # if not user or not user.is_authenticated:
        #     return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        event_name = request.data.get("event_name")
        properties = request.data.get("properties", {})
        reminder_datetime = request.data.get('reminder_datetime', None)

        if not event_name:
            return Response({"detail": "event_name required"}, status=status.HTTP_400_BAD_REQUEST)

        distinct_id = request.data.get("distinct_id")
                       # or make_distinct_id_for_user(user))

        try:
            # tz = pytz.timezone("Asia/Calcutta")
            # reminder_datetime = make_aware(datetime.datetime.strptime(reminder_datetime, "%Y-%m-%d %H:%M:%S"),
            #                                tz)
            #
            # # aware_dt = tz.localize(reminder_datetime)
            # iso_timestamp = reminder_datetime.isoformat()
            # properties["reminder_datetime"] = iso_timestamp
            event = trigger_event(event_name, distinct_id, properties)
            return Response({"status": "event_triggered", "msg": event}, status=status.HTTP_200_OK)
        except TypeError as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['POST'], detail=False)
    def user_clone(self, request):
        qs = User.objects.all()
        errors = []
        for u in qs.iterator():
            try:
                sync_user_profile(u)
            except Exception as e:
                str(e)
                errors.append(u.id)
        return Response({"status": "Data transfer", "errors": errors}, status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=False)
    def testing(self, request):
        try:
            email = request.data.get("email")
            user = User.objects.filter(email=email).first()
            return Response({
                "user_id": user.id,
                "name": user.name,
                "address": user.address,
                "username": user.username,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    #
    # # @action(methods=['POST'], detail=False)
    # # def user_fcm_token(self, request):
    # #     try:
    # #         user_id = request.data.get("user_id")
    # #         fcm_token = request.data.get("fcm_token")
    # #
    # #         if not user_id or not fcm_token:
    # #             return Response({"message": "User ID and FCM token are required"}, status=status.HTTP_400_BAD_REQUEST)
    # #
    # #         user = User.objects.filter(id=int(user_id)).first()
    # #         if not user:
    # #             return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    # #
    # #         # 🔹 Validate FCM Token using Firebase Admin SDK
    # #         get_firebase_app()
    # #         try:
    # #             messaging.send(messaging.Message(token=fcm_token), dry_run=True)
    # #         except messaging.UnregisteredError:
    # #             return Response({"message": "Invalid or expired FCM token"}, status=status.HTTP_400_BAD_REQUEST)
    # #         except Exception as e:
    # #             return Response({"message": f"FCM validation failed: {str(e)}"},
    # #                             status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    # #
    # #         # Ensure token is not duplicated
    # #         if fcm_token not in user.fcm_token:
    # #             user.fcm_token.append(fcm_token)
    # #             user.save()
    # #
    # #             schedule_user_notification(int(user_id))
    # #
    # #         return Response({"message": "FCM token updated", "fcm_tokens": user.fcm_token}, status=status.HTTP_200_OK)
    # #
    # #     except Exception as e:
    # #         return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    #
    # @action(methods=["POST"], detail=False)
    # def schedule_notification(self, request):
    #     try:
    #         user_id = request.data["user_id"]
    #         user = User.objects.filter(id=int(user_id)).first()
    #         print(user)
    #         if not user_id:
    #             return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    #
    #         # Schedule the task to send a notification
    #         task = schedule_user_notification(int(user_id))
    #
    #         return Response({"task_id": task, "status": "Scheduled", "user": user.username},
    #                         status=status.HTTP_202_ACCEPTED)
    #     except IOError as e:
    #         return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    #
    # @action(methods=["GET", "POST"], detail=False)
    # def fcm_permission(self, request):
    #     """
    #     GET - Retrieve FCM permission for a user
    #     POST - Update the FCM permission if a new value is provided
    #     """
    #     user = get_user_from_token(request)
    #     if request.method == "GET":
    #         return Response({"user_id": user.id, "fcm_permission": user.fcm_permission}, status=status.HTTP_200_OK)
    #
    #     if request.method == "POST":
    #         new_permission = request.data.get("fcm_permission")
    #
    #         if new_permission is None or int(new_permission) not in [-1, 0, 1]:
    #             return Response({"error": "Invalid permission value. Use -1 (Default), 0 (False), or 1 (True)."},
    #                             status=status.HTTP_400_BAD_REQUEST)
    #
    #         user.fcm_permission = int(new_permission)
    #         user.save()
    #
    #         return Response({"user_id": user.id, "fcm_permission": user.fcm_permission}, status=status.HTTP_200_OK)
    #
    # @action(methods=["POST"], detail=False)
    # def get_fcm_permission(self, request):
    #     user = get_user_from_token(request)
    #     device_info = request.META.get("HTTP_USER_AGENT")
    #     ip_address = self.get_client_ip(request)
    #
    #     if not device_info:
    #         return Response({"error": "device_info is required"}, status=status.HTTP_400_BAD_REQUEST)
    #
    #     # Check for existing FCM token for user and device
    #     token_entry = UserFCMToken.objects.filter(user=user, ip_address=ip_address).first()
    #
    #     if not token_entry:
    #         return Response({
    #             "user_id": user.id,
    #             "token_status": "not_found",
    #             "action": "generate_token",
    #             "fcm_permission": user.fcm_permission
    #         }, status=status.HTTP_200_OK)
    #
    #     # Validate existing token with Firebase
    #     try:
    #         messaging.send(messaging.Message(token=token_entry.token), dry_run=True)
    #         return Response({
    #             "user_id": user.id,
    #             "token_status": "valid",
    #             "action": "none",
    #             "fcm_token": token_entry.token
    #         }, status=status.HTTP_200_OK)
    #
    #     except (messaging.UnregisteredError, InvalidArgumentError):
    #         # Token is invalid or expired – delete it
    #         token_entry.delete()
    #         return Response({
    #             "user_id": user.id,
    #             "token_status": "invalid",
    #             "action": "generate_token"
    #         }, status=status.HTTP_200_OK)
    #
    #     except Exception as e:
    #         return Response({
    #             "message": f"Error validating token: {str(e)}",
    #             "action": "error"
    #         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
