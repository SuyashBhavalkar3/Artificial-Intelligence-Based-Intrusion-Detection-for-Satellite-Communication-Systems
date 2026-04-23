"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { ThreatOut } from "@/lib/types";
import Badge from "@/components/Badge";

const SEVERITIES = ["", "low", "medium", "high", "critical"];
const STATUSES = ["", "open", "investigating", "resolved"];

export default function ThreatsPage() {
  const [threats, setThreats] = useState<ThreatOut[]>([]);
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (severity) params.set("severity", severity);
    if (status) params.set("status", status);
    api.get<ThreatOut[]>(`/api/threats?${params}`)
      .then(setThreats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [severity, status]);

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Threats</h1>
      <div className="flex gap-3 mb-5">
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="border border-neutral-300 rounded px-3 py-1.5 text-sm"
        >
          {SEVERITIES.map((s) => <option key={s} value={s}>{s || "All severities"}</option>)}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-neutral-300 rounded px-3 py-1.5 text-sm"
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s || "All statuses"}</option>)}
        </select>
      </div>

      {error && <div className="text-sm text-red-400 mb-4">{error}</div>}
      {loading ? (
        <div className="text-sm text-neutral-500">Scanning_Spectrum...</div>
      ) : (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
          <table className="w-full text-sm">
            <thead style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
              <tr>
                {["ID", "Type", "Severity", "Confidence", "Method", "Status", "Detected At"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{ color: "var(--text)" }}>
              {threats.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid var(--border)" }} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <Link href={`/threats/${t.id}`} className="text-cyan-400 font-mono hover:underline">{t.id}</Link>
                  </td>
                  <td className="px-4 py-3 uppercase text-xs font-bold">{t.threat_type}</td>
                  <td className="px-4 py-3"><Badge value={t.severity} /></td>
                  <td className="px-4 py-3 font-mono">{(t.confidence * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-neutral-400 text-xs">{t.detection_method}</td>
                  <td className="px-4 py-3"><Badge value={t.status} /></td>
                  <td className="px-4 py-3 text-neutral-500 font-mono text-xs">{new Date(t.detected_at).toLocaleString()}</td>
                </tr>
              ))}
              {threats.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-neutral-500 italic">No threats identified in current sector</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) }
    </div>
  );
}
