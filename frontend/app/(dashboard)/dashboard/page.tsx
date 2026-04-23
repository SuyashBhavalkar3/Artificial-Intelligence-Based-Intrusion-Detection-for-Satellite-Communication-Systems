"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ThreatStats } from "@/lib/types";

const COLORS = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#10b981",
  normal: "#3b82f6",
  primary: "#6366f1",
  bg: "#ffffff",
  border: "#e2e8f0",
  text: "#0f172a",
  muted: "#64748b",
};

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="card-hover animate-fade-up"
      style={{
        background: COLORS.bg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: "20px 24px",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 4, background: color }} />
      <div style={{ fontSize: 32, fontWeight: 800, color: COLORS.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted, marginTop: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
    </div>
  );
}

function SystemStatus({ stats }: { stats: ThreatStats }) {
  const total = Object.values(stats.by_severity).reduce((a, b) => a + b, 0);
  const criticalCount = stats.by_severity.critical || 0;
  const health = Math.max(0, 100 - (criticalCount * 10));
  
  return (
    <div style={{ 
      background: COLORS.bg, 
      border: `1px solid ${COLORS.border}`, 
      borderRadius: 16, 
      padding: 24,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 280
    }}>
      <div style={{ position: "relative", width: 140, height: 140, marginBottom: 20 }}>
        <svg viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
          <circle cx="18" cy="18" r="16" fill="none" stroke="#f1f5f9" strokeWidth="3" />
          <circle 
            cx="18" cy="18" r="16" fill="none" 
            stroke={health > 70 ? COLORS.low : health > 40 ? COLORS.medium : COLORS.critical} 
            strokeWidth="3" 
            strokeDasharray={`${health}, 100`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
        </svg>
        <div style={{ 
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0, 
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" 
        }}>
          <span style={{ fontSize: 24, fontWeight: 800 }}>{health}%</span>
          <span style={{ fontSize: 9, fontWeight: 600, color: COLORS.muted, textTransform: "uppercase" }}>Health</span>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Satellite Constellation Alpha</h3>
        <p style={{ fontSize: 12, color: COLORS.muted }}>
          {health > 80 ? "Systems Optimal" : health > 50 ? "Degraded Performance" : "Critical Failure Risk"}
        </p>
      </div>
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

  if (error) return <div style={{ color: COLORS.critical, padding: 20 }}>{error}</div>;

  if (!stats) return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100 }} />)}
      </div>
      <div className="skeleton" style={{ height: 280 }} />
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <header style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: COLORS.text, letterSpacing: "-0.02em" }}>Command Center</h1>
          <p style={{ fontSize: 14, color: COLORS.muted, marginTop: 4 }}>Constellation Status & Threat Intelligence</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>Uptime</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>99.98%</div>
          </div>
          <div style={{ width: 1, background: COLORS.border, height: 32 }} />
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>Active Sats</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>24 / 24</div>
          </div>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          <StatCard label="Critical Threats" value={stats.by_severity.critical || 0} color={COLORS.critical} />
          <StatCard label="High Severity" value={stats.by_severity.high || 0} color={COLORS.high} />
          <StatCard label="Total Anomalies" value={Object.values(stats.by_type).reduce((a, b) => a + b, 0)} color={COLORS.primary} />
          <StatCard label="Resolved Alerts" value={stats.by_severity.low || 0} color={COLORS.low} />
        </div>
        <SystemStatus stats={stats} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24 }}>
        <section style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24, position: "relative" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text, textTransform: "uppercase", marginBottom: 20 }}>
            Activity Trend (Last 24h)
          </div>
          
          <div style={{ position: "relative", height: 180, display: "flex", alignItems: "flex-end", gap: 2 }}>
            {/* Background Grid Lines */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none" }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{ width: "100%", height: 1, borderTop: `1px dashed ${COLORS.border}` }} />
              ))}
            </div>

            {/* Bars */}
            {[...Array(24)].map((_, i) => {
              const hour = String(i).padStart(2, "0");
              const count = stats.trend_last_24h[hour] || 0;
              const max = Math.max(...Object.values(stats.trend_last_24h), 10); // Min max of 10 for scale
              const pct = (count / max) * 100;
              
              return (
                <div key={hour} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 1 }}>
                  <div
                    className="animate-bar-grow"
                    style={{
                      width: "100%", 
                      height: `${Math.max(pct, count > 0 ? 4 : 0)}%`,
                      background: count > 10 ? COLORS.critical : count > 0 ? COLORS.primary : "transparent",
                      border: count === 0 ? `1px solid ${COLORS.border}` : "none",
                      borderRadius: "1px 1px 0 0",
                      animationDelay: `${i * 20}ms`,
                      opacity: count > 0 ? 1 : 0.3
                    }}
                  />
                  {i % 4 === 0 && <div style={{ fontSize: 8, fontWeight: 600, color: COLORS.muted }}>{hour}h</div>}
                </div>
              );
            })}
          </div>
        </section>

        <section style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text, textTransform: "uppercase", marginBottom: 20 }}>
            Threat Distribution
          </div>
          <div style={{ spaceY: 12 }}>
            {Object.entries(stats.by_type).map(([type, count]) => {
              const total = Object.values(stats.by_type).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={type} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>{type}</span>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{count}</span>
                  </div>
                  <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ 
                      width: `${pct}%`, height: "100%", background: COLORS.primary, 
                      transition: "width 1s ease" 
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
