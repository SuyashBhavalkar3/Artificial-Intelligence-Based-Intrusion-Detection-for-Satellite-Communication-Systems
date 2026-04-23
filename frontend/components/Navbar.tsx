"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearTokens } from "@/lib/api";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "⬡" },
  { href: "/threats", label: "Threats", icon: "⚠" },
  { href: "/alerts", label: "Alerts", icon: "🔔" },
  { href: "/ingest", label: "Ingest", icon: "↑" },
  { href: "/chat", label: "AI Chat", icon: "✦" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearTokens();
    router.push("/login");
  }

  return (
    <nav
      style={{
        background: "#fff",
        borderBottom: "1px solid var(--border)",
        boxShadow: "0 1px 12px rgba(124,58,237,0.06)",
      }}
      className="px-6 py-0 flex items-center gap-1 sticky top-0 z-50"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mr-6 py-4">
        <div
          className="animate-pulse-ring"
          style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "var(--violet)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>S</span>
        </div>
        <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: "0.04em", color: "var(--text)" }}>
          Satellite <span style={{ color: "var(--violet)" }}>IDS</span>
        </span>
      </div>

      {/* Links */}
      {links.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={active ? "nav-active" : ""}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "18px 14px",
              fontSize: 13, fontWeight: active ? 600 : 400,
              color: active ? "var(--violet)" : "var(--text-muted)",
              textDecoration: "none",
              transition: "color 0.15s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = "var(--violet)"; }}
            onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
          >
            <span style={{ fontSize: 11 }}>{l.icon}</span>
            {l.label}
          </Link>
        );
      })}

      {/* Logout */}
      <button
        onClick={logout}
        style={{
          marginLeft: "auto",
          fontSize: 13, color: "var(--text-muted)",
          background: "none", border: "none", cursor: "pointer",
          padding: "6px 12px", borderRadius: 6,
          transition: "background 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "var(--violet-light)";
          (e.currentTarget as HTMLElement).style.color = "var(--violet)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "none";
          (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
        }}
      >
        Sign out
      </button>
    </nav>
  );
}
