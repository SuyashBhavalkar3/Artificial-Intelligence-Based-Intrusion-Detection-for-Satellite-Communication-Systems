"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { ThreatOut } from "@/lib/types";
import Badge from "@/components/Badge";

const STATUSES = ["open", "investigating", "resolved"];

export default function ThreatDetailPage() {
  const { id } = useParams();
  const [threat, setThreat] = useState<ThreatOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [explaining, setExplaining] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<ThreatOut>(`/api/threats/${id}`)
      .then(setThreat)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function explainThreat() {
    setExplaining(true);
    try {
      const res = await api.post<{ explanation: string }>(`/api/llm/explain/${id}`, {});
      setThreat((prev) => (prev ? { ...prev, explanation: res.explanation } : prev));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setExplaining(false);
    }
  }

  async function updateStatus(status: string) {
    setUpdating(true);
    try {
      await api.patch(`/api/threats/${id}/status`, { status });
      setThreat((prev) => (prev ? { ...prev, status } : prev));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <div className="text-sm text-neutral-400">Loading...</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!threat) return <div className="text-sm text-neutral-400">Threat not found</div>;

  return (
    <div>
      <h1 className="text-lg font-semibold mb-6">Threat #{threat.id}</h1>

      <div className="bg-white border border-neutral-200 rounded p-5 mb-5">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-neutral-500">Type:</span> {threat.threat_type}</div>
          <div><span className="text-neutral-500">Severity:</span> <Badge value={threat.severity} /></div>
          <div><span className="text-neutral-500">Confidence:</span> {(threat.confidence * 100).toFixed(1)}%</div>
          <div><span className="text-neutral-500">Method:</span> {threat.detection_method}</div>
          <div><span className="text-neutral-500">Status:</span> <Badge value={threat.status} /></div>
          <div><span className="text-neutral-500">Detected:</span> {new Date(threat.detected_at).toLocaleString()}</div>
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium mb-2">Update Status</label>
        <div className="flex gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              disabled={updating || threat.status === s}
              className="px-4 py-1.5 text-sm border border-neutral-300 rounded hover:bg-neutral-50 disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">AI Explanation</h2>
          <button
            onClick={explainThreat}
            disabled={explaining}
            className="px-3 py-1 text-xs bg-black text-white rounded hover:bg-neutral-800 disabled:opacity-50"
          >
            {explaining ? "Generating..." : "Generate"}
          </button>
        </div>
        {threat.explanation ? (
          <p className="text-sm text-neutral-700 whitespace-pre-wrap">{threat.explanation}</p>
        ) : (
          <p className="text-sm text-neutral-400">No explanation yet</p>
        )}
      </div>
    </div>
  );
}
