import numpy as np
from sklearn.ensemble import IsolationForest
from typing import List, Dict


class AnomalyDetectionModel:
    def __init__(self):
        self.model = IsolationForest(
            n_estimators=100,
            contamination=0.05,
            random_state=42
        )
        self.is_trained = False

    def train(self, feature_vectors: List[Dict[str, float]]):
        X = np.array([
            list(features.values())
            for features in feature_vectors
        ])
        self.model.fit(X)
        self.is_trained = True

    def predict(self, feature_vector: Dict[str, float]) -> Dict[str, float]:
        if not self.is_trained:
            raise RuntimeError("Model is not trained")

        X = np.array([list(feature_vector.values())])
        prediction = self.model.predict(X)[0]
        score = self.model.decision_function(X)[0]

        return {
            "is_anomaly": prediction == -1,
            "anomaly_score": float(score)
        }