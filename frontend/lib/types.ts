export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserOut {
  id: number;
  username: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface NetworkEventIn {
  src_ip: string;
  dst_ip: string;
  protocol: string;
  payload_size: number;
  frequency: number;
  signal_strength: number;
  timestamp?: string;
}

export interface ThreatOut {
  id: number;
  event_id: number;
  threat_type: string;
  severity: string;
  confidence: number;
  detection_method: string;
  explanation?: string;
  shap_values?: string;
  status: string;
  detected_at: string;
  blockchain_tx_hash?: string;
  blockchain_block_number?: number;
}

export interface AlertOut {
  id: number;
  threat_id: number;
  channel: string;
  message: string;
  sent_at: string;
  acknowledged: boolean;
  acknowledged_at?: string;
}

export interface ThreatStats {
  by_severity: Record<string, number>;
  by_type: Record<string, number>;
  by_detection_method: Record<string, number>;
  trend_last_24h: Record<string, number>;
}

export interface IngestResponse {
  threat_id: number;
  threat_type: string;
  severity: string;
  confidence: number;
  is_threat: boolean;
}

export interface SimulateRequest {
  n_samples: number;
  attack_ratio: number;
}

export interface SimulateResponse {
  total: number;
  threats: number;
  by_type: Record<string, number>;
}
