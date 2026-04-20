"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api, setTokens } from "@/lib/api";
import type { TokenResponse } from "@/lib/types";

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
        background: "var(--bg-subtle)",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Background orbs */}
      <div style={{
        position: "absolute", top: -120, right: -120,
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -100, left: -100,
        width: 350, height: 350, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div
        className="animate-fade-up"
        style={{
          background: "#fff",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "40px 36px",
          width: 360,
          boxShadow: "0 20px 60px rgba(124,58,237,0.1)",
          position: "relative", zIndex: 1,
        }}
      >
        {/* Logo mark */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, var(--violet), var(--cyan))",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
          }}>
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 800 }}>S</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>Satellite IDS</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Intrusion Detection System</div>
          </div>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: "var(--text)" }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
          Sign in to your account to continue
        </p>

        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: 8, padding: "10px 14px",
            fontSize: 13, color: "#dc2626", marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              style={{
                width: "100%", padding: "10px 14px",
                border: "1.5px solid var(--border)",
                borderRadius: 8, fontSize: 14, color: "var(--text)",
                outline: "none", transition: "border-color 0.15s",
                background: "#fff",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--violet)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%", padding: "10px 14px",
                border: "1.5px solid var(--border)",
                borderRadius: 8, fontSize: 14, color: "var(--text)",
                outline: "none", transition: "border-color 0.15s",
                background: "#fff",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--violet)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              padding: "11px",
              background: loading
                ? "var(--border-strong)"
                : "linear-gradient(135deg, var(--violet), var(--cyan))",
              color: "#fff", border: "none", borderRadius: 8,
              fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
              transition: "opacity 0.15s, transform 0.15s",
              boxShadow: loading ? "none" : "0 4px 14px rgba(124,58,237,0.35)",
            }}
            onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
          >
            {loading ? (
              <span className="dot-loader" style={{ display: "flex", justifyContent: "center", gap: 4 }}>
                <span /><span /><span />
              </span>
            ) : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
