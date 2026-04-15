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
    IonBadge,
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

  badgeColor(estado: string): string {
    switch (estado) {
      case 'reservado':   return 'primary';
      case 'completado':  return 'success';
      case 'cancelado':   return 'danger';
      default:            return 'medium';
    }
  }
}
