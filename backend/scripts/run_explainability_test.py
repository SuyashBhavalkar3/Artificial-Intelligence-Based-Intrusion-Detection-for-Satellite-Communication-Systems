import os
import sys
import traceback
from pathlib import Path

# ---------------------------------------------------------------------
# 1. PATH + ENV BOOTSTRAP
# ---------------------------------------------------------------------

repo_root = Path(__file__).resolve().parents[2]
backend_dir = repo_root / "backend"

os.chdir(repo_root)
sys.path.insert(0, str(backend_dir))

# Minimal env vars so Settings() validation passes
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "testsecret")
os.environ.setdefault("ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
os.environ.setdefault("GROQ_API_KEY", os.getenv("GROQ_API_KEY", "DUMMY_TEST_KEY"))

print("Working dir:", Path.cwd())
print("Backend import path:", backend_dir)
print("GROQ_API_KEY present:", bool(os.getenv("GROQ_API_KEY")))

# ---------------------------------------------------------------------
# 2. IMPORTS
# ---------------------------------------------------------------------

try:
    from services.ai_detection_service import AIDetectionService
    from services import threat_service, audit_service
    import core.llm as llm_module
except Exception:
    print(" Import error:")
    traceback.print_exc()
    raise

# ---------------------------------------------------------------------
# 3. STUB DB-BOUND SERVICES
# ---------------------------------------------------------------------

_original_create_threat = threat_service.ThreatService.create_threat
_original_audit_log = audit_service.AuditService.log

def stub_create_threat(db, threat_in, reporter):
    print("[STUB] create_threat:", getattr(threat_in, "title", threat_in))
    return {
        "id": 123,
        "title": getattr(threat_in, "title", None),
        "description": getattr(threat_in, "description", None),
    }

def stub_audit_log(db, action=None, resource=None, user=None, details=None):
    print(f"[STUB] audit_log: action={action}, resource={resource}, details={details}")

threat_service.ThreatService.create_threat = staticmethod(stub_create_threat)
audit_service.AuditService.log = staticmethod(stub_audit_log)

# ---------------------------------------------------------------------
# 4. DUMMY MODEL + TELEMETRY (MATCHES FEATURE ENGINEER)
# ---------------------------------------------------------------------

class DummyModel:
    """Deterministic anomaly model for testing"""

    def predict(self, features: dict):
        delta = abs(features.get("signal_delta", 0))
        is_anomaly = delta > 10
        return {
            "is_anomaly": is_anomaly,
            "anomaly_score": 0.85 if is_anomaly else 0.1,
        }

class SimpleTelemetry:
    """
    Dummy telemetry object when real-time data is unavailable.
    EXACTLY matches FeatureEngineer expectations.
    """
    def __init__(self, satellite_id: int):
        self.satellite_id = satellite_id

        #  REQUIRED FIELDS
        self.signal_strength = -80     # dBm
        self.frequency = 1200          # MHz
        self.packet_loss = 0.05        # 5% packet loss
        self.latency = 150             # ms

        # Optional raw dict (safe fallback)
        self.raw = {
            "signal_strength": self.signal_strength,
            "frequency": self.frequency,
            "packet_loss": self.packet_loss,
            "latency": self.latency,
        }

# Dummy baseline (used for deltas / comparison)
baseline = {
    "signal_strength": -100,   # normal signal
    "frequency": 1200,
    "packet_loss": 0.01,
    "latency": 50,
}

# ---------------------------------------------------------------------
# 5. SERVICE UNDER TEST
# ---------------------------------------------------------------------

service = AIDetectionService(model=DummyModel())

def run_case(label: str):
    print(f"\n=== {label} ===")
    telemetry = SimpleTelemetry(999)

    try:
        result = service.analyze_telemetry(
            db=None,
            telemetry=telemetry,
            baseline=baseline
        )
        print("Result:", result)
    except Exception:
        print(" analyze_telemetry raised:")
        traceback.print_exc()

# ---------------------------------------------------------------------
# 6. FAKE LLM IMPLEMENTATIONS
# ---------------------------------------------------------------------

class FakeResp:
    def __init__(self, content: str):
        self.content = content

class FakeLLMSuccess:
    def invoke(self, messages):
        print("[MOCK LLM] invoked with:", messages)
        return FakeResp(
            "LLM explanation: sudden increase in signal strength with elevated packet loss caused anomaly."
        )

class FakeLLMFailure:
    def invoke(self, messages):
        print("[MOCK LLM] invoked and failing")
        raise RuntimeError("Simulated LLM failure")

# ---------------------------------------------------------------------
# 7. TEST CASES
# ---------------------------------------------------------------------

# Case 1: LLM success
llm_module.llm = FakeLLMSuccess()
run_case("LLM mocked success")

# Case 2: LLM failure → fallback
llm_module.llm = FakeLLMFailure()
run_case("LLM mocked failure (fallback expected)")

# Case 3: No LLM → fallback
llm_module.llm = None
run_case("LLM is None (fallback expected)")

# ---------------------------------------------------------------------
# 8. RESTORE ORIGINAL STATE
# ---------------------------------------------------------------------

threat_service.ThreatService.create_threat = _original_create_threat
audit_service.AuditService.log = _original_audit_log

print("\n Explainability test script finished successfully")