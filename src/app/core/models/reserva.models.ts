export type ReservaEstado = 'reservado' | 'cancelado' | 'completado';

export type TipoDocumentoReserva =
  | 'CEDULA'
  | 'PASAPORTE'
  | 'TARJETA_IDENTIDAD';

export interface ParticipanteRequest {
  primerNombre: string;
  primerApellido: string;
  tipoDocumento: TipoDocumentoReserva;
  documento: string;
  edad: number;
  cmAltura: number;
  kgPeso: number;
}

export interface CreateReservaRequest {
  rutaId: number;
  fecha: string;       // YYYY-MM-DD
  horaInicio: string;  // HH:mm
  cantPersonas: number;
  participantes: ParticipanteRequest[];
  clienteId?: number;  // Requerido solo para OPERADOR (null = reserva de invitado)
}

export interface UpdateReservaRequest {
  rutaId: number;
  fecha: string;       // YYYY-MM-DD
  horaInicio: string;  // HH:mm
  cantPersonas: number;
  participantes: ParticipanteRequest[];
}

export interface ParticipanteResponse {
  id?: number;
  primerNombre: string;
  primerApellido: string;
  tipoDocumento: TipoDocumentoReserva;
  documento: string;
  edad: number;
  cmAltura: number;
  kgPeso: number;
}

export interface ReservaResponse {
  id: number;
  estado: string;
  cantPersonas: number;

  salidaId: number;
  rutaId: number;
  fechaProgramada: string; // LocalDate en backend
  tiempoInicio: string;    // LocalTime en backend
  tiempoFin: string;       // LocalTime en backend
  salidaEstado: string;
  rutaNombre: string;

  clienteId?: number | null;
  clienteEmail?: string | null;

  operadorId?: number | null;
  participantes: ParticipanteResponse[];
}
