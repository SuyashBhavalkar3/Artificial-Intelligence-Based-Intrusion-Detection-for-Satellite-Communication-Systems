import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.tables import NetworkEvent, Threat, ThreatType, Severity, ThreatStatus
from app.ml import inference, explainer
from app.services import alerting
from app.websocket.manager import manager

def run_detection(event_data: dict, db: Session) -> Threat:
    result = inference.predict(event_data)

    # Persist network event
    event = NetworkEvent(
        src_ip=event_data.get("src_ip", ""),
        dst_ip=event_data.get("dst_ip", ""),
        protocol=event_data.get("protocol", ""),
        payload_size=event_data.get("payload_size", 0),
        frequency=event_data.get("frequency", 0),
        signal_strength=event_data.get("signal_strength", 0),
        anomaly_score=result["anomaly_score"],
        raw_features=json.dumps(event_data, default=str),
        timestamp=event_data.get("timestamp") or datetime.utcnow(),
    )
    db.add(event)
    db.flush()

    threat_type = ThreatType(result["threat_type"])
    severity = Severity(result["severity"])

    shap_vals = {}
    if result["is_threat"]:
        shap_vals = explainer.explain(event_data)

    threat = Threat(
        event_id=event.id,
        threat_type=threat_type,
        severity=severity,
        confidence=result["confidence"],
        detection_method="IsolationForest+XGBoost",
        shap_values=json.dumps(shap_vals),
        status=ThreatStatus.open,
    )
    db.add(threat)
    db.commit()
    db.refresh(threat)

    if result["is_threat"] and severity in (Severity.high, Severity.critical):
        alerting.dispatch_alert(threat, db)

    # Broadcast to WebSocket clients
    import asyncio
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(manager.broadcast_threat({
                "id": threat.id,
                "threat_type": threat.threat_type.value,
                "severity": threat.severity.value,
                "confidence": threat.confidence,
            }))
    except Exception:
        pass

    return threat
