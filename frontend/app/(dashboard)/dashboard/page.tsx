"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ThreatStats } from "@/lib/types";

const COLORS = {
  critical: "#ff003c",
  high: "#f59e0b",
  medium: "#facc15",
  low: "#10b981",
  primary: "#00f2ff",
  bg: "#0b0e14",
  bgCard: "#151921",
  border: "#1e293b",
  text: "#f8fafc",
  muted: "#94a3b8",
  success: "#10b981",
};

function GeometricIcon({ color }: { color: string }) {
  return (
    <div style={{ position: "relative", width: 24, height: 24 }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: `1px solid ${color}`, opacity: 0.3 }} />
      <div style={{ position: "absolute", top: "25%", left: "25%", width: "50%", height: "50%", background: color }} />
      <div style={{ position: "absolute", bottom: -2, right: -2, width: 6, height: 6, border: `1px solid ${color}` }} />
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="card-hover animate-fade-up"
      style={{
        background: COLORS.bgCard,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 4,
        padding: "24px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 16
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <GeometricIcon color={color} />
        <div style={{ fontSize: 10, fontWeight: 800, color: color, letterSpacing: "0.1em" }}>SECURE_LINK</div>
      </div>
      <div>
        <div style={{ fontSize: 36, fontWeight: 900, color: COLORS.text, lineHeight: 1, fontFamily: "monospace" }}>{value}</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.muted, marginTop: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}, transparent)` }} />
    </div>
  );
}

function RadarVisual() {
  return (
    <div style={{ 
      position: "relative", width: 160, height: 160, borderRadius: "50%", 
      border: `1px solid ${COLORS.border}`, background: "#06080c",
      overflow: "hidden"
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, 
        background: "repeating-radial-gradient(circle, transparent 0, transparent 20px, #1e293b 21px, #1e293b 22px)", opacity: 0.5 }} />
      {/* Scanning Line */}
      <div style={{
        position: "absolute", top: "50%", left: "50%", width: "50%", height: 100,
        background: `conic-gradient(from 0deg, ${COLORS.primary}40, transparent)`,
        transformOrigin: "0 0",
        marginTop: -100,
        animation: "spin-slow 4s linear infinite"
      }} />
      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: COLORS.border }} />
      <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: COLORS.border }} />
      {/* Blips */}
      <div className="animate-pulse-ring" style={{ position: "absolute", top: "30%", left: "40%", width: 4, height: 4, background: COLORS.primary, borderRadius: "50%" }} />
      <div className="animate-pulse-ring" style={{ position: "absolute", top: "70%", left: "80%", width: 4, height: 4, background: COLORS.critical, borderRadius: "50%" }} />
    </div>
  );
}

function SystemStatus({ stats }: { stats: ThreatStats }) {
  const criticalCount = stats.by_severity.critical || 0;
  const health = Math.max(0, 100 - (criticalCount * 10));
  
  return (
    <div style={{ 
      background: COLORS.bgCard, 
      border: `1px solid ${COLORS.border}`, 
      borderRadius: 4, 
      padding: "40px 24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 340,
      position: "relative"
    }}>
      <div style={{ position: "absolute", top: 12, left: 12, fontSize: 10, fontWeight: 800, color: COLORS.muted }}>SYS_SCAN_V2.0</div>
      <div style={{ marginBottom: 32 }}>
        <RadarVisual />
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: health > 70 ? COLORS.low : COLORS.critical, fontFamily: "monospace" }}>{health}.00%</div>
        <div style={{ fontSize: 10, fontWeight: 800, color: COLORS.muted, textTransform: "uppercase", marginTop: 4, letterSpacing: "0.2em" }}>Operational Health</div>
      </div>
    </div>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ borderLeft: `2px solid ${COLORS.border}`, paddingLeft: 12 }}>
      <div style={{ fontSize: 8, fontWeight: 900, color: COLORS.muted, letterSpacing: "0.1em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 11, fontWeight: 900, color: COLORS.text, fontFamily: "monospace" }}>{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<ThreatStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<ThreatStats>("/api/threats/stats/summary")
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div style={{ color: COLORS.critical, padding: 20 }}>ERROR: {error}</div>;

  if (!stats) return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 140, background: COLORS.bgCard }} />)}
      </div>
      <div className="skeleton" style={{ height: 340, background: COLORS.bgCard }} />
    </div>
  );

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: 20, background: COLORS.bg, minHeight: "100vh" }}>
      <header style={{ marginBottom: 48, display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 12, height: 12, background: COLORS.primary, borderRadius: "50%", boxShadow: `0 0 10px ${COLORS.primary}` }} />
            <span style={{ fontSize: 12, fontWeight: 900, color: COLORS.primary, letterSpacing: "0.2em" }}>ORBITAL_DEFENSE_GRID</span>
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 900, color: COLORS.text, letterSpacing: "-0.04em", lineHeight: 1 }}>DASHBOARD</h1>
        </div>
        <div style={{ display: "flex", gap: 40 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: COLORS.muted, textTransform: "uppercase" }}>Uptime_Status</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: COLORS.low, fontFamily: "monospace" }}>99.982%</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: COLORS.muted, textTransform: "uppercase" }}>Active_Nodes</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: COLORS.text, fontFamily: "monospace" }}>24 / 0x18</div>
          </div>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr", gap: 24, marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          <StatCard label="Critical Threats" value={stats.by_severity.critical || 0} color={COLORS.critical} />
          <StatCard label="High Severity" value={stats.by_severity.high || 0} color={COLORS.high} />
          <StatCard label="Anomalies Detected" value={Object.values(stats.by_type).reduce((a, b) => a + b, 0)} color={COLORS.primary} />
          <StatCard label="Resolved Actions" value={stats.by_severity.low || 0} color={COLORS.low} />
        </div>
        <SystemStatus stats={stats} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
        <section style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: 32, position: "relative", overflow: "hidden" }}>
          {/* Scanning Scanline Overlay */}
          <div style={{ 
            position: "absolute", top: 0, bottom: 0, width: 2, 
            background: `linear-gradient(to bottom, transparent, ${COLORS.primary}, transparent)`,
            boxShadow: `0 0 15px ${COLORS.primary}`,
            zIndex: 10,
            left: 0,
            animation: "scanline-move 8s linear infinite"
          }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: COLORS.text, textTransform: "uppercase", letterSpacing: "0.2em" }}>
                Transmission Spectrum Analysis
              </div>
              <span style={{ fontSize: 9, fontWeight: 900, color: COLORS.success, background: "rgba(16, 185, 129, 0.1)", padding: "2px 6px", borderRadius: 2 }}>REALTIME_SYNC_ENABLED</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: COLORS.primary, fontFamily: "monospace" }}>FREQ_SYNC: 1420.042 MHZ</div>
              <div style={{ fontSize: 8, fontWeight: 800, color: COLORS.muted }}>SENSITIVITY: -120 DBM</div>
            </div>
          </div>
          
          <div style={{ position: "relative", height: 260, display: "flex", alignItems: "flex-end", gap: 4, paddingLeft: 40 }}>
            {/* Y-Axis Labels (DBM Scale) */}
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 30, display: "flex", flexDirection: "column", justifyContent: "space-between", paddingBottom: 24 }}>
              {["0dBm", "-20", "-40", "-60", "-80", "-100"].map(label => (
                <div key={label} style={{ fontSize: 8, fontWeight: 800, color: COLORS.muted, fontFamily: "monospace" }}>{label}</div>
              ))}
            </div>

            {/* Background Structural Grid */}
            <div style={{ position: "absolute", top: 0, left: 40, right: 0, bottom: 0, display: "flex", gap: 4, pointerEvents: "none" }}>
              {[...Array(24)].map((_, i) => (
                <div key={i} style={{ flex: 1, borderLeft: `1px solid ${COLORS.border}40` }} />
              ))}
            </div>
            <div style={{ position: "absolute", top: 0, left: 40, right: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none", paddingBottom: 24 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ width: "100%", height: 1, borderTop: `1px solid ${COLORS.border}${i === 5 ? "80" : "40"}` }} />
              ))}
            </div>

            {/* Simulated Noise Floor */}
            <div style={{ position: "absolute", left: 40, right: 0, bottom: 24, height: 2, background: COLORS.muted, opacity: 0.1 }} />

            {/* Signal Bars */}
            {[...Array(24)].map((_, i) => {
              const hour = String(i).padStart(2, "0");
              const count = stats.trend_last_24h[hour] || 0;
              const max = Math.max(...Object.values(stats.trend_last_24h), 10);
              const pct = (count / max) * 100;
              
              // Random noise jitter for "active" look
              const noise = count === 0 ? Math.random() * 5 : 0;
              
              return (
                <div key={hour} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, zIndex: 1, height: "100%", justifyContent: "flex-end", paddingBottom: 24 }}>
                  {count > 20 && (
                    <div style={{ 
                      fontSize: 8, fontWeight: 900, color: COLORS.critical, 
                      fontFamily: "monospace", marginBottom: 4, animation: "fadeIn 0.5s ease" 
                    }}>PEAK</div>
                  )}
                  <div
                    className="animate-bar-grow"
                    style={{
                      width: "100%", 
                      height: `${Math.max(pct + noise, count > 0 ? 4 : 2)}%`,
                      background: count > 20 ? COLORS.critical : count > 0 ? COLORS.primary : COLORS.border,
                      boxShadow: count > 0 ? `0 0 20px ${count > 20 ? COLORS.critical : COLORS.primary}40` : "none",
                      animationDelay: `${i * 15}ms`,
                      borderRadius: "1px 1px 0 0",
                      opacity: count > 0 ? 1 : 0.3
                    }}
                  />
                  {i % 4 === 0 && (
                    <div style={{ 
                      position: "absolute", bottom: 0, 
                      fontSize: 9, fontWeight: 900, color: COLORS.muted, 
                      fontFamily: "monospace", marginTop: 8 
                    }}>{hour}H</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Technical Readouts */}
          <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, borderTop: `1px solid ${COLORS.border}`, paddingTop: 20 }}>
            <Readout label="NOISE_FLOOR" value="-108.4 dBm" />
            <Readout label="PEAK_SIGNAL" value="1420.0 MHz" />
            <Readout label="BW_UTILIZATION" value="14.2%" />
          </div>
        </section>

        <section style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: COLORS.text, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 40 }}>
            Threat Intelligence Matrix
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {Object.entries(stats.by_type).map(([type, count]) => {
              const total = Object.values(stats.by_type).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={type}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", color: COLORS.muted, letterSpacing: "0.1em" }}>{type}</span>
                    <span style={{ fontSize: 12, fontWeight: 900, color: COLORS.primary, fontFamily: "monospace" }}>{count.toString(16).toUpperCase().padStart(2, "0")}h</span>
                  </div>
                  <div style={{ height: 4, background: "#1e293b", overflow: "hidden" }}>
                    <div style={{ 
                      width: `${pct}%`, height: "100%", background: COLORS.primary, 
                      boxShadow: `0 0 10px ${COLORS.primary}`,
                      transition: "width 1.5s cubic-bezier(.22,1,.36,1)" 
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
