import os
import pickle
import numpy as np
from app.ml.features import extract_features

SAVE_DIR = os.path.join(os.path.dirname(__file__), "saved_models")

def _load(name):
    path = os.path.join(SAVE_DIR, name)
    if not os.path.exists(path):
        return None
    with open(path, "rb") as f:
        return pickle.load(f)

_scaler = _load("scaler.pkl")
_iso = _load("isolation_forest.pkl")
_xgb = _load("xgb_classifier.pkl")

LABEL_MAP = {0: "normal", 1: "jamming", 2: "spoofing", 3: "replay", 4: "dos"}

def _severity(confidence: float, anomaly_score: float) -> str:
    if confidence >= 0.85 and anomaly_score >= 0.7:
        return "critical"
    if confidence >= 0.70 or anomaly_score >= 0.6:
        return "high"
    if confidence >= 0.50 or anomaly_score >= 0.4:
        return "medium"
    return "low"

def predict(event: dict) -> dict:
    vec, _ = extract_features(event)
    arr = vec.reshape(1, -1)

    if _scaler is None or _iso is None or _xgb is None:
        # Models not trained yet — return safe default
        return {"anomaly_score": 0.0, "is_threat": False, "threat_type": "normal", "severity": "low", "confidence": 0.0}

    scaled = _scaler.transform(arr)

    # IsolationForest: score_samples returns negative; convert to 0-1 anomaly score
    raw_score = float(_iso.score_samples(scaled)[0])
    anomaly_score = float(np.clip(1 - (raw_score + 0.5), 0, 1))

    proba = _xgb.predict_proba(scaled)[0]
    class_idx = int(np.argmax(proba))
    confidence = float(proba[class_idx])
    threat_type = LABEL_MAP[class_idx]
    is_threat = threat_type != "normal"

    return {
        "anomaly_score": round(anomaly_score, 4),
        "is_threat": is_threat,
        "threat_type": threat_type,
        "severity": _severity(confidence, anomaly_score),
        "confidence": round(confidence, 4),
    }
