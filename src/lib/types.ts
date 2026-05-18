/* ── Ticket ── */
export interface Ticket {
  uid: string;               // TK-{timestamp}
  createdAt: string;         // ISO
  agentEmail: string;        // col C
  agentName: string;         // col D
  source: string;            // col E
  customerName: string;      // col F
  customerPhone: string;     // col G
  type: string;              // col H
  status: TicketStatus;      // col I
  details: string;           // col J
  resolution: string;        // col K
  startTime: string;         // ISO — col L
  endTime: string | null;    // ISO — col M
  handleTime: number;        // minutes — col N
  attachmentUrl: string;     // col O
}

export type TicketStatus = "Pending" | "In Progress" | "Complete";

/* ── User ── */
export type UserRole = "Admin" | "Standard";

export interface AgentUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

/* ── App Config (from Setting_Config sheet) ── */
export interface AppConfig {
  sources: string[];
  types: string[];
  statuses: string[];
  agents: string[];
}

/* ── API responses ── */
export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

/* ── Report / Dashboard ── */
export interface TicketSummaryRow {
  agent: string;
  source: string;
  type: string;
  status: string;
  handleTime: number;
}

export interface ReportStats {
  total: number;
  complete: number;
  pending: number;
  avgHandleTime: number;
  byType: Record<string, number>;
  bySource: Record<string, number>;
  byAgent: Record<string, number>;
}
