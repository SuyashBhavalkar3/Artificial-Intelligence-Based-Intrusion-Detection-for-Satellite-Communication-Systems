from db.sessions import SessionLocal
from services.ai_detection_service import AIDetectionService
from ai.anomaly_model import AnomalyDetectionModel
from models.telemetry import Telemetry as TelemetryModel

# Singleton model (loaded once)
ai_model = AnomalyDetectionModel()

# Example training (demo only – later trained offline)
ai_model.train([
    # Normal readings
    {
        "signal_delta": -2,
        "frequency_drift": 1,
        "packet_loss_ratio": 0.01,
        "latency_spike": 5,
        "anomaly_score_hint": 2
    },
    {
        "signal_delta": -3,
        "frequency_drift": 2,
        "packet_loss_ratio": 0.02,
        "latency_spike": 8,
        "anomaly_score_hint": 3
    },
    {
        "signal_delta": -1,
        "frequency_drift": 0.5,
        "packet_loss_ratio": 0.01,
        "latency_spike": 3,
        "anomaly_score_hint": 1.5
    },
    # Anomalies
    {
        "signal_delta": -50,
        "frequency_drift": 100,
        "packet_loss_ratio": 0.8,
        "latency_spike": 1000,
        "anomaly_score_hint": 200
    },
    {
        "signal_delta": -25,
        "frequency_drift": 30,
        "packet_loss_ratio": 0.4,
        "latency_spike": 300,
        "anomaly_score_hint": 50
    }
])

print("AI MODEL TRAINED:", ai_model.is_trained)

ai_service = AIDetectionService(ai_model)

BASELINE = {
    "signal_strength": -70.0,
    "frequency": 1450.0,
    "latency": 100.0
}


def analyze_telemetry_background(
    telemetry_id: int
):
    db = SessionLocal()
    try:
        telemetry = (
            db.query(TelemetryModel)
            .filter(TelemetryModel.id == telemetry_id)
            .first()
        )
        
        print(f"[BG_TASK] Started for telemetry_id={telemetry_id}")

        if not telemetry:
            print(f"[BG_TASK] Telemetry ID {telemetry_id} not found!")
            return
        
        print(f"[BG_TASK] Fetched telemetry: satellite_id={telemetry.satellite_id}, signal={telemetry.signal_strength}")

        ai_service.analyze_telemetry(
            db=db,
            telemetry=telemetry,
            baseline=BASELINE
        )
        
    except Exception as e:
        print(f"[BG_TASK] EXCEPTION in analyze_telemetry: {type(e).__name__}: {e}")
    finally:
        db.close()