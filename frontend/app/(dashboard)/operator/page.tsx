"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Satellite {
  id: number;
  name: string;
  norad_id: string;
  status: string;
  encryption_key_status: string;
  last_contact: string;
}

const COLORS = {
  active: "#10b981",
  maintenance: "#f59e0b",
  decommissioned: "#ef4444",
  primary: "#00f2ff",
  border: "#1e293b",
  bg: "#0b0e14",
  bgCard: "#151921",
  text: "#f8fafc",
  muted: "#94a3b8",
};

export default function OperatorPage() {
  const [sats, setSats] = useState<Satellite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newSat, setNewSat] = useState({ name: "", norad_id: "" });
  const [cmdStatus, setCmdStatus] = useState<any>(null);

  useEffect(() => {
    fetchSats();
  }, []);

  async function fetchSats() {
    try {
      const data = await api.get<Satellite[]>("/api/satellites");
      setSats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function addSat() {
    try {
      await api.post("/api/satellites", newSat);
      setShowAdd(false);
      setNewSat({ name: "", norad_id: "" });
      fetchSats();
    } catch (e) {
      alert("Failed to add satellite");
    }
  }

  async function sendCommand(id: number, cmd: string) {
    try {
      const res = await api.post(`/api/satellites/${id}/command?command=${encodeURIComponent(cmd)}`, {});
      setCmdStatus(res);
      setTimeout(() => setCmdStatus(null), 5000);
    } catch (e) {
      alert("Command transmission failed");
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: COLORS.text }}>FLEET_OPERATIONS</h1>
          <p style={{ fontSize: 12, color: COLORS.muted, letterSpacing: "0.1em" }}>REMOTE_CONSTELLATION_CONTROL_V2.4</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            background: COLORS.primary, color: "#000", border: "none",
            padding: "10px 24px", borderRadius: 4, fontWeight: 800, fontSize: 11, cursor: "pointer",
            boxShadow: `0 0 15px ${COLORS.primary}40`
          }}
        >
          + REGISTER_ASSET
        </button>
      </header>

      {cmdStatus && (
        <div className="animate-fade-up" style={{ 
          background: "rgba(16, 185, 129, 0.1)", border: `1px solid ${COLORS.active}`, borderRadius: 4, 
          padding: 16, marginBottom: 32, color: COLORS.active 
        }}>
          <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 4 }}>COMMAND_LINK_ESTABLISHED</div>
          <div style={{ fontSize: 11 }}>ASSET: {cmdStatus.satellite} | CRYPTO: {cmdStatus.security} | PQC: VERIFIED</div>
        </div>
      )}

      {loading ? (
        <div className="skeleton" style={{ height: 400, background: COLORS.bgCard }} />
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {sats.map((sat) => (
            <div key={sat.id} style={{ 
              background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: 24,
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 900, color: COLORS.text, fontFamily: "monospace" }}>{sat.name}</h3>
                  <span style={{ 
                    fontSize: 9, fontWeight: 900, padding: "2px 8px", borderRadius: 2,
                    background: sat.status === "active" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                    color: sat.status === "active" ? COLORS.active : COLORS.decommissioned,
                    border: `1px solid ${sat.status === "active" ? COLORS.active : COLORS.decommissioned}40`
                  }}>
                    {sat.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "monospace" }}>
                  NORAD_ID: {sat.norad_id} | KEY_STATUS: {sat.encryption_key_status.toUpperCase()} | SYNC: {new Date(sat.last_contact).toLocaleTimeString()}
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => sendCommand(sat.id, "REBOOT_COMM_MODULE")}
                  style={{
                    background: "none", border: `1px solid ${COLORS.border}`,
                    padding: "10px 16px", borderRadius: 4, fontSize: 10, fontWeight: 800, color: COLORS.text, cursor: "pointer"
                  }}
                >
                  📡 REBOOT_COMM
                </button>
                <button
                  onClick={() => sendCommand(sat.id, "ROTATE_AES_KEYS")}
                  style={{
                    background: "none", border: `1px solid ${COLORS.primary}`,
                    padding: "10px 16px", borderRadius: 4, fontSize: 10, fontWeight: 800, color: COLORS.primary, cursor: "pointer"
                  }}
                >
                  🔐 ROTATE_KEYS
                </button>
              </div>
            </div>
          ))}
          {sats.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 0", color: COLORS.muted, fontSize: 13, fontStyle: "italic" }}>
              NO_ASSETS_REGISTERED_IN_SECTOR.
            </div>
          )}
        </div>
      )}

      {showAdd && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
        }}>
          <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, padding: 40, borderRadius: 8, width: 440 }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 32, color: COLORS.text }}>REGISTER_NEW_ASSET</h2>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: COLORS.muted, marginBottom: 8 }}>ASSET_NAME</label>
              <input
                type="text"
                value={newSat.name}
                onChange={(e) => setNewSat({ ...newSat, name: e.target.value })}
                style={{ width: "100%", padding: 12, background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 4, color: COLORS.text, fontWeight: 700 }}
                placeholder="e.g. STARLINK_V2_3"
              />
            </div>
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 800, color: COLORS.muted, marginBottom: 8 }}>NORAD_CATALOG_ID</label>
              <input
                type="text"
                value={newSat.norad_id}
                onChange={(e) => setNewSat({ ...newSat, norad_id: e.target.value })}
                style={{ width: "100%", padding: 12, background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 4, color: COLORS.text, fontWeight: 700 }}
                placeholder="e.g. 54321"
              />
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <button
                onClick={addSat}
                style={{
                  flex: 1, background: COLORS.primary, color: "#000", border: "none",
                  padding: 14, borderRadius: 4, fontWeight: 900, fontSize: 12, cursor: "pointer"
                }}
              >
                CONFIRM_REGISTRATION
              </button>
              <button
                onClick={() => setShowAdd(false)}
                style={{
                  flex: 1, background: "none", border: `1px solid ${COLORS.border}`,
                  padding: 14, borderRadius: 4, fontWeight: 900, fontSize: 12, color: COLORS.text, cursor: "pointer"
                }}
              >
                ABORT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
