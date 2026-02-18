from pydantic import BaseModel
from datetime import datetime


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
    
class ThreatStatusUpdate(BaseModel):
    status: str

    class Config:
        from_attributes = True