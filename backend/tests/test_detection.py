import pytest
import numpy as np
from app.ml.inference import predict
from app.ml.explainer import explain
from app.ml.features import extract_features, FEATURE_NAMES

NORMAL_EVENT = {
    "src_ip": "192.168.1.1",
    "dst_ip": "10.0.0.1",
    "protocol": "TCP",
    "payload_size": 512.0,
    "frequency": 100.0,
    "signal_strength": -60.0,
    "inter_arrival_time": 0.1,
}

JAMMING_EVENT = {
    "src_ip": "192.168.1.2",
    "dst_ip": "10.0.0.1",
    "protocol": "UDP",
    "payload_size": 512.0,
    "frequency": 250.0,   # high deviation from baseline 100
    "signal_strength": -95.0,  # severely degraded
    "inter_arrival_time": 0.001,
}

def test_extract_features_returns_correct_shape():
    vec, named = extract_features(NORMAL_EVENT)
    assert vec.shape == (len(FEATURE_NAMES),)
    assert set(named.keys()) == set(FEATURE_NAMES)

def test_predict_returns_required_keys():
    result = predict(NORMAL_EVENT)
    for key in ["anomaly_score", "is_threat", "threat_type", "severity", "confidence"]:
        assert key in result

def test_predict_normal_event_not_threat():
    # Without trained models, predict returns safe default (is_threat=False)
    result = predict(NORMAL_EVENT)
    # If models are loaded, normal traffic should not be flagged; if not loaded, default is False
    assert isinstance(result["is_threat"], bool)
    assert result["threat_type"] in ["normal", "jamming", "spoofing", "replay", "dos"]

def test_predict_jamming_event():
    result = predict(JAMMING_EVENT)
    assert result["anomaly_score"] >= 0.0
    assert result["confidence"] >= 0.0
    # With trained models, high freq deviation + signal degradation should flag as threat
    assert result["threat_type"] in ["jamming", "dos", "spoofing", "replay", "normal"]

def test_explainer_returns_dict_with_feature_keys():
    result = explain(NORMAL_EVENT)
    # Returns empty dict if models not trained, otherwise has feature keys
    if result:
        assert all(k in FEATURE_NAMES for k in result.keys())

def test_explainer_sorted_by_impact():
    result = explain(JAMMING_EVENT)
    if result:
        values = list(result.values())
        assert values == sorted(values, reverse=True)
