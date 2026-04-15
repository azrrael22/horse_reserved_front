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
  IonFab,
  IonFabButton,
  IonRippleEffect,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { timeOutline, chevronForwardOutline, shieldCheckmarkOutline, heartOutline, ribbonOutline, locationOutline, chatbubblesOutline, compassOutline, imageOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { RutaService } from '../../core/services/ruta.service';
import { RutaResponse } from '../../core/models/ruta.models';
import { AppFooterComponent } from '../../shared/components/app-footer/app-footer.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { CardSkeletonComponent } from '../../shared/components/card-skeleton/card-skeleton.component';

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
    IonRippleEffect,
    AppFooterComponent,
    EmptyStateComponent,
    CardSkeletonComponent,
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  private readonly authService = inject(AuthService);
  private readonly rutaService = inject(RutaService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly rutas = signal<RutaResponse[]>([]);
  readonly heroFallback = signal(false);

  constructor() {
    addIcons({ timeOutline, chevronForwardOutline, shieldCheckmarkOutline, heartOutline, ribbonOutline, locationOutline, chatbubblesOutline, compassOutline, imageOutline });
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

  onHeroError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
    this.heroFallback.set(true);
  }

  dificultadOverlayClasses(dificultad: string): string {
    switch (dificultad?.toLowerCase()) {
      case 'fácil': case 'facil':
        return 'inline-flex items-center gap-1.5 bg-green-500 text-white text-xs font-semibold rounded-full px-2.5 py-0.5 shadow-sm';
      case 'moderado': case 'moderada':
        return 'inline-flex items-center gap-1.5 bg-amber-500 text-white text-xs font-semibold rounded-full px-2.5 py-0.5 shadow-sm';
      case 'difícil': case 'dificil':
        return 'inline-flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold rounded-full px-2.5 py-0.5 shadow-sm';
      default:
        return 'inline-flex items-center gap-1.5 bg-gray-500 text-white text-xs font-semibold rounded-full px-2.5 py-0.5 shadow-sm';
    }
  }
}
