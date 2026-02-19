from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String
from sqlalchemy.sql import func

from db.base import Base


class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, index=True)

    satellite_id = Column(Integer, ForeignKey("satellites.id"), nullable=False)

    signal_strength = Column(Float, nullable=False)
    frequency = Column(Float, nullable=False)
    packet_loss = Column(Float, nullable=False)
    latency = Column(Float, nullable=False)

    source = Column(String(50), default="GROUND_STATION")

    created_at = Column(DateTime(timezone=True), server_default=func.now())