from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Optional
from app.database import get_db
from app.models.tables import Threat, ThreatType, Severity, ThreatStatus
from app.schemas.schemas import ThreatOut, ThreatStatusUpdate
from app.auth.dependencies import get_current_user
from app.services.blockchain_service import blockchain_service
import hashlib

router = APIRouter(prefix="/threats", tags=["threats"])

@router.get("", response_model=list[ThreatOut])
def list_threats(
    severity: Optional[str] = None,
    threat_type: Optional[str] = None,
    status: Optional[str] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(Threat)
    if severity:
        q = q.filter(Threat.severity == Severity(severity))
    if threat_type:
        q = q.filter(Threat.threat_type == ThreatType(threat_type))
    if status:
        q = q.filter(Threat.status == ThreatStatus(status))
    if from_date:
        q = q.filter(Threat.detected_at >= from_date)
    if to_date:
        q = q.filter(Threat.detected_at <= to_date)
    return q.order_by(Threat.detected_at.desc()).offset(skip).limit(limit).all()

@router.get("/stats/summary")
def threat_summary(db: Session = Depends(get_db), _=Depends(get_current_user)):
    by_severity = {r[0].value: r[1] for r in db.query(Threat.severity, func.count()).group_by(Threat.severity).all()}
    by_type = {r[0].value: r[1] for r in db.query(Threat.threat_type, func.count()).group_by(Threat.threat_type).all()}
    by_method = {r[0]: r[1] for r in db.query(Threat.detection_method, func.count()).group_by(Threat.detection_method).all()}
    cutoff = datetime.utcnow() - timedelta(hours=24)
    trend = (
        db.query(func.strftime("%H", Threat.detected_at).label("hour"), func.count())
        .filter(Threat.detected_at >= cutoff)
        .group_by("hour")
        .all()
    )
    return {
        "by_severity": by_severity,
        "by_type": by_type,
        "by_detection_method": by_method,
        "trend_last_24h": {r[0]: r[1] for r in trend},
    }

@router.get("/{threat_id}", response_model=ThreatOut)
def get_threat(threat_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    threat = db.query(Threat).filter(Threat.id == threat_id).first()
    if not threat:
        raise HTTPException(status_code=404, detail="Threat not found")
    return threat

@router.patch("/{threat_id}/status")
def update_status(
    threat_id: int,
    body: ThreatStatusUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    threat = db.query(Threat).filter(Threat.id == threat_id).first()
    if not threat:
        raise HTTPException(status_code=404, detail="Threat not found")
    threat.status = ThreatStatus(body.status)
    db.commit()
    return {"id": threat_id, "status": body.status}

@router.get("/{threat_id}/blockchain")
def verify_on_blockchain(threat_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    threat = db.query(Threat).filter(Threat.id == threat_id).first()
    if not threat:
        raise HTTPException(status_code=404, detail="Threat not found")
    
    # 1. Fetch data from blockchain
    on_chain_data = blockchain_service.get_threat(threat_id)
    if not on_chain_data or on_chain_data[0] == 0:
        return {"status": "not_found", "message": "No record found on blockchain"}

    # blockchain returns (id, type, severity, timestamp, eventHash)
    bc_id, bc_type, bc_severity, bc_ts, bc_hash = on_chain_data

    # 2. Local integrity check
    from app.models.tables import NetworkEvent
    event = db.query(NetworkEvent).filter(NetworkEvent.id == threat.event_id).first()
    event_str = f"{event.src_ip}-{event.dst_ip}-{event.timestamp.isoformat()}"
    local_hash = hashlib.sha256(event_str.encode()).hexdigest()

    is_valid = (
        bc_type == threat.threat_type.value and
        bc_severity == threat.severity.value and
        bc_hash == local_hash
    )

    return {
        "status": "valid" if is_valid else "tampered",
        "blockchain": {
            "threat_id": bc_id,
            "threat_type": bc_type,
            "severity": bc_severity,
            "timestamp": bc_ts,
            "event_hash": bc_hash
        },
        "local": {
            "threat_type": threat.threat_type.value,
            "severity": threat.severity.value,
            "event_hash": local_hash
        },
        "tx_hash": threat.blockchain_tx_hash,
        "block_number": threat.blockchain_block_number
    }
