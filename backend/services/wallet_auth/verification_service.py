from eth_account.messages import encode_defunct
from eth_account import Account
from datetime import datetime

from .challenge_service import _wallet_challenges

def verify_wallet_signature(
    wallet_address: str,
    signature: str,
    message: str
) -> bool:
    wallet_address = wallet_address.lower()

    challenge = _wallet_challenges.get(wallet_address)
    if not challenge:
        return False

    if datetime.utcnow() > challenge["expires_at"]:
        return False

    if challenge["nonce"] not in message:
        return False

    msg = encode_defunct(text=message)
    recovered_address = Account.recover_message(msg, signature=signature)

    return recovered_address.lower() == wallet_address