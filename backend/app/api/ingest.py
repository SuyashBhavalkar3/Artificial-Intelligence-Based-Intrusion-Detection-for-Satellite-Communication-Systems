from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.schemas import NetworkEventIn, SimulateRequest
from app.auth.dependencies import get_current_user, require_role
from app.services.detection import run_detection
from app.ml.simulator import generate

router = APIRouter(prefix="/ingest", tags=["ingest"])

@router.post("")
def ingest_event(
    event: NetworkEventIn,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    threat = run_detection(event.model_dump(), db)
    return {
        "threat_id": threat.id,
        "threat_type": threat.threat_type.value,
        "severity": threat.severity.value,
        "confidence": threat.confidence,
        "is_threat": threat.threat_type.value != "normal",
    }

@router.post("/simulate")
def simulate_and_ingest(
    body: SimulateRequest,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):
    df = generate(n_samples=body.n_samples, attack_ratio=body.attack_ratio)
    results = {"total": len(df), "threats": 0, "by_type": {}}
    for _, row in df.iterrows():
        row_dict = {
            k: (v.isoformat() if hasattr(v, "isoformat") else v)
            for k, v in row.to_dict().items()
        }
        threat = run_detection(row_dict, db)
        t = threat.threat_type.value
        results["by_type"][t] = results["by_type"].get(t, 0) + 1
        if t != "normal":
            results["threats"] += 1
    return results
