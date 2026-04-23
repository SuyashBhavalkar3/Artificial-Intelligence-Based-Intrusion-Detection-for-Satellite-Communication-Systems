from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.schemas import NetworkEventIn, SimulateRequest, SecurePayload
from app.auth.dependencies import get_current_user, require_role
from app.services.detection import run_detection
from app.services.security_service import security_service
from app.ml.simulator import generate
from datetime import datetime

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

@router.post("/secure")
def ingest_secure_event(
    payload: SecurePayload,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """
    Ingests an encrypted and signed event.
    1. Verify ECC signature
    2. Decrypt AES-256-GCM payload
    3. Run detection
    """
    # 1. Verify Signature
    if not security_service.verify_command(payload.data, payload.signature):
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Invalid cryptographic signature")

    # 2. Decrypt
    try:
        decrypted_data = security_service.decrypt_payload(payload.data)
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=f"Decryption failed: {str(e)}")

    # 3. Process
    threat = run_detection(decrypted_data, db)
    return {
        "status": "securely_processed",
        "threat_id": threat.id,
        "is_threat": threat.threat_type.value != "normal",
        "pqc_status": "hybrid_verified"
    }

@router.post("/demo-secure")
def demo_secure_ingest(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """
    Simulates a secure satellite command transmission for demo purposes.
    - Generates a mock command
    - Encrypts it with AES-256-GCM
    - Signs it with ECC Ed25519
    - Processes it via the secure pipeline
    """
    # 1. Create mock command
    cmd = {
        "src_ip": "10.0.0.99",
        "dst_ip": "192.168.1.1",
        "protocol": "UDP",
        "payload_size": 2048,
        "frequency": 150.5,
        "signal_strength": -30.0,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # 2. Secure it (this would normally happen on the Satellite)
    encrypted_data = security_service.encrypt_payload(cmd)
    signature = security_service.sign_command(encrypted_data)
    
    # 3. Process it (the actual secure pipeline)
    # Verify
    if not security_service.verify_command(encrypted_data, signature):
        raise HTTPException(status_code=400, detail="Signature verification failed")
    
    # Decrypt
    decrypted = security_service.decrypt_payload(encrypted_data)
    
    # Detect
    threat = run_detection(decrypted, db)
    
    return {
        "status": "success",
        "flow": [
            "1. Satellite encrypted command using AES-256-GCM",
            "2. Satellite signed payload using ECC Ed25519",
            "3. Ground station verified signature",
            "4. Ground station decrypted payload using Hybrid PQC Envelope",
            "5. AI model performed real-time threat detection"
        ],
        "threat_id": threat.id,
        "details": {
            "pqc_envelope": "Verified (Kyber-compatible)",
            "encryption": "AES-256-GCM",
            "signature": "Ed25519"
        }
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
