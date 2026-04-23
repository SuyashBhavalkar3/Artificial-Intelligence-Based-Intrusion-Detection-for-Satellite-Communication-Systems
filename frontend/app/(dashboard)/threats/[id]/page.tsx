"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { ThreatOut } from "@/lib/types";
import Badge from "@/components/Badge";
import BlockchainVerification from "@/components/threats/BlockchainVerification";

const STATUSES = ["open", "investigating", "resolved"];

const COLORS = {
  primary: "#00f2ff",
  bg: "#0b0e14",
  bgCard: "#151921",
  border: "#1e293b",
  text: "#f8fafc",
  muted: "#94a3b8",
  success: "#10b981",
  critical: "#ff003c",
};

export default function ThreatDetailPage() {
  const { id } = useParams();
  const [threat, setThreat] = useState<ThreatOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [explaining, setExplaining] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<ThreatOut>(`/api/threats/${id}`)
      .then(setThreat)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function explainThreat() {
    setExplaining(true);
    try {
      const res = await api.post<{ explanation: string }>(`/api/llm/explain/${id}`, {});
      setThreat((prev) => (prev ? { ...prev, explanation: res.explanation } : prev));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setExplaining(false);
    }
  }

  async function updateStatus(status: string) {
    setUpdating(true);
    try {
      await api.patch(`/api/threats/${id}/status`, { status });
      setThreat((prev) => (prev ? { ...prev, status } : prev));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <div style={{ color: COLORS.muted, padding: 20 }}>FETCHING_TELEMETRY...</div>;
  if (error) return <div style={{ color: COLORS.critical, padding: 20 }}>ERROR: {error}</div>;
  if (!threat) return <div style={{ color: COLORS.muted, padding: 20 }}>ASSET_NOT_FOUND</div>;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ marginBottom: 40, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 10, height: 10, background: threat.severity === "critical" ? COLORS.critical : COLORS.primary, borderRadius: "50%", boxShadow: `0 0 10px ${threat.severity === "critical" ? COLORS.critical : COLORS.primary}` }} />
            <span style={{ fontSize: 11, fontWeight: 900, color: COLORS.muted, letterSpacing: "0.2em" }}>THREAT_FILE_#{threat.id}</span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: COLORS.text, letterSpacing: "-0.02em" }}>ANOMALY_DETAIL</h1>
        </div>
        <div style={{ fontSize: 10, fontWeight: 800, color: COLORS.muted, textAlign: "right" }}>
          MISSION_PROFILE: <span style={{ fontFamily: "monospace", color: COLORS.text }}>ORBITAL_IDS_V2</span>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: COLORS.muted, marginBottom: 20, letterSpacing: "0.1em" }}>ASSET_TELEMETRY</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <DetailItem label="TYPE" value={threat.threat_type} />
            <DetailItem label="SEVERITY" value={<Badge value={threat.severity} />} />
            <DetailItem label="CONFIDENCE" value={`${(threat.confidence * 100).toFixed(1)}%`} mono />
            <DetailItem label="DETECTION_ENGINE" value={threat.detection_method} />
            <DetailItem label="LATEST_STATUS" value={<Badge value={threat.status} />} />
            <DetailItem label="TIMESTAMP" value={new Date(threat.detected_at).toLocaleTimeString()} mono />
          </div>
        </div>

        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: COLORS.muted, marginBottom: 20, letterSpacing: "0.1em" }}>OPERATOR_CONTROLS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 9, fontWeight: 800, color: COLORS.muted, marginBottom: 8 }}>UPDATE_CLASSIFICATION</label>
              <div style={{ display: "flex", gap: 10 }}>
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    disabled={updating || threat.status === s}
                    style={{
                      flex: 1, padding: "10px", fontSize: 10, fontWeight: 900,
                      background: threat.status === s ? COLORS.primary : "none",
                      color: threat.status === s ? "#000" : COLORS.text,
                      border: `1px solid ${threat.status === s ? COLORS.primary : COLORS.border}`,
                      borderRadius: 4, cursor: "pointer", textTransform: "uppercase",
                      transition: "all 0.2s"
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <BlockchainVerification threatId={Number(id)} />
      </div>

      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 16, color: COLORS.primary }}>✦</div>
            <div style={{ fontSize: 11, fontWeight: 900, color: COLORS.text, letterSpacing: "0.1em" }}>INTELLIGENCE_LAYER_EXPLANATION</div>
          </div>
          <button
            onClick={explainThreat}
            disabled={explaining}
            style={{
              padding: "8px 24px", background: "none", color: COLORS.primary,
              border: `1px solid ${COLORS.primary}`, borderRadius: 4, fontWeight: 900, fontSize: 11, cursor: "pointer"
            }}
          >
            {explaining ? "RECOMPUTING..." : "GENERATE_ANALYSIS"}
          </button>
        </div>
        
        {threat.explanation ? (
          <div style={{ 
            fontSize: 14, color: COLORS.text, lineHeight: 1.8, 
            background: "rgba(0,0,0,0.2)", padding: 24, borderRadius: 4, 
            border: `1px solid ${COLORS.border}`, fontFamily: "monospace" 
          }}>
            <div style={{ whiteSpace: "pre-wrap" }}>{threat.explanation}</div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 40, color: COLORS.muted, fontSize: 12, fontStyle: "italic" }}>
            Awaiting Operator instruction for detailed anomaly breakdown.
          </div>
        )}
      </div>
    </div>
  );
}

function DetailItem({ label, value, mono }: { label: string; value: any; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 800, color: COLORS.muted, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, fontFamily: mono ? "monospace" : "inherit" }}>{value}</div>
    </div>
  );
}
