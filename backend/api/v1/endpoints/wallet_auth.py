from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from services.wallet_auth.challenge_service import create_wallet_challenge
from services.wallet_auth.verification_service import verify_wallet_signature
from services.wallet_auth.wallet_user_service import get_or_create_wallet_user
from core.security import create_access_token
from api.deps import get_db

router = APIRouter(
    prefix="/auth/wallet",
    tags=["Wallet Authentication"]
)

@router.post("/challenge")
def wallet_challenge(wallet_address: str):
    return {
        "message": create_wallet_challenge(wallet_address)
    }

@router.post("/verify")
def wallet_verify(
    wallet_address: str,
    signature: str,
    message: str,
    db: Session = Depends(get_db)
):
    if not verify_wallet_signature(wallet_address, signature, message):
        raise HTTPException(status_code=401, detail="Invalid wallet signature")

    user = get_or_create_wallet_user(db, wallet_address)

    token = create_access_token({
        "sub": str(user.id),
        "auth_method": "wallet"
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }