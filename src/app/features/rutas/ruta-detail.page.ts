import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonSpinner,
  IonBadge,
  IonChip,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { timeOutline, walkOutline, barbellOutline, calendarOutline } from 'ionicons/icons';
import { RutaService } from '../../core/services/ruta.service';
import { AuthService } from '../../core/services/auth.service';
import { RutaResponse } from '../../core/models/ruta.models';

@Component({
  selector: 'app-ruta-detail',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonSpinner,
    IonBadge,
    IonChip,
    IonLabel,
  ],
  templateUrl: './ruta-detail.page.html',
})
export class RutaDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rutaService = inject(RutaService);
  private readonly authService = inject(AuthService);

  readonly ruta = signal<RutaResponse | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly esAdmin = () => this.authService.session()?.role === 'ADMINISTRADOR';

  constructor() {
    addIcons({ timeOutline, walkOutline, barbellOutline, calendarOutline });
  }

  ionViewWillEnter(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('Ruta no encontrada.');
      return;
    }
    this.cargarRuta(id);
  }

  cargarRuta(id: number): void {
    this.loading.set(true);
    this.error.set('');
    this.rutaService.getRuta(id).subscribe({
      next: (data) => {
        this.ruta.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudo cargar la información de la ruta.');
      },
    });
  }

  reservar(ruta: RutaResponse): void {
    this.router.navigate(['/reservas/nueva'], { queryParams: { rutaId: ruta.id } });
  }

  dificultadColor(dificultad: string): string {
    switch (dificultad?.toLowerCase()) {
      case 'fácil':
      case 'facil': return 'success';
      case 'moderado':
      case 'moderada': return 'warning';
      case 'difícil':
      case 'dificil': return 'danger';
      default: return 'medium';
    }
  }
}
