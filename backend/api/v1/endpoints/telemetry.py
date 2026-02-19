from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.deps import get_db, get_current_user
from schema.telemetry import TelemetryCreate, TelemetryRead
from services.telemetry_service import TelemetryService
from models.user import User

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])

@router.post(
    "",
    response_model=TelemetryRead,
    status_code=status.HTTP_201_CREATED
)
def ingest_telemetry(
    telemetry_in: TelemetryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return TelemetryService.ingest(
            db=db,
            telemetry_in=telemetry_in,
            user=current_user
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Satellite not found or access denied"
        )