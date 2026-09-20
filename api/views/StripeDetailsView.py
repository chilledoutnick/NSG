from advisorapp.settings import STRIPE_SECRET_KEY
from stripe.error import InvalidRequestError
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import viewsets, status
from api.models import PaymentBilling, StripeDetails
import stripe
from datetime import datetime, timedelta

from api.views.Services import get_user_from_token

stripe.api_key = STRIPE_SECRET_KEY


class StripeDetailsView(viewsets.GenericViewSet):

    @action(methods=['POST'], detail=False)
    def get_stripe_details(self, request):
        try:
            product_id = request.data.get('product_id')
            period = request.data.get('period', 'monthly')  # Default period to 'monthly' if not provided
            coupon = request.data.get('coupon', None)
            if period not in {"monthly", "yearly", "quarterly", "one_time"}:
                return Response({"message": "Invalid Period. Period should be either 'monthly', 'quarterly', 'yearly' "
                                            "or 'one_time'"},
                                status=status.HTTP_404_NOT_FOUND)
            stripe_detail = StripeDetails.objects.filter(product_id=product_id).first()  # Retrieve Stripe details
            coupon_msg = ""
            coupon_name = None
            coupon_discount = 0.00
            discount_off = 0
            currency = "USD"
            if not stripe_detail:
                return Response({"message": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

            # Dynamically get the price and price_id based on the 'period'
            price_attr = f"{period}_price"  # e.g., "monthly_price" or "yearly_price"
            price_id_attr = f"{period}_price_id"  # e.g., "monthly_price_id" or "yearly_price_id"
            price_id = getattr(stripe_detail, price_id_attr, None)
            price = float(getattr(stripe_detail, price_attr, None))
            total_price = price
            try:
                price_validity = stripe.Price.retrieve(price_id)
                total_price = price_validity.unit_amount
                currency = price_validity.currency

                print(price_validity)
                valid_price = True
            except InvalidRequestError as e:
                str(e)
                valid_price = False
            if coupon:
                try:
                    discount = stripe.Coupon.retrieve(coupon)
                    print(discount)
                    if discount and discount.valid:
                        coupon_msg = "Coupon added successfully"
                        coupon_name = discount.name
                        if discount.amount_off:
                            discount_off = discount.amount_off
                            coupon_discount = discount.amount_off
                            price -= coupon_discount
                        else:
                            discount_off = discount.percent_off
                            coupon_discount = (price * discount.percent_off) / 100
                            price = price - coupon_discount
                except InvalidRequestError as e:
                    str(e)
                    coupon_msg = "Invalid Coupon"

            res = {
                "product_name": stripe_detail.product_name,
                "desc": stripe_detail.desc,
                "trial_days": stripe_detail.trial_days,
                "valid_price_id": valid_price,
                "price_id": price_id,
                "amount_due": round(price, 2),
                "amount": round(total_price, 2),
                "currency": currency,
                "discount": round(coupon_discount, 2),
                "discount_off": discount_off,
                "coupon_name": coupon_name,
                "coupon_message": coupon_msg,
                "period": period
            }

            return Response(data=res, status=status.HTTP_200_OK)

        except TimeoutError as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def new_stripe_details(self, request):
        stripe_detail, price, price_id = None, None, None
        try:
            monthly_price_id = request.data.get("monthly_price_id", None)
            metal_card_price_id = request.data.get("metal_card_price_id", None)
            shipping_price_id = request.data.get("shipping_price_id", None)
            coupon = request.data.get('coupon', None)
            # Retrieve Stripe details
            if monthly_price_id:
                stripe_detail = StripeDetails.objects.filter(monthly_price_id=monthly_price_id).first()
                price = float(stripe_detail.monthly_price)
                price_id = stripe_detail.monthly_price_id
            elif metal_card_price_id:
                stripe_detail = StripeDetails.objects.filter(one_time_price_id=metal_card_price_id).first()
                price = float(stripe_detail.one_time_price)
                price_id = stripe_detail.one_time_price_id
            elif shipping_price_id:
                stripe_detail = StripeDetails.objects.filter(one_time_price_id=shipping_price_id).first()
                price = float(stripe_detail.one_time_price)
                price_id = stripe_detail.one_time_price_id
            coupon_msg = ""
            coupon_name = None
            coupon_discount = 0.00
            discount_off = 0
            currency = "USD"
            if not stripe_detail:
                return Response({"message": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

            # Dynamically get the price and price_id based on the 'period'
            total_price = price
            try:
                price_validity = stripe.Price.retrieve(price_id)
                total_price = price_validity.unit_amount
                currency = price_validity.currency

                print(price_validity)
                valid_price = True
            except InvalidRequestError as e:
                str(e)
                valid_price = False
            if coupon:
                try:
                    discount = stripe.Coupon.retrieve(coupon)
                    print(discount)
                    if discount and discount.valid:
                        coupon_msg = "Coupon added successfully"
                        coupon_name = discount.name
                        if discount.amount_off:
                            discount_off = discount.amount_off
                            coupon_discount = discount.amount_off
                            price -= coupon_discount
                        else:
                            discount_off = discount.percent_off
                            coupon_discount = (price * discount.percent_off) / 100
                            price = price - coupon_discount
                except InvalidRequestError as e:
                    str(e)
                    coupon_msg = "Invalid Coupon"

            res = {
                "product_name": stripe_detail.product_name,
                "desc": stripe_detail.desc,
                "trial_days": stripe_detail.trial_days,
                "valid_price_id": valid_price,
                "price_id": price_id,
                "amount_due": round(price, 2),
                "amount": round(total_price, 2),
                "currency": currency,
                "discount": round(coupon_discount, 2),
                "discount_off": discount_off,
                "coupon_name": coupon_name,
                "coupon_message": coupon_msg,
                # "period": period
            }

            return Response(data=res, status=status.HTTP_200_OK)

        except TimeoutError as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # @action(methods=['POST'], detail=False)
    # def create_StripeDetails(self, request):
    #     try:
    #
    #         serializer = SubscriptionSerializer(data=request.data)
    #         if serializer.is_valid():
    #             serializer.save()
    #             return Response(serializer.data, status=status.HTTP_201_CREATED)
    #         else:
    #             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    #
    #     except Exception as e:
    #         return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=["POST"], detail=False)
    def pause_subscription(self, request):
        try:
            # Get data from the request
            user = get_user_from_token(request)
            user_billing_id = user.fk_payment_billing_id
            stripe_user = PaymentBilling.objects.get(billing_id=user_billing_id)
            subscription_id = stripe_user.stripe_subscription_id
            pause_days = request.data.get("pause_days")  # Number of days to pause (30, 60, 90)

            # Validate inputs
            if not subscription_id:
                return Response({"error": "Subscription ID is required"}, status=status.HTTP_400_BAD_REQUEST)
            if not pause_days:
                return Response({"error": "Pause days are required"}, status=status.HTTP_400_BAD_REQUEST)

            # Ensure pause_days is valid
            if pause_days not in [30, 60, 90]:
                return Response({"error": "Pause days must be one of [30, 60, 90]"}, status=status.HTTP_400_BAD_REQUEST)

            # Calculate the resume date as a UNIX timestamp
            pause_until_date = datetime.now() + timedelta(days=pause_days)
            pause_until_timestamp = int(pause_until_date.timestamp())

            # Update the Stripe subscription to pause
            subscription = stripe.Subscription.modify(
                subscription_id,
                pause_collection={
                    "behavior": "void",  # Can also be "mark_uncollectible" or "keep_as_draft"
                    "resumes_at": pause_until_timestamp,  # Resume date
                },
            )

            return Response(
                {
                    "message": "Subscription paused successfully",
                    "subscription": subscription,
                },
                status=status.HTTP_200_OK,
            )

        except stripe.error.InvalidRequestError as e:
            # Handle Stripe errors
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Handle unexpected errors
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
