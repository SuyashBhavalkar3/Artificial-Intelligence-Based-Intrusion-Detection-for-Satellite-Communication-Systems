import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text,
    DateTime, ForeignKey, Enum as SAEnum
)
from app.database import Base

class ThreatType(str, enum.Enum):
    jamming = "jamming"
    spoofing = "spoofing"
    replay = "replay"
    dos = "dos"
    normal = "normal"

class Severity(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class ThreatStatus(str, enum.Enum):
    open = "open"
    investigating = "investigating"
    resolved = "resolved"

class AlertChannel(str, enum.Enum):
    email = "email"
    slack = "slack"
    log = "log"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="analyst")  # admin / analyst
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class NetworkEvent(Base):
    __tablename__ = "network_events"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    src_ip = Column(String)
    dst_ip = Column(String)
    protocol = Column(String)
    payload_size = Column(Float)
    frequency = Column(Float)
    signal_strength = Column(Float)
    anomaly_score = Column(Float, nullable=True)
    raw_features = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

class Threat(Base):
    __tablename__ = "threats"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("network_events.id"))
    threat_type = Column(SAEnum(ThreatType), nullable=False)
    severity = Column(SAEnum(Severity), nullable=False)
    confidence = Column(Float)
    detection_method = Column(String)
    explanation = Column(Text, nullable=True)
    shap_values = Column(Text, nullable=True)  # JSON string
    status = Column(SAEnum(ThreatStatus), default=ThreatStatus.open)
    detected_at = Column(DateTime, default=datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    threat_id = Column(Integer, ForeignKey("threats.id"))
    channel = Column(SAEnum(AlertChannel), nullable=False)
    message = Column(Text)
    sent_at = Column(DateTime, default=datetime.utcnow)
    acknowledged = Column(Boolean, default=False)
    acknowledged_at = Column(DateTime, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String)
    resource = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String, nullable=True)
