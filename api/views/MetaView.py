# views.py
from django.shortcuts import render, get_object_or_404
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.decorators import action

from api.models import *

class MetaView(viewsets.GenericViewSet):
    @action(methods=['GET'], detail=False)
    def user_profile(self, request, username):

        user = get_object_or_404(User, username=username)
        context = {
            'profile': user,
            'og_name': f"{user.name}",
            'og_username': f"{username}",
            'og_description': f"{user.company}",
            'og_image': request.build_absolute_uri(user.profile_picture.url),
            'og_url': f"https://nsgcrm.com/{username}"
        }

        print("rendering called")
        return render(request, 'ProfileCard.html', context)
        