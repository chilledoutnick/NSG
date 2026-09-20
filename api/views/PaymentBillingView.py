from django.http import JsonResponse
import pytz
from django.utils.decorators import method_decorator

from advisorapp.settings import STRIPE_SECRET_KEY
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from api.models import NSGSmartCard, PaymentBilling
from advisorapp import settings
from api.models.PaymentBilling import Order
from api.serializers import PaymentBillingSerializer
from api.views.Services import *
import stripe

stripe.api_key = STRIPE_SECRET_KEY


# stripe.api_key = STRIPE_TEST_SECRET_KEY

def verify_card(customer_id, payment_method_id):
    if not customer_id or not payment_method_id:
        return Response({'error': 'Missing parameters.'},
                        status=status.HTTP_400_BAD_REQUEST)

    try:
        payment_intent = stripe.PaymentIntent.create(
            amount=100,
            currency='usd',
            customer=customer_id,
            payment_method=payment_method_id,
            confirm=True,
            off_session=True,
            description='Card verification charge',
        )
        stripe.Refund.create(
            payment_intent=payment_intent.id
        )

        return Response({
            'verification': 'succeeded',
            'payment_intent_id': payment_intent.id
        }, status=status.HTTP_200_OK)

    except stripe.error.CardError as e:
        return Response({'error': e.user_message},
                        status=status.HTTP_402_PAYMENT_REQUIRED)
    except stripe.error.StripeError as e:
        return Response({'error': str(e)},
                        status=status.HTTP_400_BAD_REQUEST)


def format_date(timestamp, tz):
    # Convert UNIX timestamp to UTC datetime
    utc_dt = datetime.datetime.fromtimestamp(timestamp, datetime.timezone.utc)
    # Convert UTC datetime to user's timezone
    user_dt = utc_dt.astimezone(tz)
    # Format datetime to 'Nov 26, 2023'
    return user_dt.strftime('%b %d, %Y')


class PaymentBillingView(viewsets.GenericViewSet):

    @action(methods=['POST'], detail=False)
    def create_payment_intent(self, request):
        name = request.data["name"]
        email = request.data["email"].strip()

        customers = stripe.Customer.search(query=f"email:'{email}' AND name:'{name}'")
        if customers.data:
            print("customer exist")
            customer = customers.data[0]
        else:
            customer = stripe.Customer.create(
                name=name,
                email=email,
            )

        session = stripe.SetupIntent.create(
            customer=customer.id,
            automatic_payment_methods={"enabled": True},
        )

        print("session: ", session)

        return Response({'id': session.id,
                         'client_secret': session.client_secret,
                         "customer": customer,
                         })

   
    @action(methods=['POST'], detail=False)
    def create_payment_subscription(self, request):
        set_up_intent_id = request.data.get("session_id")
        price_id = request.data.get("price_id")
        coupon = request.data.get("coupon", None)
        payment_intent_id = None

        try:
            intent = stripe.SetupIntent.retrieve(set_up_intent_id)
        except stripe.error.StripeError as e:
            return Response(
                {"message": f"Failed to retrieve setup intent: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment_user = PaymentBilling.objects.filter(set_up_intent_id=set_up_intent_id).first()

        if payment_user:
            return Response(
                {"message": "Subscription already exists for this setup intent."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Base subscription data
        subscription_data = {
            "customer": intent.customer,
            "items": [{"price": price_id}],
            "payment_settings": {"save_default_payment_method": "off"},
            "trial_settings": {"end_behavior": {"missing_payment_method": "create_invoice"}},
            "collection_method": "charge_automatically",
            "cancel_at_period_end": False,
            "invoice_settings": {"issuer": {"type": "self"}},
            "default_payment_method": intent.payment_method,
            "expand": ["pending_setup_intent"],
        }

        if coupon:
            subscription_data["discounts"] = [{"coupon": coupon}]

        try:
            plan = StripeDetails.objects.filter(one_time_price_id=price_id).first()
        except StripeDetails.DoesNotExist:
            plan = None

        try:
            if plan and plan.product_name == "NSG LifeTime Plan":
                # One-time payment instead of subscription
                final_amount = int(plan.one_time_price * 100)
                payment_intent = stripe.PaymentIntent.create(
                    amount=final_amount,
                    currency="usd",
                    customer=intent.customer,
                    payment_method=intent.payment_method,
                    off_session=True,
                    confirm=True,
                )
                payment_intent_id = payment_intent.id
                stripe_subscription_id = None
                amount = plan.one_time_price
                message = "✅ Lifetime plan purchased successfully!"
            else:
                # Regular subscription
                stripe_subscription = stripe.Subscription.create(**subscription_data)
                stripe_subscription_id = stripe_subscription.id
                amount = stripe_subscription.plan.amount / 100
                message = "✅ Subscription created successfully!"
                if coupon:
                    message += " 🎉 Coupon applied."

            # Save to DB
            customer = stripe.Customer.retrieve(intent.customer)
            payment_user, created = PaymentBilling.objects.update_or_create(
                email=customer.email,
                defaults={
                    "stripe_customer_id": intent.customer,
                    "set_up_intent_id": intent.id,
                    "amount": amount,
                    "stripe_subscription_id": stripe_subscription_id,
                    "payment_intent_id": payment_intent_id,

                },
            )

            return Response(
                {
                    "stripe_subscription_id": stripe_subscription_id,
                    "user": payment_user.email,
                    "user_created": created,
                    "message": message,
                    "payment_intent_id": payment_intent_id,

                },
                status=status.HTTP_200_OK,
            )

        except stripe.error.CardError as e:
            return Response(
                {"message": f"❌ Card error: {e.user_message}"},
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )
        except stripe.error.StripeError as e:
            return Response(
                {"message": f"❌ Stripe error: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {"message": f"❌ Unexpected error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(methods=['POST'], detail=False)
    def upgrade_yearly(self, request):
        try:
            user = get_user_from_token(request)
            user_billing_id = user.fk_payment_billing_id
            stripe_user = PaymentBilling.objects.get(billing_id=user_billing_id)
            subscription_id = stripe_user.stripe_subscription_id
            # subscription_id = request.data['subscription_id']  # Stripe subscription ID
            yearly_price_id = request.data['yearly_price_id']  # Stripe price ID for the yearly plan
            is_card = request.data.get('is_card', False)
            if isinstance(is_card, str):
                is_card = is_card.lower() == "true"

            if not subscription_id or not yearly_price_id:
                return JsonResponse({"error": "Subscription ID and Yearly Price ID are required"}, status=400)

            # Retrieve the subscription
            subscription = stripe.Subscription.retrieve(subscription_id)

            # Update the subscription to use the yearly plan
            updated_subscription = stripe.Subscription.modify(
                subscription_id,
                items=[{
                    "id": subscription['items']['data'][0].id,  # Get the first item in the subscription
                    "price": yearly_price_id,  # Replace with the yearly plan price ID
                }],
                proration_behavior='create_prorations',  # Adjust charges based on usage
            )

            if is_card == True:
                stripe.InvoiceItem.create(
                    customer=stripe_user.stripe_customer_id,
                    amount=3500,
                    currency='cad',
                    description='Smart Card',
                    subscription=subscription_id
                )
                # Create and finalize the invoice to charge immediately
                invoice = stripe.Invoice.create(
                    customer=stripe_user.stripe_customer_id,
                    auto_advance=True,  # Auto-finalize the invoice
                )
                stripe.Invoice.finalize_invoice(invoice.id)
                smart_card, created = NSGSmartCard.objects.get_or_create(fk_user=user)
                smart_card.has_smart_card = is_card
                smart_card.save()

            return JsonResponse({
                "message": "Subscription upgraded to yearly plan successfully",
                "subscription": updated_subscription
            }, status=200)

        except stripe.error.StripeError as e:
            # Handle Stripe API errors
            return JsonResponse({"error": str(e)}, status=500)

        except Exception as e:
            # Handle other exceptions
            return JsonResponse({"error": "An error occurred: " + str(e)}, status=500)

    @action(methods=['POST'], detail=False)
    def get_subscription_details(self, request):
        try:
            # Get the user from the token
            user = get_user_from_token(request)
            if not user:
                return Response({"error": "Invalid token or user not authenticated"},
                                status=status.HTTP_401_UNAUTHORIZED)
            frontend_timezone = request.data.get("timezone")
            user_timezone = pytz.timezone(frontend_timezone)

            # Retrieve the user's Stripe billing info
            user_billing_id = user.fk_payment_billing_id
            stripe_user = PaymentBilling.objects.get(billing_id=user_billing_id)
            subscription_id = stripe_user.stripe_subscription_id

            # Retrieve subscription details from Stripe
            if subscription_id:
                subscription = stripe.Subscription.retrieve(subscription_id)

                # Step 2: Retrieve the customer associated with the subscription
                customer = stripe.Customer.retrieve(subscription.customer)

                # Extract email and phone from the customer object
                email = customer.email
                phone = customer.phone

                start_date = format_date(subscription.start_date, user_timezone)
                billing_date = format_date(subscription.current_period_start, user_timezone)
                renew_date = format_date(subscription.current_period_end, user_timezone)

                # Get subscription plan details (interval: monthly/yearly)
                plan_interval = subscription.plan.interval  # "quarter" or "year"

                # Check if the user has a Smart Card
                has_smart_card = NSGSmartCard.objects.filter(fk_user=user, has_smart_card=True).exists()

                # Determine plan type based on interval and smart card ownership
                plan_type = f"Pro ({'Yearly' if plan_interval == 'year' else 'Quarterly'})"
                if has_smart_card:
                    plan_type += " + Smart Business Card"

                # Initialize card details
                card_details = {}

                payment_method_id = subscription.default_payment_method
                if payment_method_id:
                    # Step 4: Retrieve the payment method details
                    payment_method = stripe.PaymentMethod.retrieve(payment_method_id)
                    card_details = {
                        "brand": payment_method.card.brand,
                        "last4": payment_method.card.last4,
                        "exp_month": payment_method.card.exp_month,
                        "exp_year": payment_method.card.exp_year,
                        "country": payment_method.card.country,
                        "email": email,
                        "phone": phone
                    }

                return Response({

                    "subscription_id": subscription.id,
                    "start_date": start_date,
                    "billing_date": billing_date,
                    "renew_date": renew_date,
                    "plan_type": plan_type,
                    "status": subscription.status,
                    **card_details  # Merge card details if available
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "There is no current ongoing subscription for this user"
                }, status.HTTP_200_OK)

        except PaymentBilling.DoesNotExist:
            return Response({"error": "Payment billing details not found for user"}, status=status.HTTP_404_NOT_FOUND)
        except stripe.error.StripeError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "An unexpected error occurred", "details": str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['POST'], detail=False)
    def create_payment(self, request):
        set_up_intent_id = request.data.get("session_id")
        monthly_price_id = request.data.get("monthly_price_id")
        metal_card_price_id = request.data.get("metal_card_price_id")
        shipping_price_id = request.data.get("shipping_price_id")
        coupon = request.data.get("coupon", None)

        try:
            intent = stripe.SetupIntent.retrieve(set_up_intent_id)
        except stripe.error.StripeError as e:
            return Response(
                {"message": f"Failed to retrieve setup intent: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        payment_methods = stripe.Customer.list_payment_methods(
            intent.customer,
            limit=3,
        )

        stripe.Customer.modify(
            intent.customer,
            invoice_settings={
                "default_payment_method": payment_methods["data"][0]["id"]          }
        )

        payment_user = PaymentBilling.objects.filter(set_up_intent_id=set_up_intent_id).first()

        if payment_user:
            return Response(
                {"message": "Subscription already exists for this setup intent."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create invoice items for metal card and shipping (one-time)
        if metal_card_price_id:
            stripe.InvoiceItem.create(
                customer=intent.customer,
                price=metal_card_price_id
            )

        if shipping_price_id:
            stripe.InvoiceItem.create(
                customer=intent.customer,
                price=shipping_price_id
            )

        # Base subscription data
        subscription_data = {
            "customer": intent.customer,
            "items": [{"price": monthly_price_id}],
            "trial_period_days" : 90,  # 3 months
        "default_payment_method" : intent.payment_method,
        "payment_behavior" : "default_incomplete",
        "discounts" : [{"coupon": coupon}] if coupon else None,
        "expand" : ["latest_invoice.payment_intent"]
            # "payment_settings": {"save_default_payment_method": "off"},
            # "trial_settings": {"end_behavior": {"missing_payment_method": "create_invoice"}},
            # "collection_method": "charge_automatically",
            # "cancel_at_period_end": False,
            # "invoice_settings": {"issuer": {"type": "self"}},
            # "default_payment_method": intent.payment_method,
            # "expand": ["pending_setup_intent"],
        }

        if coupon:
            subscription_data["discounts"] = [{"coupon": coupon}]

        # try:
        #     plan = StripeDetails.objects.filter(one_time_price_id=price_id).first()
        # except StripeDetails.DoesNotExist:
        #     plan = None

        try:
            # Regular subscription
            stripe_subscription = stripe.Subscription.create(**subscription_data)
            stripe_subscription_id = stripe_subscription.id
            invoice = stripe_subscription.latest_invoice

            invoice = stripe.Invoice.pay(
                    invoice.id,
                    payment_method=intent.payment_method
            )
            # amount = stripe_subscription.plan.amount / 100
            amount = invoice.amount_paid
            message = "✅ Subscription created successfully!"
            if coupon:
                    message += " 🎉 Coupon applied."

            # Save to DB
            customer = stripe.Customer.retrieve(intent.customer)
            payment_user, created = PaymentBilling.objects.update_or_create(
                email=customer.email,
                defaults={
                    "stripe_customer_id": intent.customer,
                    "set_up_intent_id": intent.id,
                    "amount": amount,
                    "stripe_subscription_id": stripe_subscription_id,
                },
            )

            return Response(
                {
                    "stripe_subscription_id": stripe_subscription_id,
                    "user": payment_user.email,
                    "user_created": created,
                    "message": message,
                    "invoice": invoice,
                },
                status=status.HTTP_200_OK,
            )

        except stripe.error.CardError as e:
            return Response(
                {"message": f"❌ Card error: {e.user_message}"},
                status=status.HTTP_402_PAYMENT_REQUIRED,
            )
        except stripe.error.StripeError as e:
            return Response(
                {"message": f"❌ Stripe error: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {"message": f"❌ Unexpected error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(methods=['POST'], detail=False)
    def create_combined_checkout_session(self, request):
            email = request.data["email"].strip()
            name = request.data["name"]
            price_id_subscription = request.data.get("price_id_subscription")
            price_id_card = request.data.get("price_id_card")

            # Retrieve or create the customer
            customers = stripe.Customer.search(query=f"email:'{email}' AND name:'{name}'")
            if customers.data:
                customer = customers.data[0]
            else:
                customer = stripe.Customer.create(
                    name=name,
                    email=email,
                )

            # Create a Stripe Checkout Session
            line_items = []
            if price_id_subscription:
                line_items.append({"price": price_id_subscription, "quantity": 1})
            if price_id_card:
                line_items.append({"price": price_id_card, "quantity": 1})

            try:
                checkout_session = stripe.checkout.Session.create(
                    customer=customer.id,
                    line_items=line_items,
                    mode="subscription" if price_id_subscription else "payment",
                    success_url="http://localhost:3000/completion",
                    cancel_url="http://localhost:3000/error",
                )
                return Response({"checkout_url": checkout_session.url}, status=status.HTTP_200_OK)

            except stripe.error.StripeError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # @action(methods=['POST'], detail=False)
    # def test(self, request):
    #     payment_intent_id = request.data.get("session_id")
    #     amount = 699
    #     intent = stripe.Coupon.retrieve("webhook2")
    #     print(intent.applies_to)
    #     return Response(intent)

    @csrf_exempt
    @action(methods=['POST'], detail=False)
    def stripe_webhook(self, request):
        # time.sleep(10)
        payload = request.body
        signature_header = request.META['HTTP_STRIPE_SIGNATURE']
        # event = None
        try:
            event = stripe.Webhook.construct_event(
                payload, signature_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError:
            return HttpResponse(status=400)

        # # Handle different types of events
        # if event['type'] in [
        #     'price.created', 'price.deleted', 'price.updated',
        #     'product.created', 'product.deleted', 'product.updated'
        # ]:
        #     stripe_object = event['data']['object']
        #     event_type = event['type']
        #
        #     # Handling different event types
        #     if event_type.startswith('price'):
        #         print("----------price------------", event)
        #
        #         handle_price_events(stripe_object, event_type)
        #         print("-----------------------------------------------------------------------")
        #
        #     elif event_type.startswith('product'):
        #         print("----------product------------", event)
        #
        #         handle_product_events(stripe_object, event_type)
        #         print("-----------------------------------------------------------------------")


        # return HttpResponse(status=400 if 'failed' in event['type'] else 419)
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]

            handle_checkout_completed(session)
            # order, created = handle_partial_checkout_completed(session)

        if event["type"] == "payment_intent.payment_failed":
            pi = event["data"]["object"]
            customer_id = pi["customer"]

            Order.objects.filter(
                stripe_customer_id=customer_id,
                remaining_paid=False
            ).update(status="failed")

        return HttpResponse(status=200)

    @action(methods=["POST"], detail=False)
    def create_one_time_payment(self, request):
        name = request.data["name"]
        email = request.data["email"].strip()
        price_id = request.data["price_id"]  # Should be for a one-time product

        # Get price info from Stripe
        price = stripe.Price.retrieve(price_id)
        amount = price.unit_amount  # in cents
        currency = price.currency

        # Get or create customer
        customers = stripe.Customer.search(query=f"email:'{email}' AND name:'{name}'")
        if customers.data:
            customer = customers.data[0]
        else:
            customer = stripe.Customer.create(name=name, email=email)

        # Create a PaymentIntent
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            customer=customer.id,
            automatic_payment_methods={"enabled": True},  # Or manually specify if needed
            metadata={"product_type": "one_time", "price_id": price_id}
        )

        return Response({
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id,
            "amount": amount,
            "currency": currency,
            "customer_id": customer.id,
        })

    @action(methods=["POST"], detail=False)
    def confirm_one_time_payment(self, request):
        payment_intent_id = request.data["payment_intent_id"]
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)

        if intent.status == "succeeded":
            # Store in your DB if needed
            customer = stripe.Customer.retrieve(intent.customer)
            PaymentBilling.objects.create(
                email=customer.email,
                stripe_customer_id=customer.id,
                amount=intent.amount,
                one_time_payment=True,
                payment_intent_id=intent.id
            )
            return Response({"message": "Payment successful."})
        else:
            return Response({"message": "Payment not successful."}, status=400)

    @action(methods=["POST"], detail=False)
    def payment_details(self, request):
        session_id = request.data.get("session_id")

        if not session_id:
            return Response(
                {"error": "session_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Retrieve checkout session from Stripe
            session = stripe.checkout.Session.retrieve(session_id)

        except stripe.error.InvalidRequestError:
            return Response(
                {"error": "Invalid session_id"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Extract email from session
        email = None
        if session.customer_details:
            email = session.customer_details.email

        if not email:
            return Response(
                {"error": "Email not found in checkout session"},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            billing = PaymentBilling.objects.get(email=email)
        except PaymentBilling.DoesNotExist:
            return Response(
                {"error": "No billing record found for this email"},
                status=status.HTTP_404_NOT_FOUND
            )
        if billing.payment_intent_id:
            # Option 1: Search for Checkout Sessions by payment intent
            checkout_sessions = stripe.checkout.Session.list(
                payment_intent=billing.payment_intent_id
            )

            if checkout_sessions.data:
                session = checkout_sessions.data[0]
                checkout_session_id = session.id
                print(f"Checkout Session ID: {checkout_session_id}")
            else:
                # Option 2: Search by customer if Option 1 returns no results
                customer_checkout_sessions = stripe.checkout.Session.list(
                    customer=billing.stripe_customer_id,
                    limit=25
                )
                
                # You may need to filter these results to find the right session
                for session in customer_checkout_sessions:
                    if hasattr(session, 'payment_intent') and session.payment_intent == billing.payment_intent_id:
                        print(f"Checkout Session ID: {session.id}")
                        break
        elif billing.stripe_subscription_id:
            session = stripe.Subscription.retrieve(billing.stripe_subscription_id)

        data = {
            "email": billing.email,
            "amount": billing.amount,
            "stripe_customer_id": billing.stripe_customer_id,
            "stripe_subscription_id": billing.stripe_subscription_id,
            "payment_intent_id": billing.payment_intent_id,
            # "one_time_payment": billing.one_time_payment,
            "checkout_session": session,
            "customer": session.customer_details
        }
        serializer = PaymentBillingSerializer(billing)
        return Response(data, status=status.HTTP_200_OK)

    @action(methods=["POST"], detail=False)
    def create_payment_link(self, request):
        try:
            data = request.data

            price_id = data.get("price_id")
            amount = int(float(data.get("amount")) * 100)  # dollars → cents
            name = data.get("name")
            total_amount = data.get("total_amount")  # needed for later 60%
            require_shipping = data.get("require_shipping", False)
            shipping_id = data.get("shipping_id", None)

            # -------------------------------
            # Create Product
            # -------------------------------
            # product = stripe.Product.create(name=name)

            # -------------------------------
            # Create Price
            # -------------------------------
            # price = stripe.Price.create(
            #     unit_amount=amount,
            #     currency=currency,
            #     product=product.id,
            # )

            # -------------------------------
            # Optional Shipping
            # -------------------------------
            shipping_options = []
            if require_shipping:
                shipping_rate = stripe.ShippingRate.retrieve(shipping_id)

                shipping_options = [{"shipping_rate": shipping_rate.id}]

            # -------------------------------
            # Create Payment Link
            # -------------------------------
            payment_link = stripe.PaymentLink.create(
                line_items=[
                    {
                        "price": price_id,
                        "quantity": 1,
                    }
                ],
                shipping_options=shipping_options if require_shipping else None,
                after_completion = {
                    "type": "redirect",
                "redirect": {
        "url": "{{ FRONTEND_URL }}/thank-you?session_id={CHECKOUT_SESSION_ID}"
    }
                },
                billing_address_collection="required",
                payment_intent_data={
                    "setup_future_usage": "off_session"
                },
                metadata={
                    "name": "Partial Payment Billing",
                    "total_amount": total_amount or amount / 100,
                    "product_name": name
                },
                allow_promotion_codes=True,
                customer_creation="always",
                name_collection={
                    "individual": {
                        "enabled": True,
                        "optional": True
                    }
                },
                automatic_tax={
                    "enabled": True
                },
                # For shipping address, limit to US and Canada
                shipping_address_collection={
                    "allowed_countries": ["US", "CA"]
                },
            )

            return Response({
                "status": True,
                "payment_link": payment_link.url
            })

        except Exception as e:
            return Response({
                "status": False,
                "error": str(e)
            }, status=400)
