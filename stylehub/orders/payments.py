import requests
from django.conf import settings

BASE_URL = "https://accept.paymob.com/api"


def get_auth_token():
    response = requests.post(
        f"{BASE_URL}/auth/tokens",
        json={
            "api_key": settings.PAYMOB_API_KEY
        }
    )
    response.raise_for_status()
    return response.json()["token"]


def create_payment_order(auth_token, amount_cents):
    response = requests.post(
        f"{BASE_URL}/ecommerce/orders",
        headers={
            "Authorization": f"Bearer {auth_token}"
        },
        json={
            "amount_cents": amount_cents,
            "currency": "EGP",
            "delivery_needed": False
        }
    )
    response.raise_for_status()
    return response.json()["id"]


def get_payment_key(auth_token, order_id, amount_cents, billing_data):
    response = requests.post(
        f"{BASE_URL}/acceptance/payment_keys",
        headers={
            "Authorization": f"Bearer {auth_token}"
        },
        json={
            "amount_cents": amount_cents,
            "expiration": 3600,
            "order_id": order_id,
            "billing_data": billing_data,
            "currency": "EGP",
            "integration_id": settings.PAYMOB_INTEGRATION_ID
        }
    )
    response.raise_for_status()
    return response.json()["token"]
