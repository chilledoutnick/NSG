from django.db import models

class PaymentBilling(models.Model):
    billing_id = models.AutoField(primary_key=True)

    # For both one-time and subscription
    email = models.EmailField(unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    stripe_customer_id = models.CharField(max_length=255)

    # For subscriptions only
    set_up_intent_id = models.CharField(max_length=255, null=True, blank=True, unique=True)
    stripe_subscription_id = models.CharField(max_length=255, null=True, blank=True)

    # For one-time payments only
    payment_intent_id = models.CharField(max_length=255, null=True, blank=True, unique=True)

    # Distinguish between payment types
    is_subscription = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)



class Order(models.Model):
    email = models.EmailField()
    stripe_customer_id = models.CharField(max_length=255, null=True, blank=True)
    stripe_payment_method_id = models.CharField(max_length=255, null=True, blank=True)

    total_amount = models.FloatField()
    deposit_amount = models.FloatField()
    remaining_amount = models.FloatField()

    deposit_paid = models.BooleanField(default=False)
    remaining_paid = models.BooleanField(default=False)

    auto_charge_date = models.DateTimeField(null=True, blank=True)

    status = models.CharField(max_length=50, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)