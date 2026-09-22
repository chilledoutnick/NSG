import json

from api.models.Dashboard import ProfileVisit
from api.serializers import DigitalCardSerializer
from api.models import Contact, Tag, ContactTag
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from api.models.DigitalCard import *
from api.models import *
from api.views.Services import *
from datetime import datetime, timedelta
import requests
import base64
import io
from PIL import Image

from api.views.suprsend_helpers import trigger_event

MAX_EMAILS_PER_DAY = 50




class DashboardView(viewsets.GenericViewSet):
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')

    @action(methods=['POST'], detail=False)
    def save_profile_visit(self, request):
        try:
            username = request.data.get('username')
            if not username:
                return Response({'message': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)

            # Identify if it's default user or profile username
            user = User.objects.filter(username=username).first()
            profile = None
            is_profile = False

            if not user:
                profile = Profiles.objects.filter(username=username).first()
                if not profile:
                    return Response({'message': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
                user = profile.fk_user
                is_profile = True


            session_key = request.session.session_key or request.session.save() or request.session.session_key
            ip = self.get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT')

            # Check existing visit
            if is_profile:
                existing_visit = ProfileVisit.objects.filter(
                    fk_profile=profile,
                    session_key=session_key,
                    ip_address=ip
                ).first()
            else:
                existing_visit = ProfileVisit.objects.filter(
                    fk_user=user,
                    session_key=session_key,
                    ip_address=ip
                ).first()

            if existing_visit:
                existing_visit.timestamp = datetime.now()
                existing_visit.save()
                return Response({"status": "visit updated"}, status=status.HTTP_200_OK)
            else:
                ProfileVisit.objects.create(
                    fk_profile=profile if is_profile else None,
                    fk_user=None if is_profile else user,
                    session_key=session_key,
                    ip_address=ip,
                    user_agent=user_agent
                )
                return Response({"status": "visit recorded"}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # Get the count of profile visits, contacts, meetings and emails from the all days, last 7days, last 30 days , last 6 months, last 1 year
    @action(methods=['POST'], detail=False)
    def get_dashboard_data(self, request):
        try:
            user = get_user_from_token(request)
            time_period = request.data.get('time_period', 'all')
            if time_period == 'all':
                profile_visit_count = ProfileVisit.objects.filter(fk_user=user).count()
                contact_count = Contact.objects.filter(owner=user).count()
                meeting_count = AdvisorAppointment.objects.filter(fk_user=user).count()
                email_count = Email.objects.filter(fk_user=user).count()
            elif time_period == 'last_7_days':
                start_date = datetime.now() - timedelta(days=7)
                profile_visit_count = ProfileVisit.objects.filter(fk_user=user, timestamp__gte=start_date).count()
                contact_count = Contact.objects.filter(owner=user, date_added__gte=start_date).count()
                meeting_count = AdvisorAppointment.objects.filter(fk_user=user, timestamp__gte=start_date).count()
                email_count = Email.objects.filter(fk_user=user, sent_date__gte=start_date).count()
            elif time_period == 'last_30_days':
                start_date = datetime.now() - timedelta(days=7)
                profile_visit_count = ProfileVisit.objects.filter(fk_user=user, timestamp__gte=start_date).count()
                contact_count = Contact.objects.filter(owner=user, date_added__gte=start_date).count()
                meeting_count = AdvisorAppointment.objects.filter(fk_user=user, timestamp__gte=start_date).count()
                email_count = Email.objects.filter(fk_user=user, sent_date__gte=start_date).count()
            elif time_period == 'last_6_months':
                start_date = datetime.now() - timedelta(days=7)
                profile_visit_count = ProfileVisit.objects.filter(fk_user=user, timestamp__gte=start_date).count()
                contact_count = Contact.objects.filter(owner=user, date_added__gte=start_date).count()
                meeting_count = AdvisorAppointment.objects.filter(fk_user=user, timestamp__gte=start_date).count()
                email_count = Email.objects.filter(fk_user=user, sent_date__gte=start_date).count()
            elif time_period == 'last_1_year':
                start_date = datetime.now() - timedelta(days=7)
                profile_visit_count = ProfileVisit.objects.filter(fk_user=user, timestamp__gte=start_date).count()
                contact_count = Contact.objects.filter(owner=user, date_added__gte=start_date).count()
                meeting_count = AdvisorAppointment.objects.filter(fk_user=user, timestamp__gte=start_date).count()
                email_count = Email.objects.filter(fk_user=user, sent_date__gte=start_date).count()
            else:
                return Response({"message": "Invalid time period"}, status=status.HTTP_400_BAD_REQUEST)
            # Return the counts

            return Response({
                "profile_visit_count": profile_visit_count,
                "contact_count": contact_count,
                "meeting_count": meeting_count,
                "email_count": email_count
            })
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["GET"], detail=False)
    def weekly_profile_insight(self, request):

        sent_today = 0
        growth_percentage = 0
        current_views = 0
        percentage = []
        today = timezone.now().date()

        users = User.objects.all()

        for user in users:
            print(user.id)

            # Stop at 50 emails
            if sent_today >= MAX_EMAILS_PER_DAY:
                break

            # Avoid duplicate sending in same week
            if user.last_weekly_insight_sent_at:
                if user.last_weekly_insight_sent_at.date() >= today - timedelta(days=6):
                    continue

            growth_percentage, current_views = calculate_weekly_growth(user)

            if growth_percentage > 0:
                properties={
                    "growth_percentage": growth_percentage,
                }
                percentage.append((growth_percentage, current_views))
                event = trigger_event("contact", user.id, properties)

                user.last_weekly_insight_sent_at = timezone.now()
                user.last_weekly_views_count = current_views
                user.save()

                sent_today += 1
        return Response({
                "sent_today": sent_today,
                "growth_percentage": percentage,
                "current_views": current_views,
            })

    # @action(methods=['POST'], detail=False)
    # def save_profile_visit(self, request):
    #     username = request.data.get('username')
    #     try:
    #         user = User.objects.get(username=username)
    #     except:
    #         profile = Profiles.objects.filter(username=username).first()
    #         if profile:
    #             user = profile.fk_user
    #         else:
    #             return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)


    #     session_key = request.session.session_key or request.session.save() or request.session.session_key
    #     ip = self.get_client_ip(request)
    #     user_agent = request.META.get('HTTP_USER_AGENT')

    #     # Create record only if this IP hasn't visited before for this user
    #     if not ProfileVisit.objects.filter(fk_user=user, ip_address=ip).exists():
    #         ProfileVisit.objects.create(
    #             fk_user=user,
    #             session_key=session_key,
    #             ip_address=ip,
    #             user_agent=user_agent
    #         )
    #     else:
    #         # If the visit already exists, you can choose to update it or ignore
    #         # For example, you might want to update the timestamp if needed
    #         visit = ProfileVisit.objects.get(fk_user=user, ip_address=ip)
    #         visit.timestamp = datetime.now()
    #         visit.save()
    #         return Response({"status": "visit updated",},status=status.HTTP_200_OK)


    #     return Response({"status": "visit recorded"},status=status.HTTP_201_CREATED)

    