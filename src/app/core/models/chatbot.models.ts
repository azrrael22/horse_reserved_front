import { ReservaResponse, TipoDocumentoReserva } from './reserva.models';

// ─── Request ──────────────────────────────────────────────────────────────────

export interface ChatbotQueryRequest {
  question: string;
  sessionId?: string | null;
  payload?: Record<string, unknown>;
}

// ─── Flow / Step ──────────────────────────────────────────────────────────────

export type ChatbotFlow = 'crear_reserva';

export type ReservationFlowStep =
  | 'SELECT_ROUTE'
  | 'SELECT_DATE'
  | 'SELECT_TIME'
  | 'SELECT_PEOPLE_COUNT'
  | 'COLLECT_PARTICIPANT'
  | 'CONFIRM_RESERVATION'
  | 'COMPLETED'
  | 'CANCELLED';

// ─── Action ───────────────────────────────────────────────────────────────────

export interface ChatbotAction {
  type: 'NAVIGATION' | 'API_CALL' | string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | string;
  authRequired: boolean;
  payload?: Record<string, unknown> | null;
}

// ─── Reservation data shapes ──────────────────────────────────────────────────

export interface RouteOption {
  id: number;
  nombre: string;
  precio: number | string;
  duracionMinutos: number;
  dificultad: string;
}

export interface AvailableTimeOption {
  horaInicio: string;
  horaFin: string;
  duracionMinutos: number;
  cuposDisponiblesEstimados: number;
  precioPorPersona: number | string;
}

export interface ParticipantPayload {
  primerNombre: string;
  primerApellido: string;
  tipoDocumento: TipoDocumentoReserva;
  documento: string;
  edad: number;
  cmAltura: number;
  kgPeso: number;
}

export interface ReservationSummary {
  rutaId: number;
  rutaNombre: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  cantPersonas: number;
  precioUnitario: number | string;
  precioTotal: number | string;
  participantes: ParticipantPayload[];
}

export interface ChatbotReservationData {
  routes?: RouteOption[];
  availableTimes?: AvailableTimeOption[];
  participantIndex?: number;
  totalParticipants?: number;
  requiredFields?: string[];
  tipoDocumentoOptions?: TipoDocumentoReserva[];
  summary?: ReservationSummary;
  actions?: string[];
  reservation?: ReservaResponse;
  error?: string;
  [key: string]: unknown;
}

// ─── Response ─────────────────────────────────────────────────────────────────

export interface ChatbotAnswerResponse {
  intentId: string;
  confidence: number;
  answer: string;
  action: ChatbotAction | null;
  notes: string[];
  suggestions: string[];
  sessionId?: string | null;
  flow?: ChatbotFlow | string | null;
  step?: ReservationFlowStep | string | null;
  awaitingUserInput?: boolean;
  data?: ChatbotReservationData | null;
}

// ─── Chat UI ──────────────────────────────────────────────────────────────────

export type ChatMessageRole = 'user' | 'bot';
export type ChatState = 'idle' | 'loading' | 'error' | 'success';

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  text: string;
  timestamp: Date;
  response?: ChatbotAnswerResponse;
}