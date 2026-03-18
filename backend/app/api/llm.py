import json
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.tables import Threat
from app.schemas.schemas import SummarizeRequest
from app.services import llm_service
from app.auth.dependencies import get_current_user
from app.websocket.manager import manager

router = APIRouter(prefix="/llm", tags=["llm"])

@router.post("/explain/{threat_id}")
def explain_threat(threat_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    threat = db.query(Threat).filter(Threat.id == threat_id).first()
    if not threat:
        raise HTTPException(status_code=404, detail="Threat not found")
    shap_vals = json.loads(threat.shap_values or "{}")
    threat_dict = {
        "id": threat.id,
        "threat_type": threat.threat_type.value,
        "severity": threat.severity.value,
        "confidence": threat.confidence,
        "detected_at": str(threat.detected_at),
    }
    explanation = llm_service.explain_threat(threat_dict, shap_vals)
    threat.explanation = explanation
    db.commit()
    return {"threat_id": threat_id, "explanation": explanation}

@router.post("/summarize")
def summarize(body: SummarizeRequest, db: Session = Depends(get_db), _=Depends(get_current_user)):
    threats = db.query(Threat).filter(Threat.id.in_(body.threat_ids)).all()
    threat_dicts = [
        {"id": t.id, "threat_type": t.threat_type.value, "severity": t.severity.value, "confidence": t.confidence}
        for t in threats
    ]
    summary = llm_service.summarize_incident(threat_dicts)
    return {"summary": summary}

@router.websocket("/chat")
async def chat_ws(websocket: WebSocket, db: Session = Depends(get_db)):
    await manager.connect(websocket)
    history = []
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            user_message = payload.get("message", "")

            # Build live context stats
            from app.models.tables import Alert
            from datetime import datetime, timedelta
            from sqlalchemy import func
            today = datetime.utcnow() - timedelta(hours=24)
            total_today = db.query(func.count(Threat.id)).filter(Threat.detected_at >= today).scalar()
            open_alerts = db.query(func.count(Alert.id)).filter(Alert.acknowledged == False).scalar()
            top_type = (
                db.query(Threat.threat_type, func.count())
                .group_by(Threat.threat_type)
                .order_by(func.count().desc())
                .first()
            )
            context = {
                "threats_today": total_today,
                "open_alerts": open_alerts,
                "top_threat_type": top_type[0].value if top_type else "none",
            }

            full_response = ""
            async for token in llm_service.stream_chat(history, user_message, context):
                await websocket.send_text(json.dumps({"type": "token", "data": token}))
                full_response += token

            history.append({"role": "user", "content": user_message})
            history.append({"role": "assistant", "content": full_response})
            await websocket.send_text(json.dumps({"type": "done"}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
