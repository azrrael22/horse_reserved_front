export interface RutaResponse {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  dificultad: string;
  duracionMinutos: number;
  urlImagen?: string;
}

export type Dificultad = 'FACIL' | 'MEDIA' | 'DIFICIL';

export interface RutaAdminResponse extends RutaResponse {
  activa: boolean;
}

export interface CreateRutaRequest {
  nombre: string;
  descripcion: string;
  precio: number;
  dificultad: Dificultad;
  duracionMinutos: number;
  urlImagen?: string | null;
}

export interface UpdateRutaRequest extends CreateRutaRequest {}

export interface CabalgataProgresoResponse {
  salidaId: number;
  rutaId: number;
  rutaNombre: string;
  fechaProgramada: string;   // yyyy-MM-dd
  tiempoInicio: string;      // HH:mm:ss
  tiempoFin: string;         // HH:mm:ss
  duracionMinutos: number;
  minutosTranscurridos: number;
  progresoPorcentaje: number; // 0–100
  estadoCalculado: 'NO_INICIADA' | 'EN_CURSO' | 'FINALIZADA';
  estadoSalida: 'programado' | 'en_curso' | 'completado' | 'cancelado' | string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface RutaAdminParams {
  activa?: boolean;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface ProgresoParams {
  page?: number;
  size?: number;
  sort?: string;
}
