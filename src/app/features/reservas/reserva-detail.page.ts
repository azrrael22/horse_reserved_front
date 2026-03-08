import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonButtons,
  IonBackButton,
  IonMenuButton,
  IonBadge,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { createOutline } from 'ionicons/icons';
import { ReservaService } from '../../core/services/reserva.service';
import { AuthService } from '../../core/services/auth.service';
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
    IonBadge,
    IonSpinner,
    IonIcon,
    AppFooterComponent,
  ],
  templateUrl: './reserva-detail.page.html',
})
export class ReservaDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reservaService = inject(ReservaService);
  private readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly cancelando = signal(false);
  readonly error = signal('');
  readonly reserva = signal<ReservaResponse | null>(null);

  readonly esAdmin = () => this.authService.session()?.role === 'ADMINISTRADOR';

  constructor() {
    addIcons({ createOutline });
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

  cancelar(): void {
    const current = this.reserva();
    if (!current || this.cancelando()) return;

    this.cancelando.set(true);
    this.error.set('');
    this.reservaService.cancelarReserva(current.id).subscribe({
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

  badgeColor(estado: string): string {
    switch (estado) {
      case 'reservado':  return 'primary';
      case 'completado': return 'success';
      case 'cancelado':  return 'danger';
      default:           return 'medium';
    }
  }
}
