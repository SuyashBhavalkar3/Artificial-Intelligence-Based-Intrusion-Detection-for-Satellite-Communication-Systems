from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from api.deps import get_db
from schema.user import UserCreate, UserRead
from schema.token import Token
from services.user_service import UserService
from core.security import create_access_token
from core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED
)
def register_user(
    user_in: UserCreate,
    db: Session = Depends(get_db)
):
    if UserService.get_by_username(db, user_in.username):
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )

    if UserService.get_by_email(db, user_in.email):
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    return UserService.create_user(db, user_in)

@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    user = UserService.authenticate(
        db,
        username=form_data.username,
        password=form_data.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    access_token = create_access_token(
        subject=user.username,
        expires_delta=access_token_expires
    )

    return Token(access_token=access_token)