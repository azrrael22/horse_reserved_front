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

  ask(question: string): Observable<ChatbotAnswerResponse> {
    const body: ChatbotQueryRequest = { question };
    return this.http.post<ChatbotAnswerResponse>(`${this.apiUrl}/ask`, body);
  }

  health(): Observable<string> {
    return this.http.get(`${this.apiUrl}/health`, { responseType: 'text' });
  }
}