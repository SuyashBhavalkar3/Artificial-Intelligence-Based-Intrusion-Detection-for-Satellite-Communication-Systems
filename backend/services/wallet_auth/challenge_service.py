import secrets
from datetime import datetime, timedelta

# TEMP storage (replace with Redis later)
_wallet_challenges = {}

def create_wallet_challenge(wallet_address: str) -> str:
    nonce = secrets.token_hex(16)

    _wallet_challenges[wallet_address.lower()] = {
        "nonce": nonce,
        "expires_at": datetime.utcnow() + timedelta(minutes=5)
    }

    return f"Sign this message to authenticate. Nonce: {nonce}"