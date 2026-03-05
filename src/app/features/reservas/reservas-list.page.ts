import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonBadge,
  IonMenuButton,
  IonButtons,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, refreshOutline } from 'ionicons/icons';
import { ReservaService } from '../../core/services/reserva.service';
import { AuthService } from '../../core/services/auth.service';
import { ReservaResponse } from '../../core/models/reserva.models';
import { AppFooterComponent } from '../../shared/components/app-footer/app-footer.component';

@Component({
  selector: 'app-reservas-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonBadge,
    IonMenuButton,
    IonButtons,
    IonSpinner,
    IonIcon,
    AppFooterComponent,
  ],
  templateUrl: './reservas-list.page.html',
})
export class ReservasListPage {
  private readonly reservaService = inject(ReservaService);
  private readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly reservas = signal<ReservaResponse[]>([]);

  readonly esAdmin = () => this.authService.session()?.role === 'ADMINISTRADOR';

  ionViewWillEnter(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set('');
    const obs = this.esAdmin()
      ? this.reservaService.listarTodas()
      : this.reservaService.listarMisReservas();

    obs.subscribe({
      next: (data) => {
        this.reservas.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'No se pudieron cargar las reservas.');
      },
    });
  }

  badgeColor(estado: string): string {
    switch (estado) {
      case 'reservado':   return 'primary';
      case 'completado':  return 'success';
      case 'cancelado':   return 'danger';
      default:            return 'medium';
    }
  }
}
