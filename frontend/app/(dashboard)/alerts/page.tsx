"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AlertOut } from "@/lib/types";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertOut[]>([]);
  const [showUnacked, setShowUnacked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    const params = showUnacked ? "?acknowledged=false" : "";
    api.get<AlertOut[]>(`/api/alerts${params}`)
      .then(setAlerts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [showUnacked]);

  async function acknowledge(id: number) {
    try {
      await api.patch(`/api/alerts/${id}/acknowledge`);
      setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, acknowledged: true } : a));
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold">Alerts</h1>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showUnacked}
            onChange={(e) => setShowUnacked(e.target.checked)}
          />
          Unacknowledged only
        </label>
      </div>

      {error && <div className="text-sm text-red-400 mb-4">{error}</div>}
      {loading ? (
        <div className="text-sm text-neutral-500">Loading_Telemetry...</div>
      ) : (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
          <table className="w-full text-sm">
            <thead style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
              <tr>
                {["ID", "Threat", "Channel", "Message", "Sent At", "Status", "Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{ color: "var(--text)" }}>
              {alerts.map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid var(--border)" }} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-mono">{a.id}</td>
                  <td className="px-4 py-3 font-mono text-cyan-400">{a.threat_id}</td>
                  <td className="px-4 py-3 uppercase text-xs font-bold text-neutral-400">{a.channel}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{a.message}</td>
                  <td className="px-4 py-3 text-neutral-500 font-mono text-xs">{new Date(a.sent_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span style={{ 
                      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                      background: a.acknowledged ? "var(--bg)" : "rgba(245, 158, 11, 0.1)",
                      color: a.acknowledged ? "var(--text-muted)" : "#f59e0b"
                    }}>
                      {a.acknowledged ? "ACKNOWLEDGED" : "PENDING_ACTION"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {!a.acknowledged && (
                      <button
                        onClick={() => acknowledge(a.id)}
                        style={{
                          fontSize: 10, fontWeight: 700, padding: "4px 10px",
                          border: "1px solid var(--border-strong)", borderRadius: 4,
                          background: "none", color: "var(--cyan)", cursor: "pointer"
                        }}
                      >
                        ACKNOWLEDGE
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-neutral-400">No alerts</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
