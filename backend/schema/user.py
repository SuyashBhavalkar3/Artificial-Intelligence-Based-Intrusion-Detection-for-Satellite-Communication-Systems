from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


# Shared properties
class UserBase(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    wallet_address: Optional[str] = None
    is_active: bool = True


# Used when creating a user (password-based)
class UserCreate(UserBase):
    password: Optional[str] = None


# Used when returning user data
class UserRead(UserBase):
    id: int
    is_superuser: bool
    created_at: datetime

    class Config:
        from_attributes = True
