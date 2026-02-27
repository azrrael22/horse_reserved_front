export enum TipoDocumento {
  CEDULA = 'CEDULA',
  PASAPORTE = 'PASAPORTE',
  TARJETA_IDENTIDAD = 'TARJETA_IDENTIDAD',
}

export const TIPO_DOCUMENTO_LABELS: Record<TipoDocumento, string> = {
  [TipoDocumento.CEDULA]: 'Cédula de Ciudadanía',
  [TipoDocumento.PASAPORTE]: 'Pasaporte',
  [TipoDocumento.TARJETA_IDENTIDAD]: 'Tarjeta de Identidad',
};

export type UserRole = 'CLIENTE' | 'OPERADOR' | 'ADMINISTRADOR';

// ─── Requests ────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

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

// ─── Responses ───────────────────────────────────────────────────────────────

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

export interface UserProfileResponse {
  userId: number;
  email: string;
  primerNombre: string;
  primerApellido: string;
  tipoDocumento: TipoDocumento;
  documento: string;
  telefono: string | null;
  role: UserRole;
  isActive: boolean;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

// ─── Stored session ───────────────────────────────────────────────────────────

export interface StoredSession {
  token: string;
  userId: number;
  email: string;
  primerNombre: string;
  primerApellido: string;
  role: UserRole;
  expiresAt: number; // Unix timestamp in ms
}
