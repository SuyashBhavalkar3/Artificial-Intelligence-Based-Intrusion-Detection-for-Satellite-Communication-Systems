import numpy as np
from typing import Tuple, Dict

BASELINE_FREQ = 100.0
BASELINE_PAYLOAD = 512.0

FEATURE_NAMES = [
    "inter_arrival_time",
    "frequency_deviation",
    "signal_to_noise_ratio",
    "payload_size_zscore",
    "burst_score",
    "protocol_encoded",
]

def extract_features(event: dict) -> Tuple[np.ndarray, Dict[str, float]]:
    inter_arrival = float(event.get("inter_arrival_time", 0.1))
    freq_dev = abs(float(event.get("frequency", BASELINE_FREQ)) - BASELINE_FREQ)
    snr = float(event.get("signal_strength", -60)) + 100  # shift to positive scale
    payload = float(event.get("payload_size", BASELINE_PAYLOAD))
    payload_zscore = (payload - BASELINE_PAYLOAD) / 200.0
    burst_score = freq_dev / (inter_arrival + 1e-6)  # high when many packets arrive fast
    protocol = 1.0 if str(event.get("protocol", "TCP")).upper() == "UDP" else 0.0

    named = {
        "inter_arrival_time": inter_arrival,
        "frequency_deviation": freq_dev,
        "signal_to_noise_ratio": snr,
        "payload_size_zscore": payload_zscore,
        "burst_score": burst_score,
        "protocol_encoded": protocol,
    }
    return np.array(list(named.values()), dtype=np.float32), named
