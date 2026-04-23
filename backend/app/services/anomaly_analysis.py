import numpy as np
from typing import Dict, Any

class AnomalyAnalysisService:
    """
    Core Satellite Signal Anomaly Detection.
    Provides physics-based validation of signal strength and frequency rates
    to detect jamming, spoofing, and DoS attacks at the PHY/Link layer.
    """
    
    # Baseline Orbital Parameters
    BASELINE_SIGNAL_STRENGTH = -60.0  # dBm (Typical satellite-to-ground link)
    BASELINE_FREQ_RATE = 100.0        # Hz (Typical packet frequency)
    
    # Thresholds for Anomaly Triggering
    SIGNAL_TOLERANCE = 15.0  # +/- 15dB deviation
    FREQ_TOLERANCE = 50.0    # +/- 50Hz deviation

    def analyze_signal_anomalies(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        ss = float(event_data.get("signal_strength", self.BASELINE_SIGNAL_STRENGTH))
        freq = float(event_data.get("frequency", self.BASELINE_FREQ_RATE))
        
        # 1. Signal Strength Analysis
        ss_deviation = abs(ss - self.BASELINE_SIGNAL_STRENGTH)
        is_ss_anomaly = ss_deviation > self.SIGNAL_TOLERANCE
        
        # 2. Frequency Rate Analysis
        freq_deviation = abs(freq - self.BASELINE_FREQ_RATE)
        is_freq_anomaly = freq_deviation > self.FREQ_TOLERANCE
        
        # 3. Combined Physics Score (0.0 to 1.0)
        # We normalize deviations by their tolerances
        ss_score = min(1.0, ss_deviation / (self.SIGNAL_TOLERANCE * 2))
        freq_score = min(1.0, freq_deviation / (self.FREQ_TOLERANCE * 2))
        
        physics_score = (ss_score + freq_score) / 2
        
        # Determine likely attack vector based on signal physics
        vectors = []
        if is_ss_anomaly and ss < (self.BASELINE_SIGNAL_STRENGTH - self.SIGNAL_TOLERANCE):
            vectors.append("SIGNAL_DEGRADATION (Potential Jamming)")
        elif is_ss_anomaly and ss > (self.BASELINE_SIGNAL_STRENGTH + self.SIGNAL_TOLERANCE):
            vectors.append("ABNORMAL_GAIN (Potential Spoofing)")
            
        if is_freq_anomaly and freq > (self.BASELINE_FREQ_RATE + self.FREQ_TOLERANCE):
            vectors.append("FREQUENCY_OVERLOAD (Potential DoS)")
            
        return {
            "physics_anomaly_score": round(physics_score, 4),
            "signal_strength_deviation": round(ss_deviation, 2),
            "frequency_deviation": round(freq_deviation, 2),
            "is_physics_anomaly": is_ss_anomaly or is_freq_anomaly,
            "detected_vectors": vectors
        }

anomaly_analyzer = AnomalyAnalysisService()
