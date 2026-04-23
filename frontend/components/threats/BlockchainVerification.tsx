"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ShieldCheck, ShieldAlert, Loader2, Link as LinkIcon, Database } from "lucide-react";

interface VerificationData {
  status: "valid" | "tampered" | "not_found";
  blockchain?: {
    threat_id: number;
    threat_type: string;
    severity: string;
    timestamp: number;
    event_hash: string;
  };
  local?: {
    threat_type: string;
    severity: string;
    event_hash: string;
  };
  tx_hash?: string;
  block_number?: number;
  message?: string;
}

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

export default function BlockchainVerification({ threatId }: { threatId: number }) {
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<VerificationData>(`/api/threats/${threatId}/blockchain`)
      .then(setData)
      .catch(() => setData({ status: "not_found", message: "Failed to connect to verification service" }))
      .finally(() => setLoading(false));
  }, [threatId]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 0", color: COLORS.muted, fontSize: 12 }}>
        <Loader2 className="w-4 h-4 animate-spin" />
        VERIFYING_IMMUTABLE_LEDGER...
      </div>
    );
  }

  if (!data || data.status === "not_found") {
    return (
      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: 24, fontSize: 13, color: COLORS.muted }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, color: COLORS.text }}>
          <Database className="w-4 h-4" />
          <span style={{ fontWeight: 900, fontSize: 11, letterSpacing: "0.1em" }}>NO_BLOCKCHAIN_RECORD</span>
        </div>
        <p style={{ fontSize: 11 }}>{data?.message || "This threat has not been notarized on the blockchain yet."}</p>
      </div>
    );
  }

  const isValid = data.status === "valid";

  return (
    <div style={{ 
      border: `1px solid ${isValid ? COLORS.success : COLORS.critical}40`, 
      borderRadius: 4, overflow: "hidden", 
      background: `${isValid ? COLORS.success : COLORS.critical}05` 
    }}>
      <div style={{ 
        padding: "16px 24px", borderBottom: `1px solid ${isValid ? COLORS.success : COLORS.critical}40`, 
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: `${isValid ? COLORS.success : COLORS.critical}10`
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isValid ? (
            <ShieldCheck className="w-5 h-5" style={{ color: COLORS.success }} />
          ) : (
            <ShieldAlert className="w-5 h-5" style={{ color: COLORS.critical }} />
          )}
          <span style={{ fontWeight: 900, fontSize: 12, letterSpacing: "0.1em", color: isValid ? COLORS.success : COLORS.critical }}>
            {isValid ? "LEDGER_INTEGRITY_VERIFIED" : "BLOCKCHAIN_TAMPER_ALERT"}
          </span>
        </div>
        <div style={{ 
          display: "flex", alignItems: "center", gap: 8, padding: "4px 10px", 
          borderRadius: 4, background: "rgba(0,0,0,0.3)", border: `1px solid ${COLORS.border}`, 
          fontSize: 10, fontFamily: "monospace", color: COLORS.primary 
        }}>
          <LinkIcon className="w-3 h-3" />
          TX: {data.tx_hash?.slice(0, 12)}...
        </div>
      </div>

      <div style={{ padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          <div>
            <h4 style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", color: COLORS.muted, marginBottom: 16, letterSpacing: "0.1em" }}>IMMUTABLE_LEDGER_RECORD</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <RecordRow label="THREAT_TYPE" value={data.blockchain?.threat_type} />
              <RecordRow label="SEVERITY" value={data.blockchain?.severity} />
              <RecordRow 
                label="EVENT_HASH" 
                value={data.blockchain?.event_hash.slice(0, 12) + "..."} 
                className="font-mono text-[10px]"
              />
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", color: COLORS.muted, marginBottom: 16, letterSpacing: "0.1em" }}>LOCAL_DATABASE_IMAGE</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <RecordRow 
                label="THREAT_TYPE" 
                value={data.local?.threat_type} 
                isMatch={data.blockchain?.threat_type === data.local?.threat_type} 
              />
              <RecordRow 
                label="SEVERITY" 
                value={data.local?.severity} 
                isMatch={data.blockchain?.severity === data.local?.severity} 
              />
              <RecordRow 
                label="EVENT_HASH" 
                value={data.local?.event_hash.slice(0, 12) + "..."} 
                className="font-mono text-[10px]"
                isMatch={data.blockchain?.event_hash === data.local?.event_hash} 
              />
            </div>
          </div>
        </div>

        {!isValid && (
          <div style={{ 
            marginTop: 24, padding: 16, borderRadius: 4, 
            background: "rgba(255, 0, 60, 0.1)", border: `1px solid ${COLORS.critical}40`,
            fontSize: 11, color: COLORS.critical, lineHeight: 1.5 
          }}>
            <strong>CRITICAL_ALERT:</strong> Local asset record does not match the immutable ledger notarization. Potential unauthorized log modification detected in sector.
          </div>
        )}
      </div>
    </div>
  );
}

function RecordRow({ label, value, isMatch, className = "" }: { label: string; value?: any; isMatch?: boolean; className?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
      <span style={{ color: COLORS.muted }}>{label}:</span>
      <span style={{ 
        fontWeight: 800, color: isMatch === false ? COLORS.critical : COLORS.text,
        textDecoration: isMatch === false ? "underline wavy" : "none",
        fontFamily: className.includes("mono") ? "monospace" : "inherit"
      }}>
        {value?.toString().toUpperCase() || "N/A"}
      </span>
    </div>
  );
}
