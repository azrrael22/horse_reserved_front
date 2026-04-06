import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { EMPTY, catchError } from 'rxjs';

import {
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonLabel,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowForwardOutline,
  copyOutline,
  sendOutline,
} from 'ionicons/icons';

import { ChatbotService } from '../../core/services/chatbot.service';
import {
  ChatMessage,
  ChatState,
  ChatbotAction,
} from '../../core/models/chatbot.models';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    DatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonFooter,
    IonButton,
    IonIcon,
    IonSpinner,
    IonChip,
    IonLabel,
    IonTextarea,
    IonBadge,
  ],
  templateUrl: './chatbot.page.html',
  styleUrls: ['./chatbot.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatbotPage {
  @ViewChild(IonContent) private readonly content!: IonContent;

  private readonly chatbotService = inject(ChatbotService);
  private readonly router = inject(Router);
  private readonly toastCtrl = inject(ToastController);

  // ── Estado ────────────────────────────────────────────────────────────

  readonly messages = signal<ChatMessage[]>([
    {
      role: 'bot',
      text: '¡Hola! Soy el asistente de Horse Reserved 🐴. Puedo ayudarte con registro, inicio de sesión, reservas y más. ¿En qué puedo ayudarte?',
      timestamp: new Date(),
    },
  ]);

  readonly state = signal<ChatState>('idle');
  readonly errorMessage = signal<string>('');
  readonly question = signal<string>('');

  // ── Derivados ─────────────────────────────────────────────────────────

  readonly isLoading = computed(() => this.state() === 'loading');

  readonly charCount = computed(() => this.question().length);

  readonly isInputValid = computed(() => {
    const len = this.question().trim().length;
    return len > 0 && len <= 300;
  });

  // ── Mapa de rutas internas conocidas ──────────────────────────────────

  private readonly knownRoutes: ReadonlyMap<string, string> = new Map([
    ['/tabs/inicio', '/tabs/inicio'],
    ['/tabs/reservas', '/tabs/reservas'],
    ['/tabs/reservas/nueva', '/tabs/reservas/nueva'],
    ['/tabs/cuenta', '/tabs/cuenta'],
    ['/auth/login', '/auth/login'],
    ['/auth/register', '/auth/register'],
    ['/auth/forgot-password', '/auth/forgot-password'],
  ]);

  constructor() {
    addIcons({ sendOutline, copyOutline, arrowForwardOutline });
  }

  // ── Acciones ──────────────────────────────────────────────────────────

  send(): void {
    const q = this.question().trim();
    if (!q || q.length > 300 || this.isLoading()) return;

    this.messages.update((prev) => [
      ...prev,
      { role: 'user', text: q, timestamp: new Date() },
    ]);

    this.question.set('');
    this.state.set('loading');
    this.errorMessage.set('');
    this.scrollToBottom();

    this.chatbotService
      .ask(q)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.state.set('error');
          this.errorMessage.set(this.resolveErrorMessage(err));
          return EMPTY;
        })
      )
      .subscribe((response) => {
        this.messages.update((prev) => [
          ...prev,
          {
            role: 'bot',
            text: response.answer,
            response,
            timestamp: new Date(),
          },
        ]);
        this.state.set('success');
        this.scrollToBottom();
      });
  }

  sendSuggestion(suggestion: string): void {
    this.question.set(suggestion);
    this.send();
  }

  async handleAction(action: ChatbotAction): Promise<void> {
    if (action.type === 'NAVIGATION') {
      const internalRoute = this.knownRoutes.get(action.endpoint);
      if (internalRoute) {
        await this.router.navigateByUrl(internalRoute);
        return;
      }
    }
    // Fallback: copiar al portapapeles
    await navigator.clipboard.writeText(action.endpoint);
    await this.presentToast('Endpoint copiado al portapapeles 📋');
  }

  onInput(event: Event): void {
    const value =
      (event as CustomEvent<{ value: string | null | undefined }>).detail
        .value ?? '';
    this.question.set(value);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  // ── Helpers de UI ─────────────────────────────────────────────────────

  formatConfidence(confidence: number): string {
    return `${Math.round(confidence * 100)}%`;
  }

  confidenceBadgeColor(confidence: number): 'success' | 'warning' | 'danger' {
    if (confidence >= 0.75) return 'success';
    if (confidence >= 0.5) return 'warning';
    return 'danger';
  }

  isInternalNavigation(action: ChatbotAction): boolean {
    return (
      action.type === 'NAVIGATION' && this.knownRoutes.has(action.endpoint)
    );
  }

  trackByIndex(index: number): number {
    return index;
  }

  // ── Privados ──────────────────────────────────────────────────────────

  private scrollToBottom(): void {
    setTimeout(() => this.content?.scrollToBottom(300), 80);
  }

  private resolveErrorMessage(err: HttpErrorResponse): string {
    if (err.status === 0)
      return 'Sin conexión. Verifica tu red e inténtalo de nuevo.';
    if (err.status === 400)
      return 'La pregunta no es válida. Por favor reformúlala.';
    if (err.status === 404)
      return 'El servicio de asistente no está disponible.';
    if (err.status >= 500)
      return 'No pudimos contactar el asistente en este momento. Inténtalo más tarde.';
    return 'No pudimos contactar el asistente en este momento.';
  }

  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2200,
      position: 'bottom',
      color: 'dark',
    });
    await toast.present();
  }
}