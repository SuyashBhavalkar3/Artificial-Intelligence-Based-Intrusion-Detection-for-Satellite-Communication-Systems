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
      <label className="block text-xs text-neutral-500 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        className="w-full border border-neutral-300 rounded px-3 py-1.5 text-sm"
        required
      />
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h1 className="text-lg font-semibold mb-4">Ingest Event</h1>
        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
        <form onSubmit={handleIngest} className="bg-white border border-neutral-200 rounded p-5 space-y-3">
          {field("src_ip", "Source IP")}
          {field("dst_ip", "Destination IP")}
          {field("protocol", "Protocol")}
          {field("payload_size", "Payload Size", "number")}
          {field("frequency", "Frequency", "number")}
          {field("signal_strength", "Signal Strength", "number")}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? "Ingesting..." : "Ingest"}
          </button>
        </form>

        {result && (
          <div className="mt-4 bg-white border border-neutral-200 rounded p-4 text-sm space-y-1">
            <div><span className="text-neutral-500">Threat ID:</span> {result.threat_id}</div>
            <div><span className="text-neutral-500">Type:</span> {result.threat_type}</div>
            <div><span className="text-neutral-500">Severity:</span> {result.severity}</div>
            <div><span className="text-neutral-500">Confidence:</span> {(result.confidence * 100).toFixed(1)}%</div>
            <div><span className="text-neutral-500">Is Threat:</span> {result.is_threat ? "Yes" : "No"}</div>
          </div>
        )}
      </div>

      <div>
        <h1 className="text-lg font-semibold mb-4">Security Demonstration</h1>
        <div className="bg-white border border-neutral-200 rounded p-5 space-y-4">
          <p className="text-xs text-neutral-500 leading-relaxed">
            Test the <strong>Hybrid Quantum-Resistant Layer</strong>. This simulates a satellite 
            sending an encrypted and signed command that is verified by the ground station.
          </p>
          <button
            onClick={handleSecureDemo}
            disabled={secureLoading}
            className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {secureLoading ? "Verifying..." : "Run Secure Transmission Demo"}
          </button>

          {secureResult && (
            <div className="mt-4 border-t pt-4 space-y-3">
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                Secure Flow Verified
              </div>
              <ul className="space-y-1.5">
                {secureResult.flow.map((step, i) => (
                  <li key={i} className="text-[11px] text-neutral-600 flex gap-2">
                    <span className="text-neutral-400 font-mono">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ul>
              <div className="bg-neutral-50 rounded p-2 text-[10px] font-mono grid grid-cols-2 gap-2">
                <div>Encryption: {secureResult.details.encryption}</div>
                <div>Signature: {secureResult.details.signature}</div>
                <div className="col-span-2">PQC: {secureResult.details.pqc_envelope}</div>
              </div>
            </div>
          )}
        </div>

        <h1 className="text-lg font-semibold mt-8 mb-4">Simulate (Admin)</h1>
        <form onSubmit={handleSimulate} className="bg-white border border-neutral-200 rounded p-5 space-y-3">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Samples</label>
            <input
              type="number"
              value={simForm.n_samples}
              onChange={(e) => setSimForm((p) => ({ ...p, n_samples: Number(e.target.value) }))}
              className="w-full border border-neutral-300 rounded px-3 py-1.5 text-sm"
              min={1}
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Attack Ratio (0–1)</label>
            <input
              type="number"
              step="0.01"
              min={0}
              max={1}
              value={simForm.attack_ratio}
              onChange={(e) => setSimForm((p) => ({ ...p, attack_ratio: Number(e.target.value) }))}
              className="w-full border border-neutral-300 rounded px-3 py-1.5 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={simLoading}
            className="w-full bg-black text-white py-2 rounded text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
          >
            {simLoading ? "Simulating..." : "Run Simulation"}
          </button>
        </form>

        {simResult && (
          <div className="mt-4 bg-white border border-neutral-200 rounded p-4 text-sm space-y-1">
            <div><span className="text-neutral-500">Total:</span> {simResult.total}</div>
            <div><span className="text-neutral-500">Threats:</span> {simResult.threats}</div>
            {Object.entries(simResult.by_type).map(([k, v]) => (
              <div key={k}><span className="text-neutral-500 capitalize">{k}:</span> {v}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
