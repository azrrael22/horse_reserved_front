// ── Requests ──────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export type TipoDocumento = 'cedula' | 'pasaporte' | 'tarjeta_identidad';

export interface RegisterRequest {
  primerNombre: string;
  primerApellido: string;
  tipoDocumento: TipoDocumento;
  documento: string;
  email: string;
  password: string;
  telefono?: string;
}

export interface ChangePasswordRequest {
  passwordActual: string;
  passwordNueva: string;
  confirmarPassword: string;
}

// ── Responses ─────────────────────────────────────────────────────────────────

export type UserRole = 'cliente' | 'operador' | 'administrador';

export interface AuthResponse {
  token: string;
  type: string;
  expiresIn: number;
  userId: number;
  email: string;
  primerNombre: string;
  primerApellido: string;
  role: UserRole;
}

export interface CurrentUser {
  userId: number;
  email: string;
  primerNombre: string;
  primerApellido: string;
  role: UserRole;
}
