from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from api.deps import require_admin
from api.deps import get_db, get_current_user
from schema.satellite import SatelliteCreate, SatelliteRead
from services.satellite_service import SatelliteService
from models.user import User

router = APIRouter(prefix="/satellites", tags=["Satellites"])

@router.post(
    "",
    response_model=SatelliteRead,
    status_code=status.HTTP_201_CREATED
)
def create_satellite(
    satellite_in: SatelliteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return SatelliteService.create_satellite(
        db=db,
        satellite_in=satellite_in,
        owner=current_user
    )

@router.get(
    "",
    response_model=List[SatelliteRead]
)
def list_satellites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return SatelliteService.list_satellites(
        db=db,
        owner=current_user
    )

@router.get(
    "/{satellite_id}",
    response_model=SatelliteRead
)
def get_satellite(
    satellite_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    satellite = SatelliteService.get_satellite_by_id(
        db=db,
        satellite_id=satellite_id,
        owner=current_user
    )

    if not satellite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Satellite not found"
        )

    return satellite

@router.get(
    "/admin/all",
    response_model=List[SatelliteRead],
    tags=["Admin"]
)
def admin_list_all_satellites(
    db: Session = Depends(get_db),
    _admin_user: User = Depends(require_admin)
):
    return SatelliteService.list_all_satellites(db)