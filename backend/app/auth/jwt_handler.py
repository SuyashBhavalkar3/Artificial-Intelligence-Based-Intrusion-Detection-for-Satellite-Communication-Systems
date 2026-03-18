from datetime import datetime, timedelta
from jose import JWTError, jwt
from app.config import settings

def _build_payload(sub: str, token_type: str, expires_delta: timedelta) -> dict:
    return {
        "sub": sub,
        "type": token_type,
        "exp": datetime.utcnow() + expires_delta,
    }

def create_access_token(subject: str) -> str:
    payload = _build_payload(
        subject, "access",
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(subject: str) -> str:
    payload = _build_payload(
        subject, "refresh",
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> dict:
    # Raises JWTError on invalid/expired token
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
