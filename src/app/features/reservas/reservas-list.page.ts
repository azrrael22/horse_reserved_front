import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonMenuButton,
  IonButtons,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, refreshOutline, calendarOutline, peopleOutline, chevronForwardOutline } from 'ionicons/icons';
import { ReservaService } from '../../core/services/reserva.service';
import { AuthService } from '../../core/services/auth.service';
import { ReservaResponse } from '../../core/models/reserva.models';
import { AppFooterComponent } from '../../shared/components/app-footer/app-footer.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { CardSkeletonComponent } from '../../shared/components/card-skeleton/card-skeleton.component';

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
    IonMenuButton,
    IonButtons,
    IonIcon,
    AppFooterComponent,
    EmptyStateComponent,
    CardSkeletonComponent,
  ],
  templateUrl: './reservas-list.page.html',
  styleUrls: ['./reservas-list.page.scss'],
})
export class ReservasListPage {
  private readonly reservaService = inject(ReservaService);
  private readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly reservas = signal<ReservaResponse[]>([]);

  readonly esAdmin = () => this.authService.session()?.role === 'ADMINISTRADOR';

  constructor() {
    addIcons({ addOutline, refreshOutline, calendarOutline, peopleOutline, chevronForwardOutline });
  }

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
