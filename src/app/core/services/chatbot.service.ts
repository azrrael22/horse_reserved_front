import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ChatbotAnswerResponse,
  ChatbotQueryRequest,
} from '../models/chatbot.models';

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/chatbot/faq`;

  /**
   * Envía un mensaje al chatbot.
   * El authInterceptor adjunta el JWT automáticamente cuando existe sesión.
   */
  ask(
    question: string,
    options: {
      sessionId?: string | null;
      payload?: Record<string, unknown>;
    } = {}
  ): Observable<ChatbotAnswerResponse> {
    const body: ChatbotQueryRequest = {
      question: question.trim() || 'Continuar',
      sessionId: options.sessionId ?? null,
      payload: options.payload ?? {},
    };
    return this.http.post<ChatbotAnswerResponse>(`${this.apiUrl}/ask`, body);
  }

  health(): Observable<string> {
    return this.http.get(`${this.apiUrl}/health`, { responseType: 'text' });
  }
}