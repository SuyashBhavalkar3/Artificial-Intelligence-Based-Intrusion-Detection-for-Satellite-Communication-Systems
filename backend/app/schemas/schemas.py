from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

# --- Auth ---
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

class UserOut(BaseModel):
    id: int
    username: str
    role: str
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

# --- Network Event ---
class NetworkEventIn(BaseModel):
    src_ip: str
    dst_ip: str
    protocol: str
    payload_size: float
    frequency: float
    signal_strength: float
    timestamp: Optional[datetime] = None

class NetworkEventOut(NetworkEventIn):
    id: int
    anomaly_score: Optional[float]
    created_at: datetime
    class Config:
        from_attributes = True

# --- Threat ---
class ThreatOut(BaseModel):
    id: int
    event_id: int
    threat_type: str
    severity: str
    confidence: float
    detection_method: str
    explanation: Optional[str]
    shap_values: Optional[str]
    status: str
    detected_at: datetime
    blockchain_tx_hash: Optional[str] = None
    blockchain_block_number: Optional[int] = None
    class Config:
        from_attributes = True

class ThreatStatusUpdate(BaseModel):
    status: str  # open / investigating / resolved

# --- Alert ---
class AlertOut(BaseModel):
    id: int
    threat_id: int
    channel: str
    message: str
    sent_at: datetime
    acknowledged: bool
    acknowledged_at: Optional[datetime]
    class Config:
        from_attributes = True

# --- LLM ---
class SummarizeRequest(BaseModel):
    threat_ids: List[int]

class ChatMessage(BaseModel):
    role: str
    content: str

# --- Simulate ---
class SimulateRequest(BaseModel):
    n_samples: int = 100
    attack_ratio: float = 0.3
