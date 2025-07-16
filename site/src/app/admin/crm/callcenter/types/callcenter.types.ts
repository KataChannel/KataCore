// Call Center Types
export interface Extension {
  id: string;
  extCode: string;
  password: string;
  userId?: string;
  user?: User;
  status: 'active' | 'inactive';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  displayName: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive';
}

export interface Call {
  id: string;
  uuid: string;
  customerName: string;
  phoneNumber: string;
  status: 'pending' | 'in-progress' | 'completed' | 'missed' | 'answered';
  timestamp: Date;
  duration?: number;
  billsec?: number;
  notes?: string;
  callDirection: 'inbound' | 'outbound';
  recordingUrl?: string;
  hangupCause?: string;
  extCode?: string;
  userId?: string;
  user?: User;
}

export interface CDRRecord {
  uuid: string;
  caller_id_number: string;
  destination_number: string;
  start_stamp: string;
  end_stamp: string;
  duration: number;
  billsec: number;
  hangup_cause: string;
  direction: string;
  recording_path?: string;
}

export interface SIPConfig {
  uri: string;
  password: string;
  ws_servers: string;
  display_name?: string;
}

export interface CallSummary {
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  totalDuration: number;
  averageDuration: number;
  inboundCalls: number;
  outboundCalls: number;
}

export interface ExtensionFormData {
  extCode: string;
  password: string;
  userId?: string;
  description?: string;
  status: 'active' | 'inactive';
}

export interface CallFilter {
  extCode?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: Call['status'];
  direction?: Call['callDirection'];
  phoneNumber?: string;
}

export interface CallCenterSettings {
  apiBaseUrl: string;
  sipWsServer: string;
  defaultExtCode: string;
  recordingEnabled: boolean;
  autoRefreshInterval: number;
}
