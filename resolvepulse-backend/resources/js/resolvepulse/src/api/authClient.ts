import { User, UserRole, AuthResponse } from '../types/user';

const API_BASE = '/api/v1/auth';
const TOKEN_KEY = 'resolvepulse_token';
const USER_KEY = 'resolvepulse_user';

export const authClient = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setSession(user: User, token: string) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearSession() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  async login(email: string, password: string): Promise<User> {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    this.setSession(data.data.user, data.data.token);
    return data.data.user;
  },

  async register(payload: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    organization?: string;
  }): Promise<User> {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.message || 'Registration failed');
      err.errors = data.errors;
      throw err;
    }

    this.setSession(data.data.user, data.data.token);
    return data.data.user;
  },

  async getPersonas(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/personas`);
    const data = await res.json();
    return data.data || [];
  },

  async switchPersona(email: string): Promise<User> {
    const res = await fetch(`${API_BASE}/switch-persona`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to switch persona');
    }

    this.setSession(data.data.user, data.data.token);
    return data.data.user;
  },

  async fetchMe(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.data;
    } catch {
      return null;
    }
  }
};
