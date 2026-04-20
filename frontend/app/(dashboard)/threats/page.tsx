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

      {error && <div className="text-sm text-red-600 mb-4">{error}</div>}
      {loading ? (
        <div className="text-sm text-neutral-400">Loading...</div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {["ID", "Type", "Severity", "Confidence", "Method", "Status", "Detected At"].map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-medium text-neutral-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {threats.map((t) => (
                <tr key={t.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-2">
                    <Link href={`/threats/${t.id}`} className="text-black underline underline-offset-2">{t.id}</Link>
                  </td>
                  <td className="px-4 py-2">{t.threat_type}</td>
                  <td className="px-4 py-2"><Badge value={t.severity} /></td>
                  <td className="px-4 py-2">{(t.confidence * 100).toFixed(1)}%</td>
                  <td className="px-4 py-2">{t.detection_method}</td>
                  <td className="px-4 py-2"><Badge value={t.status} /></td>
                  <td className="px-4 py-2 text-neutral-500">{new Date(t.detected_at).toLocaleString()}</td>
                </tr>
              ))}
              {threats.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-neutral-400">No threats found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
