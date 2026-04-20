"use client";
import { useState, useEffect, useRef, FormEvent } from "react";
import { wsUrl } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

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
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">AI Chat</h1>
        <span className={`text-xs ${connected ? "text-green-600" : "text-red-600"}`}>
          {connected ? "Connected" : "Disconnected"}
        </span>
      </div>

      <div className="flex-1 bg-white border border-neutral-200 rounded p-4 overflow-y-auto mb-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-md px-4 py-2 rounded text-sm ${
                m.role === "user"
                  ? "bg-black text-white"
                  : "bg-neutral-100 text-neutral-800"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about threats, alerts, or system status..."
          className="flex-1 border border-neutral-300 rounded px-3 py-2 text-sm"
          disabled={!connected || streaming}
        />
        <button
          type="submit"
          disabled={!connected || streaming || !input.trim()}
          className="px-5 py-2 bg-black text-white rounded text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
