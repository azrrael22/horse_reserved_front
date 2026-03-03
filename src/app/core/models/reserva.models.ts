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
  salidaId: number;
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
  fechaProgramada: string; // LocalDate en backend
  tiempoInicio: string; // LocalTime en backend
  tiempoFin: string; // LocalTime en backend
  salidaEstado: string;
  rutaNombre: string;

  clienteId: number;
  clienteEmail: string;

  operadorId: number | null;
  participantes: ParticipanteResponse[];
}
