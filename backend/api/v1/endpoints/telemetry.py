from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi import BackgroundTasks
from services.ai_background_tasks_service import analyze_telemetry_background
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
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    telemetry = TelemetryService.ingest(
        db=db,
        telemetry_in=telemetry_in,
        user=current_user
    )
    
    background_tasks.add_task(
    analyze_telemetry_background,
    telemetry.id
    )
    
    # DEBUG: Log background task enqueue
    print(f"[TELEMETRY_ENDPOINT] Background task enqueued for telemetry_id={telemetry.id}")

    return telemetry