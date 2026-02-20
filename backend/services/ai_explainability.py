from typing import Optional
from core import llm as llm_module


def _rule_based_explanation(features: dict) -> str:
    reasons = []

    if abs(features.get("signal_delta", 0)) > 15:
        reasons.append("abnormal signal strength deviation")

    if features.get("frequency_drift", 0) > 20:
        reasons.append("significant frequency drift")

    if features.get("packet_loss_ratio", 0) > 0.3:
        reasons.append("high packet loss")

    if features.get("latency_spike", 0) > 200:
        reasons.append("severe latency spike")

    if not reasons:
        return "Anomalous satellite communication pattern detected."

    return "Anomaly detected due to " + ", ".join(reasons) + "."


def generate_explanation(features: dict, threat_score: Optional[float] = None) -> str:
    """
    Produce a concise, post-hoc explanation for an anomaly.

    Behavior and safety:
    - Calls the centrally-initialized LLM in `core/llm.py` for a human-friendly
      explanation using only the provided `features` and `threat_score`.
    - Never changes detection results or scores; strictly post-hoc.
    - Falls back to the deterministic, rule-based explainer if the LLM call
      fails or returns an unusable answer.
    """

    # Build a short, constrained prompt. Keep it deterministic and non-leading.
    system_msg = (
        "You are an assistant that explains anomaly detections for satellite "
        "telemetry. Use only the provided feature values and the threat score. "
        "Give a concise 1-2 sentence explanation and list the top 2 contributing "
        "features with a one-line rationale each. Do NOT change the score, severity, "
        "or make additional inferences. If you cannot explain, respond: 'UNABLE_TO_EXPLAIN'."
    )

    human_msg = (
        f"Features (JSON): {features}\nThreat score: {threat_score}"
    )

    try:
        model = getattr(llm_module, "llm", None)
        if model is None:
            return _rule_based_explanation(features)

        # `ChatGroq` exposes an `invoke` method that accepts a list of
        # (role, message) tuples. We follow that documented pattern.
        messages = [("system", system_msg), ("human", human_msg)]
        response = model.invoke(messages)

        # Some SDKs return an object with a `content` attribute.
        explanation_text = getattr(response, "content", None) or str(response)

        if not explanation_text or "UNABLE_TO_EXPLAIN" in explanation_text:
            return _rule_based_explanation(features)

        # Keep the LLM explanation short; truncate if needed.
        return explanation_text.strip()

    except Exception:
        # On any failure, return the deterministic, rule-based explanation.
        return _rule_based_explanation(features)