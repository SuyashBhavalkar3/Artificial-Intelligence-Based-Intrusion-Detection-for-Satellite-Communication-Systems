from groq import Groq
from app.config import settings

_client = Groq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None
MODEL = "llama-3.3-70b-versatile"
SYSTEM_PROMPT = (
    "You are an expert satellite communication security analyst specializing in intrusion detection. "
    "Provide concise, technical, actionable analysis."
)

def _chat_completion(messages: list) -> str:
    if not _client:
        return "LLM unavailable: GROQ_API_KEY not set."
    resp = _client.chat.completions.create(model=MODEL, messages=messages)
    return resp.choices[0].message.content

def explain_threat(threat: dict, shap_values: dict) -> str:
    top_features = list(shap_values.items())[:5]
    user_msg = (
        f"Threat detected:\n{threat}\n\n"
        f"Top contributing features (SHAP):\n{top_features}\n\n"
        "Explain what this threat means, why these features triggered it, and recommended mitigation."
    )
    return _chat_completion([
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_msg},
    ])

def summarize_incident(threats: list) -> str:
    from collections import Counter
    type_counts = Counter(t.get("threat_type") for t in threats)
    sev_counts = Counter(t.get("severity") for t in threats)
    user_msg = (
        f"Incident summary request:\n"
        f"Total threats: {len(threats)}\n"
        f"By type: {dict(type_counts)}\n"
        f"By severity: {dict(sev_counts)}\n"
        f"Threats: {threats[:10]}\n\n"
        "Provide a structured incident report with threat breakdown, risk assessment, and recommended actions."
    )
    return _chat_completion([
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_msg},
    ])

def chat(history: list, user_message: str, context: dict) -> str:
    system = SYSTEM_PROMPT + (
        f"\n\nLive system stats: {context}"
    )
    messages = [{"role": "system", "content": system}] + history + [{"role": "user", "content": user_message}]
    return _chat_completion(messages)

async def stream_chat(history: list, user_message: str, context: dict):
    if not _client:
        yield "LLM unavailable: GROQ_API_KEY not set."
        return
    system = SYSTEM_PROMPT + f"\n\nLive system stats: {context}"
    messages = [{"role": "system", "content": system}] + history + [{"role": "user", "content": user_message}]
    stream = _client.chat.completions.create(model=MODEL, messages=messages, stream=True)
    for chunk in stream:
        token = chunk.choices[0].delta.content
        if token:
            yield token
