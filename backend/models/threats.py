from sqlalchemy import (
    Column,
    Float,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey, 
    Float
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from db.base import Base


class Threat(Base):
    __tablename__ = "threats"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(150), nullable=False, index=True)
    description = Column(Text, nullable=False)

    threat_type = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False)
    status = Column(String(20), default="DETECTED")

    threat_score = Column(Float, nullable=True)
    ai_explanation = Column(Text, nullable=True)

    satellite_id = Column(
        Integer,
        ForeignKey("satellites.id", ondelete="CASCADE"),
        nullable=False
    )

    reported_by_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    satellite = relationship("Satellite", backref="threats")
    reported_by = relationship("User")
