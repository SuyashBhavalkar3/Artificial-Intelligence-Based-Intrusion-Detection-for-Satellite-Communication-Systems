"use client";
import { useState, useEffect, useRef, FormEvent } from "react";
import { wsUrl } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ws = new WebSocket(wsUrl("/api/llm/chat"));
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "token") {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return [...prev.slice(0, -1), { ...last, content: last.content + data.data }];
          }
          return [...prev, { role: "assistant", content: data.data }];
        });
      } else if (data.type === "done") {
        setStreaming(false);
      }
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || !wsRef.current || streaming) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    wsRef.current.send(JSON.stringify({ message: input }));
    setInput("");
    setStreaming(true);
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", height: "calc(100vh - 160px)", display: "flex", flexDirection: "column" }}>
      <header style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, background: COLORS.primary, borderRadius: "50%", boxShadow: `0 0 10px ${COLORS.primary}` }} />
            <span style={{ fontSize: 10, fontWeight: 900, color: COLORS.primary, letterSpacing: "0.1em" }}>SECURE_COMMAND_LINK</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: COLORS.text }}>AI INTELLIGENCE</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: connected ? COLORS.success : COLORS.critical, fontFamily: "monospace" }}>
            {connected ? "STATUS: LINK_ESTABLISHED" : "STATUS: LINK_OFFLINE"}
          </span>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: connected ? COLORS.success : COLORS.critical }} />
        </div>
      </header>

      <div style={{ 
        flex: 1, background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, 
        borderRadius: 4, padding: 24, overflowY: "auto", marginBottom: 20,
        display: "flex", flexDirection: "column", gap: 16
      }}>
        {messages.length === 0 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: COLORS.muted, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.2 }}>✦</div>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>Awaiting Analysis Query</div>
            <p style={{ fontSize: 11, maxWidth: 300, marginTop: 8 }}>Interface with the Orbital Intelligence Layer for threat analysis and system telemetry.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div
              style={{
                maxWidth: "80%", padding: "12px 16px", borderRadius: 4, fontSize: 13, lineHeight: 1.6,
                background: m.role === "user" ? "#000" : "var(--bg)",
                border: `1px solid ${m.role === "user" ? COLORS.primary : COLORS.border}`,
                color: COLORS.text,
                position: "relative",
                boxShadow: m.role === "user" ? `0 4px 15px ${COLORS.primary}15` : "none"
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 900, color: m.role === "user" ? COLORS.primary : COLORS.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {m.role === "user" ? "ANALIST_QUERY" : "INTELLIGENCE_REPLY"}
              </div>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} style={{ display: "flex", gap: 12 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ENTER_INTEL_QUERY..."
          style={{ 
            flex: 1, background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, 
            borderRadius: 4, padding: "14px 20px", color: COLORS.text, fontSize: 13,
            fontWeight: 600, fontFamily: "monospace"
          }}
          disabled={!connected || streaming}
        />
        <button
          type="submit"
          disabled={!connected || streaming || !input.trim()}
          style={{
            padding: "0 32px", background: COLORS.primary, color: "#000",
            border: "none", borderRadius: 4, fontWeight: 900, fontSize: 12, cursor: "pointer",
            boxShadow: `0 0 15px ${COLORS.primary}30`
          }}
        >
          {streaming ? "ANALYZING..." : "SEND_QUERY"}
        </button>
      </form>
    </div>
  );
}
