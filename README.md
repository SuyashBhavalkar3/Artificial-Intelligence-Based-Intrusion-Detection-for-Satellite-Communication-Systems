# Satellite Communication Intrusion Detection System (SC-IDS)

## Project Overview
The Satellite Communication Intrusion Detection System (SC-IDS) is a high-fidelity cybersecurity framework designed to protect satellite-to-ground communication links from advanced threats. The system utilizes a hybrid detection approach, combining Artificial Intelligence (AI) pattern recognition with physical-layer (PHY) signal analysis to identify and mitigate attacks such as jamming, spoofing, replay, and Denial of Service (DoS) in real-time.

## Technical Core Modules

### 1. Hybrid Anomaly Detection Strategy
The heart of SC-IDS is a two-layered detection pipeline:
- **Layer 1: PHY-Layer Signal Physics**: A rule-based engine that monitors raw RF characteristics. It validates signal strength (SS) and frequency rates against orbital baselines (e.g., -60dBm baseline). Any deviation beyond ±15dBm or ±50Hz triggers an immediate "Physics Anomaly" alert.
- **Layer 2: AI Pattern Recognition**: An ensemble of Machine Learning models that analyze complex multi-dimensional telemetry (inter-arrival time, payload Z-scores, protocol types) to identify sophisticated attack patterns that bypass simple threshold checks.

### 2. Implemented Algorithms
- **Isolation Forest**: Used for unsupervised anomaly detection. It isolates outliers in high-dimensional telemetry data, providing an "Anomaly Score" (0 to 1).
- **XGBoost Classifier**: A gradient-boosted decision tree algorithm used for multi-class threat categorization (Jamming vs. Spoofing vs. Replay vs. DoS).
- **SHAP (SHapley Additive exPlanations)**: Powers the **Explainable AI (XAI)** module by calculating feature importance for every detection, allowing the system to explain *why* a specific event was flagged (e.g., "Flagged due to 85% dependency on frequency_deviation").

### 3. Operator Command Center & Fleet Management
The system provides a centralized "Space-Tech" console for ground operators:
- **Fleet Monitoring**: Real-time tracking of satellite health, encryption key rotation status, and last contact telemetry.
- **Satellite Management**: Operators can dynamically add new satellites to the monitoring grid and view detailed historical threat logs for each asset.
- **Manual Intervention**: Supports manual threat classification, allowing operators to transition threats from `OPEN` to `INVESTIGATING` or `RESOLVED` status.
- **Command Injection**: Features a secure ingest module to simulate both normal and malicious telemetry for system stress-testing.

### 4. Cryptography & Blockchain Integrity
- **Quantum-Ready Security**: Implements a hybrid security model using **ECC Ed25519** for digital signatures and **AES-256-GCM** for authenticated encryption of satellite commands.
- **Blockchain Notarization**: Every detected threat is automatically notarized on an **Ethereum-based Blockchain** (via Smart Contracts). This creates an immutable, tamper-proof audit trail that ensures the integrity of the threat logs, preventing attackers from "scrubbing" evidence of their intrusion.

## Key Features Summary
- **Real-time Visualization**: Live spectrum analysis with neon scanlines and technical dBm readouts.
- **Radar Visuals**: High-fidelity SVG-based radar for spatial situational awareness.
- **Automated Alerting**: Multi-channel dispatch (Slack/Email stubs) for critical severity threats.
- **Defense-Grade UI**: A professional dark-tech aesthetic designed for high-stress operational environments.

## System Architecture

### Frontend
- **Tech Stack**: Next.js 14+ (App Router), TypeScript, Vanilla CSS.
- **Communication**: Real-time WebSockets for telemetry streaming.
- **Aesthetics**: Custom-built geometric schematics and monospace telemetry displays.

### Backend
- **Tech Stack**: FastAPI, SQLAlchemy, SQLite/PostgreSQL.
- **Services**: `anomaly_analysis` (Physics), `detection` (Pipeline), `security` (Crypto), `blockchain` (Web3).

## Technical Specifications (Signal Bounds)
- **Baseline Frequency**: 100 Hz
- **Baseline Signal Strength**: -60 dBm
- **Signal Tolerance**: ±15 dBm
- **Frequency Tolerance**: ±50 Hz
- **Physics Anomaly Score**: Derived from normalized deviation from orbital baselines.

## Installation and Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Ethereum Provider (e.g., Ganache or Sepolia for Blockchain features)

### Backend Setup
1. `cd backend`
2. `python -m venv venv && source venv/bin/activate`
3. `pip install -r requirements.txt`
4. `uvicorn app.main:app --reload`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Documentation and Transfer
This repository is optimized for seamless project transfer. All core logic is modularized for researchers and developers:
- `backend/app/ml/`: Feature extraction, training scripts, and model inference.
- `backend/app/services/anomaly_analysis.py`: Core signal physics logic.
- `backend/app/services/blockchain_service.py`: Web3 integration.
- `frontend/app/(dashboard)/`: UI modules for telemetry and command.

---
**Project Status**: Production Ready (Final Release)
**Target Industry**: Aerospace / Defense / Satellite Communications
**Date**: April 2026
