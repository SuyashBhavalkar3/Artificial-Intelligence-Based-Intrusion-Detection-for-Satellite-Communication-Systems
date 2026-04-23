"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { ThreatOut } from "@/lib/types";
import Badge from "@/components/Badge";
import { formatToIST } from "@/lib/utils";

const SEVERITIES = ["", "low", "medium", "high", "critical"];
const STATUSES = ["", "open", "investigating", "resolved"];

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
    <div style={{ padding: 24, minHeight: "100vh", background: COLORS.bg }}>
      <header style={{ marginBottom: 40, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: COLORS.text, letterSpacing: "-0.02em", marginBottom: 20 }}>THREAT_REGISTRY</h1>
        <div style={{ display: "flex", gap: 16 }}>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            style={{ 
              background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, 
              borderRadius: 4, padding: "8px 16px", fontSize: 12, fontWeight: 800,
              color: COLORS.primary, outline: "none", cursor: "pointer",
              fontFamily: "monospace", textTransform: "uppercase"
            }}
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s} style={{ background: COLORS.bgCard, color: COLORS.text }}>
                {s ? `SEVERITY: ${s.toUpperCase()}` : "ALL_SEVERITIES"}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ 
              background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, 
              borderRadius: 4, padding: "8px 16px", fontSize: 12, fontWeight: 800,
              color: COLORS.primary, outline: "none", cursor: "pointer",
              fontFamily: "monospace", textTransform: "uppercase"
            }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} style={{ background: COLORS.bgCard, color: COLORS.text }}>
                {s ? `STATUS: ${s.toUpperCase()}` : "ALL_STATUSES"}
              </option>
            ))}
          </select>
        </div>
      </header>

      {error && <div style={{ color: COLORS.critical, fontSize: 12, marginBottom: 16 }}>ERROR_LOG: {error}</div>}
      
      {loading ? (
        <div style={{ color: COLORS.muted, fontSize: 12, fontFamily: "monospace" }}>SYNCHRONIZING_THREAT_DATABASE...</div>
      ) : (
        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 4, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.2)", borderBottom: `1px solid ${COLORS.border}` }}>
                {["ID", "Threat Type", "Severity", "Confidence", "Method", "Status", "Detected At"].map((h) => (
                  <th key={h} style={{ 
                    textAlign: "left", padding: "16px 24px", fontSize: 10, 
                    fontWeight: 900, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.1em" 
                  }}>{h.replace(" ", "_")}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {threats.map((t) => (
                <tr key={t.id} style={{ borderBottom: `1px solid ${COLORS.border}40`, transition: "background 0.2s" }} className="hover:bg-white/5">
                  <td style={{ padding: "16px 24px" }}>
                    <Link href={`/threats/${t.id}`} style={{ color: COLORS.primary, fontWeight: 900, fontFamily: "monospace", textDecoration: "none" }}>{t.id.toString().padStart(3, "0")}</Link>
                  </td>
                  <td style={{ padding: "16px 24px", color: COLORS.text, fontSize: 11, fontWeight: 900, textTransform: "uppercase" }}>{t.threat_type}</td>
                  <td style={{ padding: "16px 24px" }}><Badge value={t.severity} /></td>
                  <td style={{ padding: "16px 24px", color: COLORS.text, fontWeight: 900, fontFamily: "monospace", fontSize: 13 }}>{(t.confidence * 100).toFixed(1)}%</td>
                  <td style={{ padding: "16px 24px", color: COLORS.muted, fontSize: 11, fontWeight: 700 }}>{t.detection_method}</td>
                  <td style={{ padding: "16px 24px" }}><Badge value={t.status} /></td>
                  <td style={{ padding: "16px 24px", color: COLORS.muted, fontFamily: "monospace", fontSize: 11 }}>{formatToIST(t.detected_at)}</td>
                </tr>
              ))}
              {threats.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 64, textAlign: "center", color: COLORS.muted, fontSize: 12, fontStyle: "italic", letterSpacing: "0.1em" }}>
                    NO_THREATS_IDENTIFIED_IN_CURRENT_SECTOR
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) }
    </div>
  );
}
