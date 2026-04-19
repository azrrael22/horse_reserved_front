export type PagoEstado = 'PENDIENTE' | 'CANCELADO' | 'REALIZADO' | 'REEMBOLSADO';
export type MetodoPago = 'EFECTIVO' | 'TARJETA';

export interface CrearPreferenciaMpRequest {
  reservaId: number;
}

export interface PreferenciaMpResponse {
  intentoPagoId: number;
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
}

export interface IntentoPagoResponse {
  id: number;
  reservaId: number;
  estado: PagoEstado;
  metodoPago: MetodoPago;
  monto: number;
  moneda: string;
  pagadoPorUsuarioId: number | null;
  pagadoPorOperadorId: number | null;
  referenciaSimulada: string;
  fechaIntento: string;
  mpPreferenceId: string | null;
  mpPaymentId: string | null;
  mpPaymentStatus: string | null;
}
