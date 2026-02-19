from pydantic import BaseModel
from datetime import datetime
from utils.timezone import utc_to_ist


class ThreatBase(BaseModel):
    title: str
    description: str
    threat_type: str
    severity: str


class ThreatCreate(ThreatBase):
    satellite_id: int


class ThreatRead(ThreatBase):
    id: int
    status: str
    satellite_id: int
    reported_by_id: int
    created_at: datetime

    @classmethod
    def from_orm(cls, obj):
        obj.created_at = utc_to_ist(obj.created_at)
        return super().from_orm(obj)

    class Config:
        from_attributes = True


class ThreatStatusUpdate(BaseModel):
    status: str