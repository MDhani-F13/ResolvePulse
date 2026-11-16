export type UserRole = 'customer' | 'support_engineer' | 'lead_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
