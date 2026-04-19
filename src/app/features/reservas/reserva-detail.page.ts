import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AlertController,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonButtons,
  IonBackButton,
  IonMenuButton,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { createOutline, calendarOutline, peopleOutline, cardOutline } from 'ionicons/icons';
import { ReservaService } from '../../core/services/reserva.service';
import { AuthService } from '../../core/services/auth.service';
import { PagoService } from '../../core/services/pago.service';
import { ToastService } from '../../core/services/toast.service';
import { ReservaResponse } from '../../core/models/reserva.models';
import { AppFooterComponent } from '../../shared/components/app-footer/app-footer.component';

@Component({
  selector: 'app-reserva-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonButtons,
    IonBackButton,
    IonMenuButton,
    IonSpinner,
    IonIcon,
    AppFooterComponent,
  ],
  templateUrl: './reserva-detail.page.html',
  styleUrls: ['./reserva-detail.page.scss'],
})
export class ReservaDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reservaService = inject(ReservaService);
  private readonly authService = inject(AuthService);
  private readonly pagoService = inject(PagoService);
  private readonly toastService = inject(ToastService);
  private readonly alertCtrl = inject(AlertController);

  readonly loading = signal(false);
  readonly cancelando = signal(false);
  readonly iniciandoPago = signal(false);
  readonly error = signal('');
  readonly reserva = signal<ReservaResponse | null>(null);

  readonly esAdmin = () => this.authService.session()?.role === 'ADMINISTRADOR';

  constructor() {
    addIcons({ createOutline, calendarOutline, peopleOutline, cardOutline });
  }

  ionViewWillEnter(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('ID inválido');
      return;
    }
    this.cargar(id);
  }

  cargar(id: number): void {
    this.loading.set(true);
    this.error.set('');
    this.reservaService.obtenerReservaPorId(id).subscribe({
      next: (res) => {
        this.reserva.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo cargar la reserva.');
      },
    });
  }

  pagarConMercadoPago(): void {
    const r = this.reserva();
    if (!r || this.iniciandoPago()) return;

    this.iniciandoPago.set(true);
    this.pagoService.crearPreferencia({ reservaId: r.id }).subscribe({
      next: (res) => {
        window.location.href = res.sandboxInitPoint;
      },
      error: (err) => {
        this.iniciandoPago.set(false);
        this.toastService.error(err?.error?.message ?? 'No se pudo iniciar el pago.');
      },
    });
  }

  async cancelar(): Promise<void> {
    const current = this.reserva();
    if (!current || this.cancelando()) return;

    const alert = await this.alertCtrl.create({
      header: 'Cancelar reserva',
      message: '¿Estás seguro? Esta acción no se puede deshacer.',
      buttons: [
        { text: 'No, mantener', role: 'cancel' },
        {
          text: 'Sí, cancelar',
          role: 'destructive',
          handler: () => this.ejecutarCancelacion(current.id),
        },
      ],
    });
    await alert.present();
  }

  private ejecutarCancelacion(id: number): void {
    this.cancelando.set(true);
    this.error.set('');
    this.reservaService.cancelarReserva(id).subscribe({
      next: (res) => {
        this.cancelando.set(false);
        this.reserva.set(res);
      },
      error: (err) => {
        this.cancelando.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo cancelar la reserva.');
      },
    });
  }

  estadoClasses(estado: string): string {
    switch (estado) {
      case 'reservado':
        return 'inline-flex items-center gap-1.5 bg-primary-light text-primary text-xs font-medium rounded-full px-2.5 py-0.5 flex-shrink-0';
      case 'completado':
        return 'inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-full px-2.5 py-0.5 flex-shrink-0';
      case 'cancelado':
        return 'inline-flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-full px-2.5 py-0.5 flex-shrink-0';
      default:
        return 'inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full px-2.5 py-0.5 flex-shrink-0';
    }
  }

  estadoDotClasses(estado: string): string {
    switch (estado) {
      case 'reservado':  return 'w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0';
      case 'completado': return 'w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0';
      case 'cancelado':  return 'w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0';
      default:           return 'w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0';
    }
  }

  estadoLabel(estado: string): string {
    switch (estado) {
      case 'reservado':  return 'Reservada';
      case 'completado': return 'Completada';
      case 'cancelado':  return 'Cancelada';
      default:           return estado;
    }
  }
}
