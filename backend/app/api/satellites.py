from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime
from app.database import get_db
from app.models.tables import Satellite
from app.auth.dependencies import get_current_user, require_role

router = APIRouter(prefix="/satellites", tags=["satellites"])

class SatelliteCreate(BaseModel):
    name: str
    norad_id: str
    status: str = "active"

class SatelliteResponse(BaseModel):
    id: int
    name: str
    norad_id: str
    status: str
    encryption_key_status: str
    last_contact: datetime

    class Config:
        from_attributes = True

@router.get("", response_model=List[SatelliteResponse])
def list_satellites(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Satellite).all()

@router.post("", response_model=SatelliteResponse)
def add_satellite(
    sat: SatelliteCreate, 
    db: Session = Depends(get_db), 
    _=Depends(require_role("admin"))
):
    db_sat = Satellite(name=sat.name, norad_id=sat.norad_id, status=sat.status)
    db.add(db_sat)
    try:
        db.commit()
        db.refresh(db_sat)
        return db_sat
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Satellite already exists or invalid data")

@router.delete("/{sat_id}")
def delete_satellite(
    sat_id: int, 
    db: Session = Depends(get_db), 
    _=Depends(require_role("admin"))
):
    sat = db.query(Satellite).filter(Satellite.id == sat_id).first()
    if not sat:
        raise HTTPException(status_code=404, detail="Satellite not found")
    db.delete(sat)
    db.commit()
    return {"message": "Satellite removed"}

@router.post("/{sat_id}/command")
def send_command(
    sat_id: int,
    command: str,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin"))
):
    """
    Simulates sending a cryptographically signed command to a specific satellite.
    """
    sat = db.query(Satellite).filter(Satellite.id == sat_id).first()
    if not sat:
        raise HTTPException(status_code=404, detail="Satellite not found")
    
    # Update last contact
    sat.last_contact = datetime.utcnow()
    db.commit()
    
    return {
        "status": "command_transmitted",
        "satellite": sat.name,
        "command": command,
        "security": "AES-256-GCM + ECC Signed",
        "pqc_verification": "Kyber-KEM Verified"
    }
