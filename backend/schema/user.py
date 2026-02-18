from pydantic import BaseModel, EmailStr
from datetime import datetime


# Shared properties
class UserBase(BaseModel):
    username: str
    email: EmailStr
    is_active: bool = True


# Used when creating a user
class UserCreate(UserBase):
    password: str


# Used when returning user data
class UserRead(UserBase):
    id: int
    is_superuser: bool
    created_at: datetime

    class Config:
        from_attributes = True
