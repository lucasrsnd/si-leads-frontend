export type Role = 'ADMIN' | 'AGENT';

export type LeadStatus = 'NOVO' | 'EM_CONTATO' | 'QUALIFICADO' | 'PROPOSTA' | 'FECHADO' | 'PERDIDO';

export type Source = 'SITE' | 'INDICACAO' | 'REDES_SOCIAIS' | 'ANUNCIO' | 'WHATSAPP' | 'OUTRO';

export type Priority = 'ALTA' | 'MEDIA' | 'BAIXA';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Activity {
  id: string;
  leadId: string;
  type: string;
  message: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: LeadStatus;
  source?: Source;
  priority: Priority;
  notes?: string;
  userId?: string;
  assignedTo?: Pick<User, 'id' | 'name' | 'email'>;
  activities?: Activity[];
  _count?: { activities: number };
  createdAt: string;
  updatedAt: string;
}

export interface KanbanBoard {
  NOVO: Lead[];
  EM_CONTATO: Lead[];
  QUALIFICADO: Lead[];
  PROPOSTA: Lead[];
  FECHADO: Lead[];
  PERDIDO: Lead[];
}

export interface DashboardMetrics {
  totalLeads: number;
  conversionRate: string;
  byStatus: Record<LeadStatus, number>;
  bySource: Record<string, number>;
  byPriority: Record<Priority, number>;
  recentLeads: Pick<Lead, 'id' | 'name' | 'status' | 'createdAt'>[];
  recentActivities: (Activity & { lead: { name: string } })[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
