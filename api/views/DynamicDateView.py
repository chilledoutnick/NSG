import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status,viewsets
from dateutil.parser import parse
from api.models.Date import Date
from rest_framework.decorators import action

class DynamicDateView(viewsets.GenericViewSet):

    @action(detail=False, methods=['post'])
    def post_date(self, request):
        date_str = request.data.get('date')
        if not date_str:
            return Response({"error": "Date is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            parsed_date = parse(date_str).date()  # convert to date only
            # Convert back to datetime for storage (midnight)
            parsed_datetime = datetime.datetime.combine(parsed_date, datetime.time.min)

            date_obj, created = Date.objects.get_or_create(
                id=1,
                defaults={'date': parsed_datetime}
            )
            if not created:
                date_obj.date = parsed_datetime
                date_obj.save()

            return Response({
                "date": parsed_date.isoformat(),  # returns just "YYYY-MM-DD"
                "status": "created" if created else "updated"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def get_date(self, request):
        try:
            date_obj = Date.objects.get(id=1)
            return Response({
                "date": date_obj.date.date().isoformat()  # returns "YYYY-MM-DD"
            }, status=status.HTTP_200_OK)
        except Date.DoesNotExist:
            return Response({"error": "No date found"}, status=status.HTTP_404_NOT_FOUND)