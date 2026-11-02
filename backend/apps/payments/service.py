import hmac
import hashlib
from django.conf import settings
from apps.common.mongo import get_db, now_utc, to_object_id

class PaymentGatewayService:
    """Payment Gateway abstraction supporting sandbox/development mode and provider verification."""

    @staticmethod
    def create_payment_order(order_id, amount_cents, currency="INR"):
        # Development / Sandbox mock transaction reference
        tx_id = f"tx_nbz_{order_id}_{int(now_utc().timestamp())}"
        signature = hmac.new(
            settings.SECRET_KEY.encode(),
            f"{order_id}|{amount_cents}|{tx_id}".encode(),
            hashlib.sha256
        ).hexdigest()

        return {
            'transaction_id': tx_id,
            'amount_cents': amount_cents,
            'currency': currency,
            'signature': signature,
            'mode': 'SANDBOX_DEV_MODE',
            'gateway_note': 'Test sandbox active - no real financial charge processed.'
        }

    @staticmethod
    def verify_payment_callback(order_id, amount_cents, tx_id, provided_signature):
        expected_sig = hmac.new(
            settings.SECRET_KEY.encode(),
            f"{order_id}|{amount_cents}|{tx_id}".encode(),
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(expected_sig, provided_signature)
