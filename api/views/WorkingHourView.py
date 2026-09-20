from api.serializers import AdvisorSlotSerializer, WorkingHourSerializer
from api.views.Services import get_user_from_token, validate_username
from api.models.WorkingHour import AdvisorSlotTime
from api.models import User, WorkingHour, Profiles
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from django.forms import ValidationError

from api.views.suprsend_helpers import sync_user_profile


class WorkingHourView(viewsets.GenericViewSet):


    @action(methods=["POST"], detail=False)
    def update_working_hours(self, request):
        user = get_user_from_token(request)
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        schedule_data = request.data if isinstance(request.data, list) else [request.data]

        try:
            delete_work = WorkingHour.objects.filter(fk_user_id=user.id)
            delete_work.delete()

            working_hours_data = []
            for data in schedule_data:
                data['fk_user'] = user.id
                working_hours_data.append(data)

            
            serializer = WorkingHourSerializer(data=working_hours_data, many=True)
            if serializer.is_valid():
                serializer.save()
                if not user.availability_added_first_time:
                    user.availability_added_first_time = True
                    user.save()
            sync_user_profile(user)

            return Response(serializer.data,status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

    @action(methods=["POST"], detail=False)
    def create_slot_time(self, request):
        try:
            user = get_user_from_token(request)
            if not user:
                return Response({"error": "user not found"}, status=status.HTTP_404_NOT_FOUND)

            slot_times_data = request.data if isinstance(request.data, list) else [request.data]

            existing_slot_times = AdvisorSlotTime.objects.filter(fk_user=user)
            existing_slot_times.delete()

            for slot_time_data in slot_times_data:
                slot_time_data['fk_user'] = user.id

            serializer = AdvisorSlotSerializer(data=slot_times_data, many=True)
            if serializer.is_valid():
                serializer.save()
                
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=["POST"], detail=False)
    def get_working_hours(self, request):
        try:
            user = get_user_from_token(request)
            schedule_data = WorkingHour.objects.filter(fk_user_id=user.id, status='active')
            slot_times = AdvisorSlotTime.objects.filter(fk_user=user).values_list('slot_time', flat=True)

            data = [
                {
                    "working_hour": hour.working_hour,
                    "status": hour.status,
                    "dayName": hour.dayName,
                    "slot_times":slot_times
                }
                for hour in schedule_data
            ]
            return Response(data=data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

    @action(methods=["POST"], detail=False)
    def get_slot_times(self, request):
        try:
            username = request.data.get("username")
            if not username:
                user = get_user_from_token(request)
            else:

                try:
                    validate_username(username)
                except ValidationError as e:
                    return Response({'message': e.message}, status=status.HTTP_400_BAD_REQUEST)
            
                user = User.objects.filter(username=username).first()

                if not user:
                    profile = Profiles.objects.filter(username=username).first()
                    if not profile:
                        return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
                    user = profile.fk_user
                    # return Response({"error": "user not found"}, status=status.HTTP_404_NOT_FOUND)

            
            slot_times = AdvisorSlotTime.objects.filter(fk_user=user)

            serializer = AdvisorSlotSerializer(slot_times, many=True)

            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
