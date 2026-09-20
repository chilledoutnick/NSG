from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from api.models import *
from api.views.suprsend_helpers import sync_user_profile, client


class SuperAdminView(viewsets.GenericViewSet):
    @action(methods=['POST'], detail=False)
    def update_custom_username(self, request):
        try:
            user_id = request.data.get("user_id")
            if not user_id:
                return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.filter(id=user_id).first()
            if not user:
                return Response({"error": "user not found"}, status=status.HTTP_404_NOT_FOUND)
            custom_username = request.data.get("username")
            if not custom_username:
                return Response({"error": "use"
                                          "rname is required"}, status=status.HTTP_400_BAD_REQUEST)

            if user.custom_username != custom_username:
                user.custom_username = custom_username.strip()
                user.save()
                return Response({"message": "Username updated successfully"}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Username is already up to date"}, status=status.HTTP_406_NOT_ACCEPTABLE)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['POST'], detail=False)
    def sync_missing_suprsend_users(self, request):

        users = User.objects.all()
        synced = 0
        skipped = 0
        errors = []

        for user in users:
            distinct_id = str(user.id)

            try:
                # 🔎 Check if user already exists in SuprSend
                try:
                    client.users.get(distinct_id)
                    skipped += 1
                    continue  # user exists → skip
                except Exception as e:
                    str(e)
                    # If not found → create profile
                    sync_user_profile(user)
                    synced += 1

            except Exception as e:
                str(e)
                # logger.exception("Failed syncing user %s", user.id)
                errors.append(user.id)

        return Response({
            "synced_users": synced,
            "skipped_existing": skipped,
            "errors": errors
        }, status=status.HTTP_200_OK)
        
