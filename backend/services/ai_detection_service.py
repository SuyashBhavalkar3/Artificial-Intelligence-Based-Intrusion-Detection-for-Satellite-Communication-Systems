from sqlalchemy.orm import Session
from typing import Dict

from ai.feature_engineering import FeatureEngineer
from ai.anomaly_model import AnomalyDetectionModel
from models.telemetry import Telemetry
from schema.threats import ThreatCreate
from services.threat_service import ThreatService
from services.audit_service import AuditService
from models.user import User
from core.config import settings


class AIDetectionService:
    def __init__(self, model: AnomalyDetectionModel):
        self.model = model

    def analyze_telemetry(
        self,
        db: Session,
        telemetry: Telemetry,
        baseline: Dict[str, float]
    ):
        
        features = FeatureEngineer.extract_features(
            telemetry=telemetry,
            baseline=baseline
        )
        
        print(f"[AI_SERVICE] Features extracted: {features}")

        result = self.model.predict(features)
        
        print(f"[AI_SERVICE] Prediction result: is_anomaly={result['is_anomaly']}, score={result['anomaly_score']}")

        if not result["is_anomaly"]:
            print(f"[AI_SERVICE] No anomaly detected (score={result['anomaly_score']}). Skipping threat creation.")
            return None
        
        print(f"[AI_SERVICE] Anomaly DETECTED! Proceeding to create threat...")
        
        threat = ThreatService.create_threat(
            db=db,
            threat_in=ThreatCreate(
                title="AI-Detected Intrusion",
                description=(
                    "Anomalous satellite communication detected "
                    f"(score={result['anomaly_score']})"
                ),
                threat_type="AI_ANOMALY",
                severity="HIGH",
                satellite_id=telemetry.satellite_id
            ),
            reporter=User(id=settings.AI_SYSTEM_USER_ID)  # AI system user (fixed ID)
        )

        AuditService.log(
            db=db,
            user=None,
            action="AI_THREAT_CREATED",
            resource=f"satellite:{telemetry.satellite_id}",
            details=f"Anomaly score: {result['anomaly_score']}"
        )

        print("AI RESULT:", result)

        return threat