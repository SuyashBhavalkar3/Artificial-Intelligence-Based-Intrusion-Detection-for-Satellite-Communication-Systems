"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ShieldCheck, ShieldAlert, Loader2, Link as LinkIcon, Database } from "lucide-react";

interface VerificationData {
  status: "valid" | "tampered" | "not_found";
  blockchain?: {
    threat_id: number;
    threat_type: string;
    severity: string;
    timestamp: number;
    event_hash: string;
  };
  local?: {
    threat_type: string;
    severity: string;
    event_hash: string;
  };
  tx_hash?: string;
  block_number?: number;
  message?: string;
}

export default function BlockchainVerification({ threatId }: { threatId: number }) {
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<VerificationData>(`/api/threats/${threatId}/blockchain`)
      .then(setData)
      .catch(() => setData({ status: "not_found", message: "Failed to connect to verification service" }))
      .finally(() => setLoading(false));
  }, [threatId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-neutral-500 py-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        Verifying integrity on Ethereum Ledger...
      </div>
    );
  }

  if (!data || data.status === "not_found") {
    return (
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-sm text-neutral-500">
        <div className="flex items-center gap-2 mb-1">
          <Database className="w-4 h-4" />
          <span className="font-medium">No Blockchain Record</span>
        </div>
        <p className="text-xs">{data?.message || "This threat has not been notarized on the blockchain yet."}</p>
      </div>
    );
  }

  const isValid = data.status === "valid";

  return (
    <div className={`border rounded-lg overflow-hidden ${isValid ? "border-green-200 bg-green-50/30" : "border-red-200 bg-red-50/30"}`}>
      <div className={`px-4 py-3 border-b flex items-center justify-between ${isValid ? "border-green-200" : "border-red-200"}`}>
        <div className="flex items-center gap-2">
          {isValid ? (
            <ShieldCheck className="w-5 h-5 text-green-600" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-red-600" />
          )}
          <span className={`font-semibold ${isValid ? "text-green-900" : "text-red-900"}`}>
            {isValid ? "Integrity Verified" : "TAMPER ALERT"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/50 border border-neutral-200 text-[10px] font-mono text-neutral-600">
          <LinkIcon className="w-3 h-3" />
          {data.tx_hash?.slice(0, 10)}...
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Blockchain Record</h4>
            <div className="space-y-1">
              <RecordRow label="Type" value={data.blockchain?.threat_type} />
              <RecordRow label="Severity" value={data.blockchain?.severity} />
              <RecordRow 
                label="Hash" 
                value={data.blockchain?.event_hash.slice(0, 8) + "..."} 
                className="font-mono text-[10px]"
              />
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Local Database</h4>
            <div className="space-y-1">
              <RecordRow 
                label="Type" 
                value={data.local?.threat_type} 
                isMatch={data.blockchain?.threat_type === data.local?.threat_type} 
              />
              <RecordRow 
                label="Severity" 
                value={data.local?.severity} 
                isMatch={data.blockchain?.severity === data.local?.severity} 
              />
              <RecordRow 
                label="Hash" 
                value={data.local?.event_hash.slice(0, 8) + "..."} 
                className="font-mono text-[10px]"
                isMatch={data.blockchain?.event_hash === data.local?.event_hash} 
              />
            </div>
          </div>
        </div>

        {!isValid && (
          <div className="bg-red-100/50 border border-red-200 rounded p-2 text-[11px] text-red-700 leading-tight">
            <strong>Warning:</strong> local data for this threat does not match the immutable record on Ethereum. This may indicate unauthorized log modification.
          </div>
        )}
      </div>
    </div>
  );
}

function RecordRow({ label, value, isMatch, className = "" }: { label: string; value?: any; isMatch?: boolean; className?: string }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-neutral-500">{label}:</span>
      <span className={`font-medium ${isMatch === false ? "text-red-600 underline decoration-wavy" : ""} ${className}`}>
        {value || "N/A"}
      </span>
    </div>
  );
}
