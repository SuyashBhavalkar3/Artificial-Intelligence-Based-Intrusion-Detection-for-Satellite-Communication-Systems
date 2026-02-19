from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from api.deps import require_admin
from api.deps import get_db, get_current_user
from schema.threats import ThreatCreate, ThreatRead
from services.threat_service import ThreatService
from models.user import User
from schema.threats import ThreatStatusUpdate
from api.deps import require_admin
from services.audit_service import AuditService

router = APIRouter(prefix="/threats", tags=["Threats"])

@router.post(
    "",
    response_model=ThreatRead,
    status_code=status.HTTP_201_CREATED
)
def create_threat(
    threat_in: ThreatCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return ThreatService.create_threat(
            db=db,
            threat_in=threat_in,
            reporter=current_user
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Satellite not found or access denied"
        )

@router.get(
    "",
    response_model=List[ThreatRead]
)
def list_threats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ThreatService.list_threats(
        db=db,
        reporter=current_user
    )

@router.get(
    "/{threat_id}",
    response_model=ThreatRead
)
def get_threat(
    threat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    threat = ThreatService.get_threat_by_id(
        db=db,
        threat_id=threat_id,
        reporter=current_user
    )

    if not threat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Threat not found"
        )

    return threat

@router.get(
    "/admin/all",
    response_model=List[ThreatRead],
    tags=["Admin"]
)
def admin_list_all_threats(
    db: Session = Depends(get_db),
    _admin_user: User = Depends(require_admin)
):
    return ThreatService.list_all_threats(db)

@router.patch(
    "/{threat_id}/status",
    response_model=ThreatRead,
    tags=["Admin"]
)
def update_threat_status(
    threat_id: int,
    status_in: ThreatStatusUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    try:
        updated_threat = ThreatService.update_threat_status(
            db=db,
            threat_id=threat_id,
            new_status=status_in.status
        )

        AuditService.log(
            db=db,
            user=admin_user,
            action="UPDATE_THREAT_STATUS",
            resource=f"threat:{threat_id}",
            details=f"Status changed to {status_in.status}"
        )
        
        return updated_threat
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
