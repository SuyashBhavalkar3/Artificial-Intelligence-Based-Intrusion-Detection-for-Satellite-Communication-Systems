import os
import pickle
import numpy as np
import shap
from app.ml.features import extract_features, FEATURE_NAMES

SAVE_DIR = os.path.join(os.path.dirname(__file__), "saved_models")

def _load(name):
    path = os.path.join(SAVE_DIR, name)
    if not os.path.exists(path):
        return None
    with open(path, "rb") as f:
        return pickle.load(f)

_xgb = _load("xgb_classifier.pkl")
_scaler = _load("scaler.pkl")
_explainer = shap.TreeExplainer(_xgb) if _xgb is not None else None

def explain(event: dict) -> dict:
    if _explainer is None or _scaler is None:
        return {}
    vec, _ = extract_features(event)
    scaled = _scaler.transform(vec.reshape(1, -1))
    shap_values = _explainer.shap_values(scaled)  # shape: (n_classes, 1, n_features) or (1, n_features)

    # For multi-class, sum absolute SHAP across classes for overall feature importance
    if isinstance(shap_values, list):
        combined = np.sum([np.abs(sv[0]) for sv in shap_values], axis=0)
    else:
        combined = np.abs(shap_values[0])

    result = dict(zip(FEATURE_NAMES, combined.tolist()))
    return dict(sorted(result.items(), key=lambda x: x[1], reverse=True))
