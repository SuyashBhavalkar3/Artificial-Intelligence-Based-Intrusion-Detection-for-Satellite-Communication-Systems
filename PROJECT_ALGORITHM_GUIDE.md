# 🛰️ AI-Based Intrusion Detection for Satellite Systems: Algorithm Guide

This document provides a comprehensive overview of the core algorithms and cryptographic protocols used in the **Satellite Intrusion Detection System (SIDS)**.

---

## 1. Post-Quantum Security Layer
To protect satellite-to-ground communication against future quantum computing threats, the system implements a hybrid cryptographic layer.

### **CRYSTALS-Kyber (ML-KEM)**
*   **Purpose:** Post-Quantum Key Encapsulation Mechanism (KEM).
*   **Usage:** Secures the exchange of session keys between the Satellite and the Ground Station.
*   **Why Kyber?** It is part of the FIPS 203 standard for Module-Lattice-Based Key-Encapsulation. It ensures that even if an attacker captures today's traffic, they cannot decrypt it in the future using a quantum computer.
*   **Implementation:** [`backend/app/services/security_service.py`](file:///c:/VIT/VIT%20SEM%206/CSBT/CP/backend/app/services/security_service.py)

### **AES-256-GCM**
*   **Purpose:** Authenticated Symmetric Encryption.
*   **Usage:** Encrypts the actual telemetry data and command payloads.
*   **Why GCM?** It provides both confidentiality and integrity (authentication), ensuring the data hasn't been tampered with during transit.

### **ECC Ed25519**
*   **Purpose:** Digital Signatures.
*   **Usage:** Used to sign command packets to verify the identity of the sender (Origin Authentication).
*   **Why Ed25519?** High security, fast performance, and small signature size, ideal for resource-constrained satellite hardware.

---

## 2. Intrusion Detection Algorithms (ML)
The system uses a multi-layered machine learning approach to detect anomalies and specific attack patterns in satellite telemetry.

### **XGBoost (Extreme Gradient Boosting)**
*   **Purpose:** Multi-class classification of cyber-attacks.
*   **Usage:** Identifies the specific type of threat: **Jamming, Spoofing, Replay, or DoS**.
*   **Why XGBoost?** State-of-the-art performance on tabular data with high speed and scalability.
*   **Implementation:** [`backend/app/ml/comparison.py`](file:///c:/VIT/VIT%20SEM%206/CSBT/CP/backend/app/ml/comparison.py)

### **Isolation Forest**
*   **Purpose:** Unsupervised Anomaly Detection.
*   **Usage:** Used as a first-line "outlier detector" to flag unusual signal behavior without requiring labeled attack data.
*   **Why Isolation Forest?** Efficiently detects anomalies by isolating points that are "few and far between" in the feature space.

### **Random Forest**
*   **Purpose:** Robust Classification and Feature Importance.
*   **Usage:** Used as a benchmark model for validating the signal features extracted from telemetry.

---

## 3. Explainability & Analysis (XAI)
To provide transparency into why an event was flagged as an attack, the system uses "Explainable AI".

### **SHAP (SHapley Additive exPlanations)**
*   **Purpose:** Model Interpretation.
*   **Usage:** Calculates the contribution of each telemetry feature (e.g., Signal Strength, Frequency, Latency) to the model's final prediction.
*   **Benefit:** Helps satellite operators understand the specific indicators of a detected attack (e.g., "The attack was flagged primarily due to a 40% drop in Signal-to-Noise Ratio").
*   **Implementation:** [`backend/app/ml/explainer.py`](file:///c:/VIT/VIT%20SEM%206/CSBT/CP/backend/app/ml/explainer.py)

---

## 4. Feature Extraction Logic
The ML models process raw telemetry into the following core features:
1.  **SNR (Signal-to-Noise Ratio):** Indicator of Jamming.
2.  **Phase Error:** Indicator of Spoofing.
3.  **Timing Jitter:** Indicator of Replay attacks.
4.  **Frequency Offset:** Indicator of Doppler shifts or Jamming.
5.  **Payload Entropy:** Indicator of encrypted vs. malicious payloads.

---

## 5. Summary Table

| Category | Algorithm | Purpose | Usage Level |
| :--- | :--- | :--- | :--- |
| **Cryptography** | CRYSTALS-Kyber | Post-Quantum Security | Production |
| **Cryptography** | AES-256-GCM | Data Confidentiality | Production |
| **Detection** | XGBoost | Attack Classification | Production (Primary) |
| **Detection** | Isolation Forest | Anomaly Detection | Unsupervised Layer |
| **Explainability** | SHAP | Transparency | Analysis Layer |
| **Integrity** | SHA-256 | Hashing/Integrity | System-wide |

---
