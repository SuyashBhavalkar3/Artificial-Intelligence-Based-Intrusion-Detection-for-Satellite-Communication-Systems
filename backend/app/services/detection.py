import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.tables import NetworkEvent, Threat, ThreatType, Severity, ThreatStatus
from app.ml import inference, explainer
from app.services import alerting, blockchain_service, anomaly_analysis
from app.websocket.manager import manager
import hashlib

def run_detection(event_data: dict, db: Session) -> Threat:
    result = inference.predict(event_data)
    # Physics-Based core analysis (Signal Strength & Frequency)
    physics_res = anomaly_analysis.anomaly_analyzer.analyze_signal_anomalies(event_data)

    # Persist network event
    ts = event_data.get("timestamp")
    if isinstance(ts, str):
        try:
            ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        except ValueError:
            ts = datetime.now(timezone.utc)
    elif ts is None:
        ts = datetime.now(timezone.utc)

    event = NetworkEvent(
        src_ip=event_data.get("src_ip", ""),
        dst_ip=event_data.get("dst_ip", ""),
        protocol=event_data.get("protocol", ""),
        payload_size=event_data.get("payload_size", 0),
        frequency=event_data.get("frequency", 0),
        signal_strength=event_data.get("signal_strength", 0),
        anomaly_score=result["anomaly_score"],
        raw_features=json.dumps(event_data, default=str),
        timestamp=ts,
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
        ai_score=result["anomaly_score"],
        physics_score=physics_res["physics_anomaly_score"],
        signal_integrity=json.dumps(physics_res),
        detection_method="Hybrid AI + PHY-Layer Signal Analysis",
        shap_values=json.dumps(shap_vals),
        status=ThreatStatus.open,
    )
    db.add(threat)
    db.commit()
    db.refresh(threat)

    # Notarize on Blockchain
    try:
        # Simple integrity hash of the event
        event_str = f"{event.src_ip}-{event.dst_ip}-{event.timestamp.isoformat()}"
        event_hash = hashlib.sha256(event_str.encode()).hexdigest()

        # Ensure contract is deployed (for demo purposes)
        if not blockchain_service.blockchain_service.contract and blockchain_service.blockchain_service.is_connected():
            blockchain_service.blockchain_service.compile_and_deploy()

        receipt = blockchain_service.blockchain_service.record_threat(
            threat.id,
            threat.threat_type.value,
            threat.severity.value,
            int(threat.detected_at.timestamp()),
            event_hash
        )
        if receipt:
            threat.blockchain_tx_hash = receipt.transactionHash.hex()
            threat.blockchain_block_number = receipt.blockNumber
            db.commit()
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Blockchain notarization failed: {e}")

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
