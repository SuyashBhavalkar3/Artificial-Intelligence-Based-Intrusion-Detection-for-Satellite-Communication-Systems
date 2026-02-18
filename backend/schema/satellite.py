from pydantic import BaseModel
from datetime import datetime


class SatelliteBase(BaseModel):
    name: str
    orbit_type: str
    operator: str


class SatelliteCreate(SatelliteBase):
    pass


class SatelliteRead(SatelliteBase):
    id: int
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True