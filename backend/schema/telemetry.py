from pydantic import BaseModel
from datetime import datetime


class TelemetryBase(BaseModel):
    satellite_id: int
    signal_strength: float
    frequency: float
    packet_loss: float
    latency: float


class TelemetryCreate(TelemetryBase):
    pass


class TelemetryRead(TelemetryBase):
    id: int
    source: str
    created_at: datetime

    class Config:
        from_attributes = True