// ──────────────────────────────────────────────────────────────────────────
// Modelos de dominio para el módulo Chatbot FAQ
// ──────────────────────────────────────────────────────────────────────────

export interface ChatbotQueryRequest {
  question: string;
}

export interface ChatbotAction {
  type: string;       // "NAVIGATION" | "API_CALL" | etc.
  endpoint: string;
  method: string;     // "GET" | "POST"
  authRequired: boolean;
}

export interface ChatbotAnswerResponse {
  intentId: string;
  confidence: number;
  answer: string;
  action: ChatbotAction | null;
  notes: string[];
  suggestions: string[];
}

// ── Modelos de UI ─────────────────────────────────────────────────────────

export type ChatMessageRole = 'user' | 'bot';
export type ChatState = 'idle' | 'loading' | 'error' | 'success';

export interface ChatMessage {
  role: ChatMessageRole;
  text: string;
  timestamp: Date;
  response?: ChatbotAnswerResponse; // solo en mensajes bot
}