"use client";
import { useState, FormEvent } from "react";
import { api } from "@/lib/api";
import type { IngestResponse, SimulateResponse } from "@/lib/types";

const defaultEvent = {
  src_ip: "192.168.1.1",
  dst_ip: "10.0.0.1",
  protocol: "TCP",
  payload_size: 512,
  frequency: 1.0,
  signal_strength: -70,
};

export default function IngestPage() {
  const [form, setForm] = useState(defaultEvent);
  const [result, setResult] = useState<IngestResponse | null>(null);
  const [simResult, setSimResult] = useState<SimulateResponse | null>(null);
  const [simForm, setSimForm] = useState({ n_samples: 10, attack_ratio: 0.3 });
  const [loading, setLoading] = useState(false);
  const [simLoading, setSimLoading] = useState(false);
  const [secureLoading, setSecureLoading] = useState(false);
  const [secureResult, setSecureResult] = useState<{
    flow: string[];
    details: { encryption: string; signature: string; pqc_envelope: string };
  } | null>(null);
  const [error, setError] = useState("");

  async function handleIngest(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post<IngestResponse>("/api/ingest", {
        ...form,
        payload_size: Number(form.payload_size),
        frequency: Number(form.frequency),
        signal_strength: Number(form.signal_strength),
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSimulate(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSimLoading(true);
    try {
      const res = await api.post<SimulateResponse>("/api/ingest/simulate", {
        n_samples: Number(simForm.n_samples),
        attack_ratio: Number(simForm.attack_ratio),
      });
      setSimResult(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSimLoading(false);
    }
  }

  async function handleSecureDemo() {
    setError("");
    setSecureLoading(true);
    try {
      const res = await api.post<any>("/api/ingest/demo-secure", {});
      setSecureResult(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSecureLoading(false);
    }
  }

  const field = (key: keyof typeof form, label: string, type = "text") => (
    <div key={key}>
      <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase" }}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        style={{ 
          width: "100%", padding: "10px", background: "var(--bg)", 
          border: "1px solid var(--border)", borderRadius: 4, 
          color: "var(--text)", fontSize: 13, fontWeight: 600
        }}
        required
      />
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24 }}>INGEST_TELEMETRY</h1>
        {error && <div style={{ fontSize: 12, color: "var(--critical)", marginBottom: 16 }}>ERROR: {error}</div>}
        <form onSubmit={handleIngest} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: 24 }} className="space-y-4">
          {field("src_ip", "Source IP")}
          {field("dst_ip", "Destination IP")}
          {field("protocol", "Protocol")}
          {field("payload_size", "Payload Size", "number")}
          {field("frequency", "Frequency", "number")}
          {field("signal_strength", "Signal Strength", "number")}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "12px", background: "var(--cyan)", color: "#000",
              border: "none", borderRadius: 4, fontWeight: 900, fontSize: 12, cursor: "pointer",
              marginTop: 12
            }}
          >
            {loading ? "TRANSMITTING..." : "INGEST_DATA"}
          </button>
        </form>

        {result && (
          <div style={{ 
            marginTop: 20, background: "var(--bg-card)", border: "1px solid var(--border)", 
            borderRadius: 8, padding: 20, fontSize: 12, borderLeft: `4px solid ${result.is_threat ? "var(--critical)" : "var(--success)"}`
          }} className="space-y-2">
            <div><span style={{ color: "var(--text-muted)" }}>Threat_ID:</span> <span style={{ fontWeight: 800, fontFamily: "monospace" }}>{result.threat_id}</span></div>
            <div style={{ display: "flex", gap: 20 }}>
              <div><span style={{ color: "var(--text-muted)" }}>Type:</span> <span style={{ fontWeight: 800, textTransform: "uppercase" }}>{result.threat_type}</span></div>
              <div><span style={{ color: "var(--text-muted)" }}>Severity:</span> <span style={{ fontWeight: 800, textTransform: "uppercase", color: result.is_threat ? "var(--critical)" : "var(--success)" }}>{result.severity}</span></div>
            </div>
            <div><span style={{ color: "var(--text-muted)" }}>Confidence:</span> <span style={{ fontWeight: 800 }}>{(result.confidence * 100).toFixed(1)}%</span></div>
          </div>
        )}
      </div>

      <div className="space-y-8">
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24 }}>CRYPTO_VALIDATION</h1>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: 24 }} className="space-y-6">
            <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
              Validate the <strong>Post-Quantum Cryptographic Layer</strong>. Simulates secure command transmission from orbital assets to the Ground Station.
            </p>
            <button
              onClick={handleSecureDemo}
              disabled={secureLoading}
              style={{
                width: "100%", padding: "12px", background: "none", color: "var(--cyan)",
                border: "1px solid var(--cyan)", borderRadius: 4, fontWeight: 900, fontSize: 12, cursor: "pointer"
              }}
            >
              {secureLoading ? "COMPUTING_KEYS..." : "START_SECURE_VALIDATION"}
            </button>

            {secureResult && (
              <div style={{ marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 20 }} className="space-y-4">
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--success)", fontSize: 12, fontWeight: 800 }}>
                  <div style={{ width: 8, height: 8, background: "var(--success)", borderRadius: "50%", boxShadow: `0 0 10px var(--success)` }} />
                  CRYPTO_CHAIN_VERIFIED
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {secureResult.flow.map((step, i) => (
                    <div key={i} style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", gap: 12 }}>
                      <span style={{ color: "var(--cyan)", fontWeight: 800, fontFamily: "monospace" }}>{i + 1}</span>
                      {step}
                    </div>
                  ))}
                </div>
                <div style={{ 
                  background: "var(--bg)", border: "1px solid var(--border)", 
                  borderRadius: 4, padding: 12, fontSize: 10, fontFamily: "monospace", color: "var(--cyan)" 
                }} className="grid grid-cols-1 gap-2">
                  <div>ENC: {secureResult.details.encryption}</div>
                  <div>SIG: {secureResult.details.signature}</div>
                  <div>PQC: {secureResult.details.pqc_envelope}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h1 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24 }}>FLEET_SIMULATION</h1>
          <form onSubmit={handleSimulate} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: 24 }} className="space-y-4">
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "var(--text-muted)", marginBottom: 4 }}>SAMPLE_SIZE</label>
              <input
                type="number"
                value={simForm.n_samples}
                onChange={(e) => setSimForm((p) => ({ ...p, n_samples: Number(e.target.value) }))}
                style={{ 
                  width: "100%", padding: "10px", background: "var(--bg)", 
                  border: "1px solid var(--border)", borderRadius: 4, 
                  color: "var(--text)", fontSize: 13, fontWeight: 600
                }}
                min={1}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: "var(--text-muted)", marginBottom: 4 }}>ATTACK_VEC_RATIO</label>
              <input
                type="number"
                step="0.01"
                min={0}
                max={1}
                value={simForm.attack_ratio}
                onChange={(e) => setSimForm((p) => ({ ...p, attack_ratio: Number(e.target.value) }))}
                style={{ 
                  width: "100%", padding: "10px", background: "var(--bg)", 
                  border: "1px solid var(--border)", borderRadius: 4, 
                  color: "var(--text)", fontSize: 13, fontWeight: 600
                }}
              />
            </div>
            <button
              type="submit"
              disabled={simLoading}
              style={{
                width: "100%", padding: "12px", background: "#000", color: "#fff",
                border: "1px solid var(--border-strong)", borderRadius: 4, fontWeight: 900, fontSize: 12, cursor: "pointer",
                marginTop: 12
              }}
            >
              {simLoading ? "INJECTING_TRAFFIC..." : "INIT_SIMULATION"}
            </button>
          </form>

          {simResult && (
            <div style={{ 
              marginTop: 20, background: "var(--bg-card)", border: "1px solid var(--border)", 
              borderRadius: 8, padding: 20, fontSize: 12
            }} className="space-y-2">
              <div style={{ display: "flex", gap: 32 }}>
                <div><span style={{ color: "var(--text-muted)" }}>Total_Packets:</span> <span style={{ fontWeight: 800 }}>{simResult.total}</span></div>
                <div><span style={{ color: "var(--text-muted)" }}>Threats_ID:</span> <span style={{ fontWeight: 800, color: "var(--critical)" }}>{simResult.threats}</span></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginTop: 8 }}>
                {Object.entries(simResult.by_type).map(([k, v]) => (
                  <div key={k} style={{ textTransform: "uppercase", fontSize: 11 }}>
                    <span style={{ color: "var(--text-muted)" }}>{k}:</span> <span style={{ fontWeight: 800 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
