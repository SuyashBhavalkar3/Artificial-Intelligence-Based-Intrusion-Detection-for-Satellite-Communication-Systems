const palette: Record<string, { bg: string; color: string; dot: string }> = {
  critical: { bg: "rgba(255, 0, 60, 0.15)", color: "#ff003c", dot: "#ff003c" },
  high:     { bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", dot: "#f59e0b" },
  medium:   { bg: "rgba(250, 204, 21, 0.15)", color: "#facc15", dot: "#facc15" },
  low:      { bg: "rgba(16, 185, 129, 0.15)", color: "#10b981", dot: "#10b981" },
  normal:   { bg: "rgba(16, 185, 129, 0.15)", color: "#10b981", dot: "#10b981" },
  open:     { bg: "rgba(255, 0, 60, 0.15)", color: "#ff003c", dot: "#ff003c" },
  investigating: { bg: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6", dot: "#8b5cf6" },
  resolved: { bg: "rgba(16, 185, 129, 0.15)", color: "#10b981", dot: "#10b981" },
};

export default function Badge({ value }: { value: string }) {
  const s = palette[value.toLowerCase()] ?? { bg: "#f5f5f5", color: "#6b7280", dot: "#9ca3af" };
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "2px 8px", borderRadius: 20,
        background: s.bg, color: s.color,
        fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {value}
    </span>
  );
}
