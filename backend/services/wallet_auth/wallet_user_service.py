from sqlalchemy.orm import Session
from models.user import User

def get_or_create_wallet_user(
    db: Session,
    wallet_address: str
) -> User:
    wallet_address = wallet_address.lower()

    user = db.query(User).filter(
        User.wallet_address == wallet_address
    ).first()

    if user:
        return user

    user = User(wallet_address=wallet_address)
    db.add(user)
    db.commit()
    db.refresh(user)

    return user