# views.py

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, viewsets
from api.models.User import User

from api.models import Profiles
from api.models.ProfileLayout import ProfileLayout
from api.views.Services import get_user_from_token
 # adjust import

DEFAULT_LAYOUT = [
    "Service",
    "ProfileVideo",
    "FeaturedImages",
    "OtherLinks",
    "ProfileReview",
]

class ProfileLayoutViewSet(viewsets.ViewSet):

    @action(detail=False, methods=["POST"])
    def get_layout(self, request):
        username = request.data.get("username")
        if not username:
            return Response({"error": "username required"}, status=400)

        profile_user = User.objects.filter(username=username).first()
        profile_obj = Profiles.objects.filter(username=username).first()

        if profile_user:
            layout, created = ProfileLayout.objects.get_or_create(
                fk_user=profile_user,
                defaults={"sections_order": DEFAULT_LAYOUT}
            )
        elif profile_obj:
            layout, created = ProfileLayout.objects.get_or_create(
                fk_profile=profile_obj,
                defaults={"sections_order": DEFAULT_LAYOUT}
            )
        else:
            return Response({"error": "Profile not found"}, status=404)

        return Response(layout.sections_order, status=200)

    @action(detail=False, methods=["POST"])
    def update_layout(self, request):
        user = get_user_from_token(request)
        if not user:
            return Response({"error": "Not authorized"}, status=401)

        username = request.data.get("username")
        order = request.data.get("order")

        if not username or not order:
            return Response({"error": "username and order required"}, status=400)

        # case 1 → updating own user layout
        if username == user.username:
            layout, created = ProfileLayout.objects.get_or_create(fk_user=user)
            layout.sections_order = order
            layout.save()
            return Response({"message": "Layout updated successfully"}, status=200)

        profile = Profiles.objects.filter(username=username).first()
        if not profile:
            return Response({"error": "Profile not found"}, status=404)

        # Only the parent user can modify the profile layout
        if profile.fk_user != user:
            return Response({"error": "Permission denied"}, status=403)

        layout, created = ProfileLayout.objects.get_or_create(fk_profile=profile)
        layout.sections_order = order
        layout.save()

        return Response({"message": "Layout updated successfully"}, status=200)
