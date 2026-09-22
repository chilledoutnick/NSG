import sys
import types
import logging

logger = logging.getLogger(__name__)

try:
    import stripe
except ImportError:
    stripe = None

if stripe is not None:
    # Ensure stripe has .error submodule/attribute (Stripe SDK v7+ moved them to stripe._error)
    error_module = getattr(stripe, "_error", None)
    if error_module is None:
        error_module = getattr(stripe, "error", None)

    if error_module is None:
        error_mod = types.ModuleType("stripe.error")
        for exc_name in [
            "StripeError",
            "CardError",
            "InvalidRequestError",
            "AuthenticationError",
            "PermissionError",
            "RateLimitError",
            "APIConnectionError",
            "APIError",
            "SignatureVerificationError",
            "IdempotencyError",
        ]:
            exc = getattr(stripe, exc_name, Exception)
            setattr(error_mod, exc_name, exc)
        sys.modules["stripe.error"] = error_mod
        stripe.error = error_mod
    else:
        sys.modules.setdefault("stripe.error", error_module)
        if not hasattr(stripe, "error"):
            stripe.error = error_module

    StripeError = getattr(stripe, "StripeError", Exception)
    CardError = getattr(stripe, "CardError", StripeError)
    InvalidRequestError = getattr(stripe, "InvalidRequestError", StripeError)
    SignatureVerificationError = getattr(stripe, "SignatureVerificationError", StripeError)
else:
    class StripeError(Exception):
        user_message = "Stripe is not installed or configured."

    class CardError(StripeError):
        pass

    class InvalidRequestError(StripeError):
        pass

    class SignatureVerificationError(StripeError):
        pass

    dummy_stripe = types.ModuleType("stripe")
    dummy_error = types.ModuleType("stripe.error")
    for name, cls in [
        ("StripeError", StripeError),
        ("CardError", CardError),
        ("InvalidRequestError", InvalidRequestError),
        ("SignatureVerificationError", SignatureVerificationError),
    ]:
        setattr(dummy_error, name, cls)
        setattr(dummy_stripe, name, cls)

    dummy_stripe.error = dummy_error
    sys.modules["stripe"] = dummy_stripe
    sys.modules["stripe.error"] = dummy_error
    stripe = dummy_stripe

__all__ = [
    "stripe",
    "StripeError",
    "CardError",
    "InvalidRequestError",
    "SignatureVerificationError",
]

