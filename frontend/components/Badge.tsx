const palette: Record<string, { bg: string; color: string; dot: string }> = {
  critical: { bg: "#fef2f2", color: "#dc2626", dot: "#dc2626" },
  high:     { bg: "#fff7ed", color: "#ea580c", dot: "#ea580c" },
  medium:   { bg: "#fefce8", color: "#ca8a04", dot: "#ca8a04" },
  low:      { bg: "#f0fdf4", color: "#16a34a", dot: "#16a34a" },
  normal:   { bg: "#f0fdf4", color: "#16a34a", dot: "#16a34a" },
  open:     { bg: "#fef2f2", color: "#dc2626", dot: "#dc2626" },
  investigating: { bg: "#ede9fe", color: "#7c3aed", dot: "#7c3aed" },
  resolved: { bg: "#f0fdf4", color: "#16a34a", dot: "#16a34a" },
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
