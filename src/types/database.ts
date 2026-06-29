export type UserRole = 'admin' | 'citizen';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type IncidentType = 'apt_intrusion' | 'network_malware' | 'insider_threat' | 'comms_interception' | 'zero_day' | 'unauthorized_device' | 'other';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'pending' | 'in_review' | 'resolved';

export interface Incident {
  id: string;
  user_id: string | null;
  title: string;
  incident_type: IncidentType;
  severity: Severity;
  description: string;
  phone_number: string | null;
  platform: string | null;
  incident_date: string | null;
  financial_loss: string | null;
  file_url: string | null;
  attacker_ip: string | null;
  malicious_url: string | null;
  crypto_wallet: string | null;
  latitude: number | null;
  longitude: number | null;
  status: IncidentStatus;
  ai_risk_score: number | null;
  ai_suggested_category: string | null;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  author_id: string;
  title: string;
  content: string;
  severity: Severity;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  incident_id: string;
  sender_id: string;
  sender_role: UserRole;
  content: string;
  created_at: string;
}
