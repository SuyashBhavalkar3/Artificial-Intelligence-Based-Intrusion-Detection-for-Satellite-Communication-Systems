"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AlertOut } from "@/lib/types";
import { formatToIST } from "@/lib/utils";

const COLORS = {
  primary: "#00f2ff",
  bg: "#0b0e14",
  bgCard: "#151921",
  border: "#1e293b",
  text: "#f8fafc",
  muted: "#94a3b8",
  low: "#10b981",
  medium: "#facc15",
  high: "#f59e0b",
  critical: "#ff003c",
};

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
    <div style={{ padding: 24, minHeight: "100vh", background: COLORS.bg }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: COLORS.text, letterSpacing: "-0.02em" }}>ALERT_DISPATCH_LOG</h1>
        <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={showUnacked}
            onChange={(e) => setShowUnacked(e.target.checked)}
            style={{ 
              accentColor: COLORS.primary, width: 16, height: 16, 
              background: COLORS.bgCard, border: `1px solid ${COLORS.border}` 
            }}
          />
          <span style={{ fontSize: 10, fontWeight: 900, color: COLORS.primary, letterSpacing: "0.1em" }}>UNACKNOWLEDGED_ONLY</span>
        </label>
      </header>

      {error && <div style={{ color: COLORS.critical, fontSize: 12, marginBottom: 16 }}>ERROR_LOG: {error}</div>}
      
      {loading ? (
        <div style={{ color: COLORS.muted, fontSize: 12, fontFamily: "monospace" }}>SYNCHRONIZING_ALERT_STREAM...</div>
      ) : (
        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 4, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.2)", borderBottom: `1px solid ${COLORS.border}` }}>
                {["ID", "Threat ID", "Channel", "Message", "Sent At", "Status", "Action"].map((h) => (
                  <th key={h} style={{ 
                    textAlign: "left", padding: "16px 24px", fontSize: 10, 
                    fontWeight: 900, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.1em" 
                  }}>{h.replace(" ", "_")}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.id} style={{ borderBottom: `1px solid ${COLORS.border}40`, transition: "background 0.2s" }} className="hover:bg-white/5">
                  <td style={{ padding: "16px 24px", color: COLORS.text, fontWeight: 900, fontFamily: "monospace", fontSize: 13 }}>{a.id.toString().padStart(3, "0")}</td>
                  <td style={{ padding: "16px 24px", color: COLORS.primary, fontWeight: 900, fontFamily: "monospace", fontSize: 13 }}>0X{a.threat_id.toString(16).toUpperCase()}</td>
                  <td style={{ padding: "16px 24px", color: COLORS.text, fontSize: 11, fontWeight: 900, textTransform: "uppercase" }}>{a.channel}</td>
                  <td style={{ padding: "16px 24px", color: COLORS.text, fontSize: 12, fontWeight: 600, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.message}</td>
                  <td style={{ padding: "16px 24px", color: COLORS.muted, fontFamily: "monospace", fontSize: 11 }}>{formatToIST(a.sent_at)}</td>
                  <td style={{ padding: "16px 24px" }}>
                    <span style={{ 
                      fontSize: 9, fontWeight: 900, padding: "4px 10px", borderRadius: 2,
                      background: a.acknowledged ? "rgba(0,0,0,0.3)" : `${COLORS.high}15`,
                      color: a.acknowledged ? COLORS.muted : COLORS.high,
                      border: `1px solid ${a.acknowledged ? COLORS.border : `${COLORS.high}40`}`
                    }}>
                      {a.acknowledged ? "ACKNOWLEDGED" : "PENDING_ACTION"}
                    </span>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    {!a.acknowledged && (
                      <button
                        onClick={() => acknowledge(a.id)}
                        style={{
                          fontSize: 9, fontWeight: 900, padding: "6px 12px",
                          border: `1px solid ${COLORS.primary}`, borderRadius: 2,
                          background: "none", color: COLORS.primary, cursor: "pointer",
                          letterSpacing: "0.05em"
                        }}
                      >
                        RESOLVE_ALERT
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 64, textAlign: "center", color: COLORS.muted, fontSize: 12, fontStyle: "italic", letterSpacing: "0.1em" }}>
                    NO_ALERTS_FOUND_IN_DISPATCH_LOG
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
