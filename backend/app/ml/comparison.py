import os
import pandas as pd
import numpy as np
import time
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from xgboost import XGBClassifier
from app.ml.simulator import generate 
from app.ml.features import extract_features

def build_feature_matrix(df: pd.DataFrame) -> np.ndarray:
    rows = []
    for _, row in df.iterrows():
        vec, _ = extract_features(row.to_dict())
        rows.append(vec)
    return np.array(rows)

def run_comparison():
    print("Generating synthetic satellite telemetry data for evaluation...")
    df = generate(n_samples=5000, attack_ratio=0.3)
    
    X = build_feature_matrix(df)
    label_map = {"normal": 0, "jamming": 1, "spoofing": 2, "replay": 3, "dos": 4}
    y = df["label"].map(label_map).values

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000),
        "Support Vector Machine": SVC(probability=True),
        "Random Forest": RandomForestClassifier(n_estimators=100),
        "XGBoost (Current)": XGBClassifier(n_estimators=100, use_label_encoder=False, eval_metric="mlogloss")
    }

    results = []

    for name, model in models.items():
        print(f"Evaluating {name}...")
        start_time = time.time()
        model.fit(X_train_scaled, y_train)
        train_time = time.time() - start_time
        
        start_time = time.time()
        y_pred = model.predict(X_test_scaled)
        inference_time = (time.time() - start_time) / len(X_test)
        
        results.append({
            "Algorithm": name,
            "Accuracy": accuracy_score(y_test, y_pred),
            "Precision": precision_score(y_test, y_pred, average='weighted'),
            "Recall": recall_score(y_test, y_pred, average='weighted'),
            "F1-Score": f1_score(y_test, y_pred, average='weighted'),
            "Training Time (s)": round(train_time, 4),
            "Inference Time (ms/sample)": round(inference_time * 1000, 4)
        })

    # Special handling for Isolation Forest (Unsupervised)
    print("Evaluating Isolation Forest (Unsupervised)...")
    iso = IsolationForest(contamination=0.3, random_state=42)
    iso.fit(X_train_scaled)
    # Map -1 (anomaly) to 1 and 1 (normal) to 0 for a rough comparison on binary detection
    y_test_binary = (y_test != 0).astype(int)
    y_pred_iso = iso.predict(X_test_scaled)
    y_pred_iso = np.where(y_pred_iso == -1, 1, 0)
    
    results.append({
        "Algorithm": "Isolation Forest (Anomaly Only)",
        "Accuracy": accuracy_score(y_test_binary, y_pred_iso),
        "Precision": precision_score(y_test_binary, y_pred_iso),
        "Recall": recall_score(y_test_binary, y_pred_iso),
        "F1-Score": f1_score(y_test_binary, y_pred_iso),
        "Training Time (s)": "N/A",
        "Inference Time (ms/sample)": "N/A"
    })

    comparison_df = pd.DataFrame(results)
    print("\n--- Algorithm Comparison Table ---")
    print(comparison_df.to_string(index=False))
    
    # Save to a CSV for the report
    report_path = os.path.join(os.path.dirname(__file__), "algorithm_comparison.csv")
    comparison_df.to_csv(report_path, index=False)
    print(f"\nDetailed comparison saved to {report_path}")

if __name__ == "__main__":
    run_comparison()
