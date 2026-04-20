"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AlertOut } from "@/lib/types";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertOut[]>([]);
  const [showUnacked, setShowUnacked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    const params = showUnacked ? "?acknowledged=false" : "";
    api.get<AlertOut[]>(`/api/alerts${params}`)
      .then(setAlerts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [showUnacked]);

  async function acknowledge(id: number) {
    try {
      await api.patch(`/api/alerts/${id}/acknowledge`);
      setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, acknowledged: true } : a));
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold">Alerts</h1>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showUnacked}
            onChange={(e) => setShowUnacked(e.target.checked)}
          />
          Unacknowledged only
        </label>
      </div>

      {error && <div className="text-sm text-red-600 mb-4">{error}</div>}
      {loading ? (
        <div className="text-sm text-neutral-400">Loading...</div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {["ID", "Threat", "Channel", "Message", "Sent At", "Status", "Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-medium text-neutral-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-2">{a.id}</td>
                  <td className="px-4 py-2">{a.threat_id}</td>
                  <td className="px-4 py-2">{a.channel}</td>
                  <td className="px-4 py-2 max-w-xs truncate">{a.message}</td>
                  <td className="px-4 py-2 text-neutral-500">{new Date(a.sent_at).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <span className={`text-xs font-medium ${a.acknowledged ? "text-neutral-400" : "text-black"}`}>
                      {a.acknowledged ? "Acknowledged" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {!a.acknowledged && (
                      <button
                        onClick={() => acknowledge(a.id)}
                        className="text-xs px-2 py-1 border border-neutral-300 rounded hover:bg-neutral-50"
                      >
                        Acknowledge
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-neutral-400">No alerts</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
