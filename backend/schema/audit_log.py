from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AuditLogRead(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    resource: str
    details: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True