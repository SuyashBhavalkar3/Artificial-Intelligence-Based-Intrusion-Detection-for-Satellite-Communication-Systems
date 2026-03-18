from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from app.database import get_db
from app.models.tables import Alert
from app.schemas.schemas import AlertOut
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("", response_model=list[AlertOut])
def list_alerts(
    acknowledged: Optional[bool] = None,
    channel: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(Alert)
    if acknowledged is not None:
        q = q.filter(Alert.acknowledged == acknowledged)
    if channel:
        q = q.filter(Alert.channel == channel)
    return q.order_by(Alert.sent_at.desc()).offset(skip).limit(limit).all()

@router.patch("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.acknowledged = True
    alert.acknowledged_at = datetime.utcnow()
    db.commit()
    return {"id": alert_id, "acknowledged": True}
