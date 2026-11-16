import { Ticket, TicketDetail, DashboardMetrics, ArchitectureLayer } from '../types/ticket';
import JSZip from 'jszip';

const API_BASE = '/api/v1';

export class ApiError extends Error {
  public status: number;
  public errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('resolvepulse_token');
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...authHeaders,
      ...options.headers
    }
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      data.message || 'API request failed',
      res.status,
      data.errors
    );
  }

  return data;
}

export const ticketApi = {
  async getMetrics(): Promise<DashboardMetrics> {
    const res = await request<{ data: DashboardMetrics }>('/tickets/metrics/summary');
    return res.data;
  },

  async listTickets(params: {
    status?: string;
    priority?: string;
    tier?: string;
    search?: string;
    sla_state?: string;
  } = {}): Promise<Ticket[]> {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.priority && params.priority !== 'all') query.set('priority', params.priority);
    if (params.tier && params.tier !== 'all') query.set('tier', params.tier);
    if (params.search) query.set('search', params.search);
    if (params.sla_state && params.sla_state !== 'all') query.set('sla_state', params.sla_state);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await request<{ data: Ticket[] }>(`/tickets${queryString}`);
    return res.data;
  },

  async getTicket(id: string): Promise<TicketDetail> {
    const res = await request<{ data: TicketDetail }>(`/tickets/${id}`);
    return res.data;
  },

  async createTicket(payload: {
    title: string;
    description: string;
    customer_name: string;
    customer_email: string;
    priority: string;
    assigned_to?: string;
    tags?: string[];
  }): Promise<Ticket> {
    const res = await request<{ data: Ticket; message: string }>('/tickets', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.data;
  },

  async updateStatus(id: string, status: string, actor: string, reason?: string): Promise<Ticket> {
    const res = await request<{ data: Ticket; message: string }>(`/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, actor, reason })
    });
    return res.data;
  },

  async escalate(id: string, target_tier: string, actor: string, reason: string): Promise<Ticket> {
    const res = await request<{ data: Ticket; message: string }>(`/tickets/${id}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ target_tier, actor, reason })
    });
    return res.data;
  },

  async assign(id: string, assigned_to: string, actor: string): Promise<Ticket> {
    const res = await request<{ data: Ticket; message: string }>(`/tickets/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assigned_to, actor })
    });
    return res.data;
  },

  async addNote(id: string, note: string, actor: string): Promise<any> {
    const res = await request<{ data: any; message: string }>(`/tickets/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note, actor })
    });
    return res.data;
  },

  async getArchitectureLayers(): Promise<{ pattern: string; layers: ArchitectureLayer[] }> {
    return request<{ pattern: string; layers: ArchitectureLayer[] }>('/architecture/layers');
  },

  async getFileContent(filePath: string): Promise<{ path: string; language: string; content: string }> {
    return request<{ path: string; language: string; content: string }>(`/architecture/file?path=${encodeURIComponent(filePath)}`);
  },

  async getExportManifest(): Promise<{ files: Record<string, string>; total_files: number }> {
    return request<{ files: Record<string, string>; total_files: number }>('/architecture/export-manifest');
  },

  async downloadLaravelZip(): Promise<void> {
    const manifest = await this.getExportManifest();
    const zip = new JSZip();

    for (const [relativePath, content] of Object.entries(manifest.files)) {
      zip.file(relativePath, content);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resolvepulse-laravel-clean-architecture.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
