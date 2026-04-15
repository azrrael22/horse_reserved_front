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
  IonMenuButton,
  IonIcon,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { timeOutline, walkOutline, barbellOutline, calendarOutline, imageOutline, cashOutline } from 'ionicons/icons';
import { RutaService } from '../../core/services/ruta.service';
import { AuthService } from '../../core/services/auth.service';
import { RutaResponse } from '../../core/models/ruta.models';
import { AppFooterComponent } from '../../shared/components/app-footer/app-footer.component';

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
    IonMenuButton,
    IonIcon,
    IonSkeletonText,
    AppFooterComponent,
  ],
  templateUrl: './ruta-detail.page.html',
  styleUrls: ['./ruta-detail.page.scss'],
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
    addIcons({ timeOutline, walkOutline, barbellOutline, calendarOutline, imageOutline, cashOutline });
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
    this.router.navigate(['/tabs/reservas/nueva'], { queryParams: { rutaId: ruta.id } });
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

  dificultadChipClasses(dificultad: string): string {
    switch (dificultad?.toLowerCase()) {
      case 'fácil': case 'facil':
        return 'inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-full px-4 py-1.5';
      case 'moderado': case 'moderada':
        return 'inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-sm font-medium rounded-full px-4 py-1.5';
      case 'difícil': case 'dificil':
        return 'inline-flex items-center gap-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-full px-4 py-1.5';
      default:
        return 'inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-sm font-medium rounded-full px-4 py-1.5';
    }
  }

  dificultadDotClasses(dificultad: string): string {
    switch (dificultad?.toLowerCase()) {
      case 'fácil': case 'facil':    return 'w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0';
      case 'moderado': case 'moderada': return 'w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0';
      case 'difícil': case 'dificil':   return 'w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0';
      default:                           return 'w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0';
    }
  }

  formatDuracion(minutos: number): string {
    if (minutos < 60) return `${minutos} min`;
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  }
}
