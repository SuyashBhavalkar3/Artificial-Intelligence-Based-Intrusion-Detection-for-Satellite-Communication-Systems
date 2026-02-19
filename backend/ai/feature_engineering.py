from typing import Dict
from models.telemetry import Telemetry


class FeatureEngineer:
    @staticmethod
    def extract_features(
        telemetry: Telemetry,
        baseline: Dict[str, float]
    ) -> Dict[str, float]:
        """
        Convert raw telemetry into AI-ready features
        """

        signal_delta = telemetry.signal_strength - baseline["signal_strength"]
        frequency_drift = abs(telemetry.frequency - baseline["frequency"])
        packet_loss_ratio = telemetry.packet_loss
        latency_spike = telemetry.latency - baseline["latency"]

        anomaly_score_hint = (
            abs(signal_delta) * 0.4 +
            frequency_drift * 0.3 +
            packet_loss_ratio * 0.2 +
            latency_spike * 0.1
        )

        return {
            "signal_delta": signal_delta,
            "frequency_drift": frequency_drift,
            "packet_loss_ratio": packet_loss_ratio,
            "latency_spike": latency_spike,
            "anomaly_score_hint": anomaly_score_hint
        }