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
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/inicio"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ ruta()?.nombre ?? 'Ruta' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>

      <!-- Loading -->
      <div *ngIf="loading()" class="flex justify-center py-16">
        <ion-spinner></ion-spinner>
      </div>

      <!-- Error -->
      <div *ngIf="error()" class="m-4 rounded-lg bg-red-50 p-4 text-red-600 text-sm">
        {{ error() }}
      </div>

      <!-- Contenido de la ruta -->
      <ng-container *ngIf="!loading() && ruta() as r">

        <!-- Hero imagen -->
        <div
          *ngIf="r.urlImagen"
          class="w-full h-56 bg-cover bg-center"
          [style.backgroundImage]="'url(' + r.urlImagen + ')'">
        </div>
        <div *ngIf="!r.urlImagen"
             class="w-full h-56 bg-gradient-to-br from-green-100 to-emerald-300 flex items-center justify-center">
          <span class="text-7xl">🏔️</span>
        </div>

        <!-- Info principal -->
        <div class="p-5">

          <!-- Nombre + dificultad -->
          <div class="flex items-start justify-between mb-3">
            <h1 class="text-2xl font-bold text-gray-800 leading-tight flex-1 mr-3">{{ r.nombre }}</h1>
            <ion-badge [color]="dificultadColor(r.dificultad)" class="shrink-0 text-sm px-2 py-1">
              {{ r.dificultad }}
            </ion-badge>
          </div>

          <!-- Chips de características -->
          <div class="flex flex-wrap gap-2 mb-5">
            <ion-chip color="medium" class="text-sm">
              <ion-icon name="time-outline" class="mr-1"></ion-icon>
              <ion-label>{{ r.duracionMinutos }} minutos</ion-label>
            </ion-chip>
            <ion-chip [color]="dificultadColor(r.dificultad)" class="text-sm">
              <ion-icon name="barbell-outline" class="mr-1"></ion-icon>
              <ion-label>{{ r.dificultad }}</ion-label>
            </ion-chip>
          </div>

          <!-- Descripción -->
          <div class="mb-6">
            <h2 class="text-base font-semibold text-gray-700 mb-2">Descripción</h2>
            <p class="text-sm text-gray-600 leading-relaxed">{{ r.descripcion }}</p>
          </div>

          <!-- Separador -->
          <hr class="border-gray-200 mb-6">

          <!-- Botón Reservar (solo CLIENTE y OPERADOR) -->
          <ion-button
            *ngIf="!esAdmin()"
            expand="block"
            size="large"
            (click)="reservar(r)"
          >
            <ion-icon name="calendar-outline" slot="start"></ion-icon>
            Reservar esta ruta
          </ion-button>

          <p *ngIf="esAdmin()" class="text-xs text-center text-gray-400 pb-4">
            Solo visualización — el ADMINISTRADOR no puede crear reservas
          </p>

        </div>
      </ng-container>

    </ion-content>
  `,
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
