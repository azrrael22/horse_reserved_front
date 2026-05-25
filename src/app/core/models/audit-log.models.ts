export type AuditCategoria =
  | 'AUTENTICACION'
  | 'RESERVA'
  | 'RECURSO_ADMIN'
  | 'CUENTA'
  | 'SISTEMA';

export type AuditResultado = 'EXITO' | 'FALLO' | 'ERROR_SISTEMA';

export interface AuditLogResponse {
  id: number;
  ocurridoEn: string;
  usuarioId: number | null;
  usuarioEmail: string | null;
  categoria: AuditCategoria;
  accion: string;
  resultado: AuditResultado;
  detalle: string | null;
  entidadTipo: string | null;
  entidadId: number | null;
  ipOrigen: string | null;
}

export interface AuditLogFiltro {
  categoria?: AuditCategoria | null;
  usuarioEmail?: string;
  resultado?: AuditResultado | null;
  desde?: string;
  hasta?: string;
  page: number;
  size: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
}
