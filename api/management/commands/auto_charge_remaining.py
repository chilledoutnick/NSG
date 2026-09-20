from django.core.management.base import BaseCommand
from django.utils import timezone
import stripe
from api.models.PaymentBilling import Order

class Command(BaseCommand):
    help = "Auto charge remaining amount after 15 days"

    def handle(self, *args, **kwargs):
        orders = Order.objects.filter(
            deposit_paid=True,
            remaining_paid=False,
            auto_charge_date__lte=timezone.now()
        )
        self.stdout.write(f"auto_charge_remaining: Charged remaining for {orders.count()} {timezone.now()}")

        for order in orders:
            try:
                payment_intent = stripe.PaymentIntent.create(
                    amount=int(order.remaining_amount * 100),
                    currency="usd",
                    customer=order.stripe_customer_id,
                    payment_method=order.stripe_payment_method_id,
                    off_session=True,
                    confirm=True
                )

                order.remaining_paid = True
                order.status = "paid"
                order.save()

                self.stdout.write(f"Charged remaining for {order.email} {payment_intent}")

            except stripe.error.CardError as e:
                order.status = "failed"
                order.save()

                self.stdout.write(f"Failed payment for {order.email}")
        self.stdout.write(f"Charged remaining")