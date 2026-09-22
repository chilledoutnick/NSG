# from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timezone
from advisorapp.settings import STRIPE_SECRET_KEY
from api.models import Contact
from api.models.PublicReview import PublicReview
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from api.views.Services import *
from api.models.refer import *
import time
from api.utils.stripe_compat import stripe

if STRIPE_SECRET_KEY and hasattr(stripe, 'api_key'):
    stripe.api_key = STRIPE_SECRET_KEY


def generate_referral_code():
    code_length = 8
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(code_length))


def fetch_next_billing_date(stripe_subscription_id):
    try:
        # Retrieve the subscription from Stripe
        subscription = stripe.Subscription.retrieve(stripe_subscription_id)

        # Convert the Unix timestamp to a time_zone-aware datetime object
        next_billing_timestamp = subscription.current_period_end
        next_billing_date = datetime.datetime.fromtimestamp(next_billing_timestamp, timezone.utc).strftime('%Y-%m-%d %H:%M:%S')

        return next_billing_date

    except Exception as e:
        print(f"Error fetching next billing date: {str(e)}")
        return None


def extend_subscription(stripe_subscription_id, additional_months, host_user):
    try:
        # Retrieve the subscription
        subscription = stripe.Subscription.retrieve(stripe_subscription_id)

        # Get the current trial end date (if any)
        current_trial_end = subscription.get('trial_end')

        if current_trial_end and current_trial_end > time.time():
            # User is already in a trial period, extend the trial
            new_trial_end = current_trial_end + (additional_months * 30 * 24 * 60 * 60)  # Extend the trial
        else:
            # No trial period or trial period has ended, start a new trial
            new_trial_end = int(time.time()) + (additional_months * 30 * 24 * 60 * 60)  # Assuming 30 days per month

        # Update the subscription with the new trial end date
        updated_subscription = stripe.Subscription.modify(
            stripe_subscription_id,
            trial_end=new_trial_end,
        )

        ReferralRelationship.objects.filter(
            host_user_id=host_user.id,
            is_rewarded=False,  # Only reward unrewarded referrals
            is_scheduled=True  # Only reward scheduled referrals
        ).update(is_rewarded=True, is_scheduled=False)
        print("Subscription trial extended successfully.")
        return updated_subscription

    except Exception as e:
        print(f"Error extending subscription: {str(e)}")


def fetch_subscription_id_from_stripe(email):
    try:
        # Fetch all customers associated with the email
        customers = stripe.Customer.search(query=f"email:'{email}'")

        if not customers['data']:
            print(f"No customers found for email: {email}")
            return None

        # Iterate through each customer and retrieve their subscriptions
        for customer in customers['data']:
            customer_id = customer['card_id']
            subscriptions = stripe.Subscription.list(customer=customer_id)

            if not subscriptions['data']:
                print(f"No subscriptions found for customer ID: {customer_id}")
                continue

            # Check if the customer has any active subscriptions
            for subscription in subscriptions['data']:
                print(f"Checking subscription ID: {subscription['card_id']} with status: {subscription['status']}")
                if subscription['status'] == 'active' or 'trialing':
                    print(f"Active subscription found: {subscription['card_id']}")
                    return subscription['card_id']

        print("No active subscription found.")
        return None

    except Exception as e:
        print(f"Error fetching subscription ID from Stripe: {str(e)}")
        return None


class ReferView(viewsets.GenericViewSet):

    @action(methods=['POST'], detail=False)
    def generate_referral_code_api(self, request):
        try:
            user = get_user_from_token(request)
            referral_code = ReferralCode.objects.filter(fk_user=user).first()
            if referral_code:
                return Response({'referral_code': referral_code.code}, status=status.HTTP_200_OK)
            else:
                code = generate_referral_code()
                referral_code = ReferralCode.objects.create(fk_user=user, code=code)
                return Response({'referral_code': referral_code.code}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def user_by_referralcode(self, request):
        try:
            code = request.data.get('code')
            referral_code = ReferralCode.objects.get(code=code)
            return Response({
                'user_id': referral_code.fk_user_id
            }, status=status.HTTP_200_OK)
        except ReferralCode.DoesNotExist:
            return Response({'message': 'Referral code not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def signup_with_referral(self, request):
        try:
            host_user_id = request.data.get('host_user')
            referred_user_id = request.data.get('referred_user')
            # referral_code=request.data.get('referral_code')

            host_user = get_object_or_404(User, id=host_user_id)
            referred_user = get_object_or_404(User, id=referred_user_id)
            referral_relationship = ReferralRelationship.objects.create(host_user=host_user,
                                                                        referred_user=referred_user, is_rewarded=False)

            data = {
                'host_user': referral_relationship.host_user.id,
                'referred_user': referral_relationship.referred_user.id
            }

            return Response({'data': data}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['POST'], detail=False)
    def count_referrals(self, request):
        try:
            user = get_user_from_token(request)
            total_referral_count = ReferralRelationship.objects.filter(host_user_id=user.id).count()
            public_review = PublicReview.objects.filter(email=user.email).exists()
            is_reviewed = public_review
            count_contact = Contact.objects.filter(owner=user).count()
            return Response({'total_referral_count': total_referral_count,
                             "is_reviewed": is_reviewed,
                             "contact_count": count_contact
                             }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # only for testing purpose
    # @action(methods=['POST'], detail=False)
    # def reward_host_user(self, request):
    #     try:
    #         host_user_id = request.data.get('host_user_id')
    #         host_user = User.objects.get(id=host_user_id)
    #         schedule_reward_task(host_user)
    #         return Response({"message": "Subscription extended successfully"}, status=status.HTTP_200_OK)
    #     except Exception as e:
    #         return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['POST'], detail=False)
    def count_referral_subscription(self, request):
        try:
            user = get_user_from_token(request)
            total_referral_count = ReferralRelationship.objects.filter(host_user_id=user.id).count()
            unrewarded_referrals_count = ReferralRelationship.objects.filter(
                host_user=user,
                is_rewarded=False
            ).count()
            print(user.email)
            subscription_end_date = None

            stripe_subscription_id = fetch_subscription_id_from_stripe(user.email)
            if stripe_subscription_id:
                # Fetch the subscription end date
                subscription_end_date = fetch_next_billing_date(stripe_subscription_id)
                print(subscription_end_date)

            return Response(
                {'total_referral_count': total_referral_count, "unrewarded_referrals_count": unrewarded_referrals_count,
                 "subscription_end_date": subscription_end_date}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
