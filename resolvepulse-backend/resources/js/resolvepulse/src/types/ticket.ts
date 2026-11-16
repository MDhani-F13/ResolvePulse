export type TicketPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TicketStatus = 'open' | 'in_progress' | 'escalated' | 'resolved' | 'closed';
export type SupportTier = 'tier_1' | 'tier_2' | 'tier_3';

export interface SlaEvaluation {
  is_breached: boolean;
  is_warning: boolean;
  total_minutes_allowed: number;
  minutes_elapsed: number;
  minutes_remaining: number;
  percentage_elapsed: number;
  formatted_remaining: string;
  badge_state: 'nominal' | 'warning' | 'breached' | 'resolved';
}

export interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  customer_name: string;
  customer_email: string;
  priority: TicketPriority;
  status: TicketStatus;
  tier: SupportTier;
  assigned_to: string;
  assigned_email: string | null;
  sla_target_hours: number;
  created_at: string;
  updated_at: string;
  sla_due_at: string;
  resolved_at: string | null;
  tags: string[];
  sla_evaluation?: SlaEvaluation;
}

export interface TicketAuditLog {
  id: string;
  ticket_id: string;
  action: 'created' | 'status_changed' | 'priority_changed' | 'escalated' | 'assigned' | 'note_added';
  actor: string;
  from_state?: string;
  to_state?: string;
  details: string;
  created_at: string;
}

export interface TicketDetail extends Ticket {
  audit_logs: TicketAuditLog[];
}

export interface DashboardMetrics {
  total: number;
  open: number;
  in_progress: number;
  escalated: number;
  resolved: number;
  breached: number;
  warning: number;
}

export interface ArchitectureLayer {
  id: string;
  name: string;
  description: string;
  typescript_file: string;
  laravel_file: string;
  rules_demonstrated: string[];
}
