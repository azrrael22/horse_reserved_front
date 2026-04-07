import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonIcon,
  IonSpinner,
  IonBadge,
  IonFab,
  IonFabButton,
  IonRippleEffect,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { timeOutline, chevronForwardOutline, shieldCheckmarkOutline, heartOutline, ribbonOutline, locationOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { RutaService } from '../../core/services/ruta.service';
import { RutaResponse } from '../../core/models/ruta.models';
import { AppFooterComponent } from '../../shared/components/app-footer/app-footer.component';
import { chatbubblesOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonIcon,
    IonSpinner,
    IonBadge,
    IonRippleEffect,
    AppFooterComponent,
  ],
  templateUrl: './home.page.html',
})
export class HomePage {
  private readonly authService = inject(AuthService);
  private readonly rutaService = inject(RutaService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly rutas = signal<RutaResponse[]>([]);

  constructor() {
    addIcons({ timeOutline, chevronForwardOutline, shieldCheckmarkOutline, heartOutline, ribbonOutline, locationOutline, chatbubblesOutline });
  }

  ionViewWillEnter(): void {
    this.cargarRutas();
  }

  cargarRutas(): void {
    this.loading.set(true);
    this.error.set('');
    this.rutaService.listarActivas().subscribe({
      next: (data) => {
        this.rutas.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudieron cargar las rutas.');
      },
    });
  }

  verDetalle(ruta: RutaResponse): void {
    this.router.navigate(['/tabs/rutas', ruta.id]);
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
