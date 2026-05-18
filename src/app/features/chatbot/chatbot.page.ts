import {
  Component,
  inject,
  signal,
  computed,
  ViewChild,
  ElementRef,
  OnInit,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { EMPTY, catchError } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFooter,
  IonTextarea,
  IonButton,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonSpinner,
  IonChip,
  IonLabel,
  IonBadge,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonItem,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { sendOutline, copyOutline, arrowForwardOutline } from 'ionicons/icons';

import { ChatbotService } from '../../core/services/chatbot.service';
import {
  ChatMessage,
  ChatState,
  ChatbotAnswerResponse,
  ChatbotAction,
  ChatbotReservationData,
  RouteOption,
  AvailableTimeOption,
  ParticipantPayload,
} from '../../core/models/chatbot.models';
import { KNOWN_CHATBOT_ROUTES } from '../../core/config/chatbot-routes.config';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  templateUrl: './chatbot.page.html',
  styleUrls: ['./chatbot.page.scss'],
  imports: [
    DatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonFooter,
    IonTextarea,
    IonButton,
    IonIcon,
    IonSpinner,
    IonChip,
    IonLabel,
    IonBadge,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonItem,
  ],
})
export class ChatbotPage implements OnInit {
  @ViewChild('messagesWrapper') messagesWrapper!: ElementRef<HTMLElement>;

  private readonly chatbotService = inject(ChatbotService);
  private readonly router = inject(Router);
  private readonly toastCtrl = inject(ToastController);
  private readonly knownRoutes: Set<string> = KNOWN_CHATBOT_ROUTES;

  // ─── Chat base signals ────────────────────────────────────────────────────

  readonly messages = signal<ChatMessage[]>([]);
  readonly state = signal<ChatState>('idle');
  readonly errorMessage = signal('');
  readonly question = signal('');

  readonly isLoading = computed(() => this.state() === 'loading');
  readonly charCount = computed(() => this.question().length);
  readonly isInputValid = computed(
    () => this.charCount() >= 1 && this.charCount() <= 300
  );
  readonly canSend = computed(() => this.isInputValid() && !this.isLoading());

  // ─── Reservation flow signals ─────────────────────────────────────────────

  readonly reservationSessionId = signal<string | null>(null);
  readonly reservationStep = signal<string | null>(null);
  readonly reservationFlowActive = computed(() => !!this.reservationSessionId());

  readonly selectedDate = signal<string>('');
  readonly peopleCount = signal<number>(1);
  readonly participantForm = signal<ParticipantPayload>({
    primerNombre: '',
    primerApellido: '',
    tipoDocumento: 'CEDULA',
    documento: '',
    edad: 18,
    cmAltura: 170,
    kgPeso: 70,
  });

  readonly minReservationDate = computed<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  // ─── Init ─────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    addIcons({ sendOutline, copyOutline, arrowForwardOutline });
    this.pushWelcomeMessage();
  }

  /** Mensaje inicial del bot al abrir el chat */
  private pushWelcomeMessage(): void {
    this.messages.set([
      {
        id: crypto.randomUUID(),
        role: 'bot',
        text: '¡Hola! 🐴 Soy el asistente de Horse Reserved. Puedo responder tus preguntas o ayudarte a crear una reserva.',
        timestamp: new Date(),
        response: {
          intentId: 'welcome',
          confidence: 1,
          answer: '',
          action: null,
          notes: [],
          suggestions: ['quiero reservar', '¿Qué rutas hay?', '¿Cómo cancelo una reserva?'],
          flow: null,
          step: null,
          awaitingUserInput: true,
          data: null,
        },
      },
    ]);
  }

  // ─── Typed data accessors ─────────────────────────────────────────────────
  // Necesarios porque ChatbotReservationData tiene index signature [key:string]:unknown,
  // lo que hace que el acceso por bracket en el template resuelva a unknown.
  // Estos métodos devuelven tipos concretos y se usan en el HTML en vez de data['routes'].

  getRoutes(data: ChatbotReservationData | null | undefined): RouteOption[] {
    return data?.routes ?? [];
  }

  getTimes(data: ChatbotReservationData | null | undefined): AvailableTimeOption[] {
    return data?.availableTimes ?? [];
  }

  getDocTypes(
    data: ChatbotReservationData | null | undefined
  ): Array<'CEDULA' | 'PASAPORTE' | 'TARJETA_IDENTIDAD'> {
    return (
      (data?.tipoDocumentoOptions as Array<
        'CEDULA' | 'PASAPORTE' | 'TARJETA_IDENTIDAD'
      >) ?? ['CEDULA', 'PASAPORTE', 'TARJETA_IDENTIDAD']
    );
  }

  getSummary(data: ChatbotReservationData | null | undefined) {
    return data?.summary ?? null;
  }

  getReservation(data: ChatbotReservationData | null | undefined) {
    return data?.reservation ?? null;
  }

  getDataError(data: ChatbotReservationData | null | undefined): string | null {
    return (data?.error as string) ?? null;
  }

  getParticipantIndex(data: ChatbotReservationData | null | undefined): number {
    return (data?.participantIndex as number) ?? 1;
  }

  getTotalParticipants(data: ChatbotReservationData | null | undefined): number {
    return (data?.totalParticipants as number) ?? 1;
  }

  // ─── Input handlers ───────────────────────────────────────────────────────

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

  // ─── Confidence helpers ───────────────────────────────────────────────────

  confidenceBadgeColor(confidence: number): string {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.5) return 'warning';
    return 'danger';
  }

  formatConfidence(confidence: number): string {
    return `${Math.round((confidence ?? 0) * 100)}%`;
  }

  trackByIndex(index: number): number {
    return index;
  }

  // ─── Main send ────────────────────────────────────────────────────────────

  send(): void {
    const q = this.question().trim();
    if (!q || q.length > 300 || this.isLoading()) return;
    this.sendToChatbot(q, {});
    this.question.set('');
  }

  sendSuggestion(suggestion: string): void {
    this.question.set(suggestion);
    this.send();
  }

  // ─── Core HTTP ────────────────────────────────────────────────────────────

  private sendToChatbot(
    question: string,
    payload: Record<string, unknown>
  ): void {
    const q = question.trim() || 'Continuar';
    if (q.length > 300 || this.isLoading()) return;

    this.messages.update((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', text: q, timestamp: new Date() },
    ]);

    this.state.set('loading');
    this.errorMessage.set('');
    this.scrollToBottom();

    this.chatbotService
      .ask(q, { sessionId: this.reservationSessionId(), payload })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.state.set('error');
          this.errorMessage.set(this.resolveErrorMessage(err));
          return EMPTY;
        })
      )
      .subscribe((response) => {
        this.applyChatbotResponse(response);
        this.messages.update((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
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

  // ─── Apply response state ─────────────────────────────────────────────────

  private applyChatbotResponse(response: ChatbotAnswerResponse): void {
    if (response.sessionId) {
      this.reservationSessionId.set(response.sessionId);
    }
    if (response.step) {
      this.reservationStep.set(response.step);
    }
    if (
      (response.step === 'COMPLETED' || response.step === 'CANCELLED') &&
      !response.data?.error
    ) {
      this.reservationSessionId.set(null);
      this.reservationStep.set(null);
    }
  }

  // ─── Reservation step actions ─────────────────────────────────────────────

  selectRoute(route: RouteOption): void {
    this.sendToChatbot(`Selecciono la ruta ${route.nombre}`, {
      routeId: route.id,
    });
  }

  selectDate(date: string): void {
    if (!date) {
      this.presentToast('Por favor selecciona una fecha.');
      return;
    }
    if (!this.isFutureDate(date)) {
      this.presentToast('La fecha debe ser al menos mañana.');
      return;
    }
    this.sendToChatbot(`Quiero reservar el ${date}`, { date });
  }

  selectTime(time: AvailableTimeOption): void {
    const hora = this.formatTime(time.horaInicio);
    this.sendToChatbot(`Elijo la hora ${hora}`, { time: hora });
  }

  submitPeopleCount(count: number): void {
    if (!Number.isInteger(count) || count < 1) {
      this.presentToast('La cantidad de personas debe ser mínimo 1.');
      return;
    }
    this.sendToChatbot(`Somos ${count} personas`, { peopleCount: count });
  }

  submitCurrentParticipant(index: number): void {
    const raw = this.participantForm();
    const participant: ParticipantPayload = {
      ...raw,
      edad: Number(raw.edad),
      cmAltura: Number(raw.cmAltura),
      kgPeso: Number(raw.kgPeso),
    };
    const error = this.validateParticipant(participant);
    if (error) {
      this.presentToast(error);
      return;
    }
    this.sendToChatbot(`Datos del participante ${index}`, { participant });
    this.participantForm.set({
      primerNombre: '',
      primerApellido: '',
      tipoDocumento: 'CEDULA',
      documento: '',
      edad: 18,
      cmAltura: 170,
      kgPeso: 70,
    });
  }

  confirmReservation(): void {
    this.sendToChatbot('Confirmo la reserva', { confirm: true });
  }

  cancelReservation(): void {
    this.sendToChatbot('Cancelar reserva', { cancel: true });
  }

  async goToReservation(response: ChatbotAnswerResponse): Promise<void> {
    const endpoint = response.action?.endpoint;
    if (endpoint && /^\/tabs\/reservas\/\d+$/.test(endpoint)) {
      await this.router.navigateByUrl(endpoint);
      return;
    }
    const reservation = this.getReservation(response.data);
    if (reservation?.id) {
      await this.router.navigate(['/tabs/reservas', reservation.id]);
    }
  }

  // ─── Participant form helpers ─────────────────────────────────────────────

  onParticipantInput(key: keyof ParticipantPayload, event: Event): void {
    const raw =
      (event as CustomEvent<{ value: unknown }>).detail?.value ?? '';
    const numericKeys: Array<keyof ParticipantPayload> = [
      'edad',
      'cmAltura',
      'kgPeso',
    ];
    if (numericKeys.includes(key)) {
      this.participantForm.update((prev) => ({ ...prev, [key]: Number(raw) }));
    } else {
      this.participantForm.update((prev) => ({ ...prev, [key]: String(raw) }));
    }
  }

  onReservationDateInput(event: Event): void {
    const value =
      (event as CustomEvent<{ value: string | null | undefined }>).detail
        .value ?? '';
    this.selectedDate.set(value);
  }

  onPeopleCountInput(event: Event): void {
    const raw = (
      event as CustomEvent<{ value: string | number | null | undefined }>
    ).detail.value;
    this.peopleCount.set(Math.max(1, Number(raw ?? 1)));
  }

  // ─── Action handler ───────────────────────────────────────────────────────

  async handleAction(action: ChatbotAction): Promise<void> {
    if (action.type === 'NAVIGATION') {
      if (
        this.knownRoutes.has(action.endpoint) ||
        /^\/tabs\/reservas\/\d+$/.test(action.endpoint)
      ) {
        await this.router.navigateByUrl(action.endpoint);
        return;
      }
    }
    await navigator.clipboard.writeText(action.endpoint);
    await this.presentToast('Endpoint copiado al portapapeles 📋');
  }

  isInternalNavigation(action: ChatbotAction): boolean {
    return (
      action.type === 'NAVIGATION' &&
      (this.knownRoutes.has(action.endpoint) ||
        /^\/tabs\/reservas\/\d+$/.test(action.endpoint))
    );
  }

  // ─── Formatters ───────────────────────────────────────────────────────────

  formatTime(value: string): string {
    return value?.slice(0, 5) ?? '';
  }

  formatCurrency(value: number | string | null | undefined): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(Number(value ?? 0));
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private isFutureDate(date: string): boolean {
    const selected = new Date(`${date}T00:00:00`);
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return selected >= tomorrow;
  }

  private validateParticipant(p: ParticipantPayload): string | null {
    if (!p.primerNombre?.trim()) return 'El primer nombre es obligatorio.';
    if (p.primerNombre.length > 100)
      return 'El primer nombre no puede superar 100 caracteres.';
    if (!p.primerApellido?.trim()) return 'El primer apellido es obligatorio.';
    if (p.primerApellido.length > 100)
      return 'El primer apellido no puede superar 100 caracteres.';
    if (!['CEDULA', 'PASAPORTE', 'TARJETA_IDENTIDAD'].includes(p.tipoDocumento))
      return 'Tipo de documento inválido.';
    if (!p.documento?.trim()) return 'El documento es obligatorio.';
    if (p.documento.length > 50)
      return 'El documento no puede superar 50 caracteres.';
    if (
      (p.tipoDocumento === 'CEDULA' ||
        p.tipoDocumento === 'TARJETA_IDENTIDAD') &&
      !/^\d+$/.test(p.documento)
    )
      return 'Para cédula o tarjeta de identidad el documento debe ser numérico.';
    if (
      p.tipoDocumento === 'PASAPORTE' &&
      !/^[a-zA-Z0-9]+$/.test(p.documento)
    )
      return 'Para pasaporte solo se permiten letras y números.';
    if (
      !Number.isFinite(Number(p.edad)) ||
      Number(p.edad) < 1 ||
      Number(p.edad) > 119
    )
      return 'La edad debe estar entre 1 y 119.';
    if (!Number.isFinite(Number(p.cmAltura)) || Number(p.cmAltura) < 1)
      return 'La altura debe ser mayor a 0.';
    if (!Number.isFinite(Number(p.kgPeso)) || Number(p.kgPeso) < 0.01)
      return 'El peso debe ser mayor a 0.';
    if (!/^\d{1,3}(\.\d{1,2})?$/.test(String(p.kgPeso)))
      return 'El peso debe tener máximo 3 dígitos enteros y 2 decimales.';
    return null;
  }

  private resolveErrorMessage(err: HttpErrorResponse): string {
    if (err.error?.message) return err.error.message;
    if (err.status === 0) return 'Sin conexión. Verifica tu red.';
    if (err.status === 401) return 'Tu sesión expiró. Por favor inicia sesión.';
    if (err.status === 403)
      return 'No tienes permiso para realizar esta acción.';
    if (err.status >= 500) return 'Error en el servidor. Intenta más tarde.';
    return 'Ocurrió un error inesperado.';
  }

  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'warning',
    });
    await toast.present();
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const el = this.messagesWrapper?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 80);
  }
}