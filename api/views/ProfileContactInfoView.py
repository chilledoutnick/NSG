
from datetime import datetime, timedelta, timezone
from pickle import FALSE

from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
import requests
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.decorators import action

from advisorapp.settings import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, OUTLOOK_CLIENT_ID, OUTLOOK_CLIENT_SECRET
from api.models import *
from api.models.Outlook import Outlook
from api.serializers import ProfileContactInfoSerializer
from api.views.Services import get_user_from_token
from django.utils.timezone import now

class ProfileContactInfoView(viewsets.GenericViewSet):
    @action(methods=["POST"], detail=False)
    def add_contact_info(self, request):

        username = request.data.get("username")

        if not username:
            return Response({"message": "Username is required"},
                            status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(username=username).first()
        profile = None

        if not user:
            profile = Profiles.objects.filter(username=username).first()

            if not profile:
                return Response({"message": "Username not found"},
                                status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()
        serializer = ProfileContactInfoSerializer(data=data)

        if serializer.is_valid():

            # MAX 5 validation
            if user:
                if user.main_contact_infos.count() >= 5:
                    return Response({"message": "Max 5 contact info allowed"},
                                    status=status.HTTP_400_BAD_REQUEST)

                serializer.save(fk_user=user)

            else:
                if profile.contact_infos.count() >= 5:
                    return Response({"message": "Max 5 contact info allowed"},
                                    status=status.HTTP_400_BAD_REQUEST)

                serializer.save(fk_profile=profile)

            return Response(serializer.data)

        return Response(serializer.errors,
                        status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def get_contact_info(self, request):

        username = request.data.get("username")

        if not username:
            return Response({"message": "Username required"},
                            status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(username=username).first()
        profile = None

        if not user:
            profile = Profiles.objects.filter(username=username).first()

            if not profile:
                return Response({"message": "Username not found"},
                                status=status.HTTP_404_NOT_FOUND)

        if user:
            contact_infos = user.main_contact_infos.all()
        else:
            contact_infos = profile.contact_infos.all()

        serializer = ProfileContactInfoSerializer(contact_infos, many=True)

        return Response(serializer.data)

    @action(methods=["POST"], detail=False)
    def edit_contact_info(self, request):
        info_id = request.data.get("info_id")

        contact_info = ProfileContactInfo.objects.filter(id=info_id).first()

        if not contact_info:
            return Response({"message": "Contact Info not found"},
                            status=status.HTTP_404_NOT_FOUND)

        serializer = ProfileContactInfoSerializer(
            contact_info,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors,
                        status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def delete_contact_info(self, request):
        info_id = request.data.get("info_id")

        contact = ProfileContactInfo.objects.filter(id=info_id).first()

        if not contact:
            return Response({"message": "Not found"},
                            status=status.HTTP_404_NOT_FOUND)

        contact.delete()
        return Response({"message": "Deleted successfully"})