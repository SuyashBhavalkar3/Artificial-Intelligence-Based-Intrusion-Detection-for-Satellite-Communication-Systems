import numpy as np
import pandas as pd

rng = np.random.default_rng(42)

def _normal(n: int) -> pd.DataFrame:
    return pd.DataFrame({
        "src_ip": [f"192.168.1.{rng.integers(1,254)}" for _ in range(n)],
        "dst_ip": [f"10.0.0.{rng.integers(1,10)}" for _ in range(n)],
        "protocol": rng.choice(["TCP", "UDP"], n).tolist(),
        "payload_size": rng.normal(512, 50, n),
        "frequency": rng.normal(100, 5, n),
        "signal_strength": rng.normal(-60, 3, n),
        "inter_arrival_time": rng.exponential(0.1, n),
        "label": "normal",
    })

def _jamming(n: int) -> pd.DataFrame:
    df = _normal(n)
    df["frequency"] += rng.normal(0, 40, n)       # high frequency deviation
    df["signal_strength"] -= rng.uniform(20, 40, n)  # signal degradation
    df["label"] = "jamming"
    return df

def _spoofing(n: int) -> pd.DataFrame:
    df = _normal(n)
    df["src_ip"] = [f"{rng.integers(1,255)}.{rng.integers(0,255)}.{rng.integers(0,255)}.{rng.integers(0,255)}" for _ in range(n)]
    df["signal_strength"] += rng.uniform(10, 30, n)  # abnormal signal strength
    df["label"] = "spoofing"
    return df

def _replay(n: int) -> pd.DataFrame:
    df = _normal(n)
    df["payload_size"] = rng.choice([256, 512, 1024], n).astype(float)  # repeated identical payloads
    df["inter_arrival_time"] = rng.uniform(0.001, 0.005, n)             # low variance inter-arrival
    df["label"] = "replay"
    return df

def _dos(n: int) -> pd.DataFrame:
    df = _normal(n)
    df["frequency"] += rng.uniform(200, 500, n)   # extremely high packet rate
    df["payload_size"] += rng.uniform(2000, 8000, n)  # payload spikes
    df["label"] = "dos"
    return df

def generate(n_samples: int = 1000, attack_ratio: float = 0.3) -> pd.DataFrame:
    n_attack = int(n_samples * attack_ratio)
    n_normal = n_samples - n_attack
    per_type = max(1, n_attack // 4)

    frames = [_normal(n_normal)]
    for fn in [_jamming, _spoofing, _replay, _dos]:
        frames.append(fn(per_type))

    df = pd.concat(frames, ignore_index=True).sample(frac=1, random_state=42).reset_index(drop=True)
    df["timestamp"] = pd.Timestamp.utcnow()
    return df
