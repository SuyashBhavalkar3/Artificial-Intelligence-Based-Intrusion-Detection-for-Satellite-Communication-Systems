"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api, setTokens } from "@/lib/api";
import type { TokenResponse } from "@/lib/types";

const COLORS = {
  primary: "#00f2ff",
  bg: "#0b0e14",
  bgCard: "#151921",
  border: "#1e293b",
  text: "#f8fafc",
  muted: "#94a3b8",
  critical: "#ff003c",
};

function GeometricLogo() {
  return (
    <div style={{ position: "relative", width: 40, height: 40 }}>
      <div style={{ position: "absolute", inset: 0, border: `2px solid ${COLORS.primary}`, opacity: 0.3 }} />
      <div style={{ position: "absolute", inset: "20%", background: COLORS.primary }} />
      <div style={{ position: "absolute", bottom: -4, right: -4, width: 12, height: 12, border: `2px solid ${COLORS.primary}` }} />
    </div>
  );
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post<TokenResponse>("/auth/login", { username, password });
      setTokens(res.access_token, res.refresh_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
        fontFamily: "var(--font-geist-sans), sans-serif",
      }}
    >
      {/* Background technical overlay */}
      <div style={{ 
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0, 
        backgroundImage: `radial-gradient(circle at 50% 50%, #1e293b 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        opacity: 0.1,
        pointerEvents: "none"
      }} />

      <div
        className="animate-fade-up"
        style={{
          background: COLORS.bgCard,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 4,
          padding: 48,
          width: 440,
          boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
          position: "relative", zIndex: 1,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 48 }}>
          <GeometricLogo />
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <div style={{ fontWeight: 900, fontSize: 18, color: COLORS.text, letterSpacing: "0.1em", textTransform: "uppercase" }}>Orbital IDS</div>
            <div style={{ fontSize: 9, color: COLORS.primary, fontWeight: 800, marginTop: 4, letterSpacing: "0.2em" }}>SECURE_AUTHENTICATION_GATE</div>
          </div>
        </div>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: COLORS.text, marginBottom: 8, letterSpacing: "-0.02em" }}>
            ACCESS_PROTOCOL
          </h1>
          <p style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, letterSpacing: "0.05em" }}>
            PROVIDE_CREDENTIALS_FOR_ENCRYPTED_LINK
          </p>
        </div>

        {error && (
          <div style={{
            background: "rgba(255, 0, 60, 0.1)", border: `1px solid ${COLORS.critical}40`,
            borderRadius: 4, padding: "12px 16px",
            fontSize: 11, color: COLORS.critical, marginBottom: 24,
            fontWeight: 800, fontFamily: "monospace"
          }}>
            ERROR_LINK_FAILURE: {error.toUpperCase()}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ fontSize: 9, fontWeight: 900, color: COLORS.muted, display: "block", marginBottom: 8, letterSpacing: "0.1em" }}>
              OPERATOR_ID
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. ADMIN_01"
              required
              style={{
                width: "100%", padding: "14px 16px",
                background: COLORS.bg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 4, fontSize: 13, color: COLORS.text,
                outline: "none", transition: "all 0.2s",
                fontWeight: 600, fontFamily: "monospace"
              }}
              onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
              onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
            />
          </div>
          <div>
            <label style={{ fontSize: 9, fontWeight: 900, color: COLORS.muted, display: "block", marginBottom: 8, letterSpacing: "0.1em" }}>
              ACCESS_KEY
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              style={{
                width: "100%", padding: "14px 16px",
                background: COLORS.bg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 4, fontSize: 13, color: COLORS.text,
                outline: "none", transition: "all 0.2s",
                fontWeight: 600, fontFamily: "monospace"
              }}
              onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
              onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 16,
              padding: "16px",
              background: COLORS.primary,
              color: "#000", border: "none", borderRadius: 4,
              fontSize: 12, fontWeight: 900, cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              boxShadow: loading ? "none" : `0 0 20px ${COLORS.primary}40`,
              letterSpacing: "0.1em"
            }}
          >
            {loading ? "INITIALIZING_LINK..." : "ESTABLISH_CONNECTION"}
          </button>
        </form>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <span style={{ fontSize: 8, fontWeight: 900, color: COLORS.muted, letterSpacing: "0.1em" }}>CRYPTO_STRENGTH: PQC_VERIFIED_256BIT</span>
        </div>
      </div>
    </div>
  );
}
