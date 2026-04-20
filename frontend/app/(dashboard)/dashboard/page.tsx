"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ThreatStats } from "@/lib/types";

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div
      className="card-hover animate-fade-up"
      style={{
        background: "#fff",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "20px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: accent ?? "linear-gradient(90deg, var(--violet), var(--cyan))",
      }} />
      <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, textTransform: "capitalize" }}>{label}</div>
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

  const severityAccent: Record<string, string> = {
    critical: "#dc2626",
    high: "#ea580c",
    medium: "#ca8a04",
    low: "#16a34a",
  };

  if (error) return <div style={{ color: "#dc2626", fontSize: 13 }}>{error}</div>;

  if (!stats) return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 88 }} />)}
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
          Real-time satellite intrusion detection overview
        </p>
      </div>

      <section style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
          By Severity
        </div>
        <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {Object.entries(stats.by_severity).map(([k, v]) => (
            <StatCard key={k} label={k} value={v} accent={severityAccent[k]} />
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
          By Threat Type
        </div>
        <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {Object.entries(stats.by_type).map(([k, v]) => (
            <StatCard key={k} label={k} value={v} />
          ))}
        </div>
      </section>

      <section>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
          Last 24h Trend
        </div>
        <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          {Object.keys(stats.trend_last_24h).length === 0 ? (
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>No data in the last 24 hours</span>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
              {Object.entries(stats.trend_last_24h)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([hour, count], i) => {
                  const max = Math.max(...Object.values(stats.trend_last_24h));
                  const pct = max > 0 ? (count / max) * 100 : 0;
                  return (
                    <div key={hour} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ fontSize: 9, color: "var(--text-muted)" }}>{count}</div>
                      <div
                        className="animate-bar-grow"
                        style={{
                          width: "100%", height: `${Math.max(pct, 4)}%`,
                          background: "linear-gradient(180deg, var(--violet), var(--cyan))",
                          borderRadius: "3px 3px 0 0",
                          animationDelay: `${i * 40}ms`,
                          minHeight: 4,
                        }}
                      />
                      <div style={{ fontSize: 9, color: "var(--text-muted)" }}>{hour}h</div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
