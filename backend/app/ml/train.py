import os
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from xgboost import XGBClassifier
from app.ml.simulator import generate
from app.ml.features import extract_features, FEATURE_NAMES

SAVE_DIR = os.path.join(os.path.dirname(__file__), "saved_models")

def _build_feature_matrix(df: pd.DataFrame) -> np.ndarray:
    rows = []
    for _, row in df.iterrows():
        vec, _ = extract_features(row.to_dict())
        rows.append(vec)
    return np.array(rows)

def train():
    os.makedirs(SAVE_DIR, exist_ok=True)
    df = generate(n_samples=2000, attack_ratio=0.4)

    X = _build_feature_matrix(df)
    label_map = {"normal": 0, "jamming": 1, "spoofing": 2, "replay": 3, "dos": 4}
    y = df["label"].map(label_map).values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # IsolationForest for anomaly scoring (unsupervised)
    iso = IsolationForest(n_estimators=200, contamination=0.3, random_state=42)
    iso.fit(X_scaled)

    # XGBoost multi-class classifier
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42, stratify=y)
    xgb = XGBClassifier(
        n_estimators=200,
        max_depth=6,
        use_label_encoder=False,
        eval_metric="mlogloss",
        random_state=42,
    )
    xgb.fit(X_train, y_train)

    y_pred = xgb.predict(X_test)
    print(classification_report(y_test, y_pred, target_names=list(label_map.keys())))
    print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))

    y_prob = xgb.predict_proba(X_test)
    try:
        auc = roc_auc_score(y_test, y_prob, multi_class="ovr")
        print(f"ROC-AUC (OvR): {auc:.4f}")
    except Exception:
        pass

    with open(os.path.join(SAVE_DIR, "scaler.pkl"), "wb") as f:
        pickle.dump(scaler, f)
    with open(os.path.join(SAVE_DIR, "isolation_forest.pkl"), "wb") as f:
        pickle.dump(iso, f)
    with open(os.path.join(SAVE_DIR, "xgb_classifier.pkl"), "wb") as f:
        pickle.dump(xgb, f)

    print("Models saved to", SAVE_DIR)

if __name__ == "__main__":
    train()
