import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  IonRippleEffect,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { timeOutline, chevronForwardOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { RutaService } from '../../core/services/ruta.service';
import { RutaResponse } from '../../core/models/ruta.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonIcon,
    IonSpinner,
    IonBadge,
    IonRippleEffect,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Rutas disponibles</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">

      <div *ngIf="loading()" class="flex justify-center py-12">
        <ion-spinner></ion-spinner>
      </div>

      <div *ngIf="error()" class="rounded-lg bg-red-50 p-3 text-red-600 text-sm mb-4">
        {{ error() }}
      </div>

      <div *ngIf="!loading() && rutas().length === 0 && !error()"
           class="flex flex-col items-center justify-center py-16 text-center text-gray-400">
        <span class="text-5xl mb-3">🐴</span>
        <p class="font-medium">No hay rutas disponibles</p>
      </div>

      <!-- Cards de rutas (cliqueables) -->
      <div
        *ngFor="let r of rutas()"
        class="mb-4 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden ion-activatable relative cursor-pointer"
        (click)="verDetalle(r)"
      >
        <ion-ripple-effect></ion-ripple-effect>

        <!-- Imagen de la ruta -->
        <div
          *ngIf="r.urlImagen"
          class="h-44 bg-cover bg-center"
          [style.backgroundImage]="'url(' + r.urlImagen + ')'">
        </div>
        <div *ngIf="!r.urlImagen"
             class="h-44 bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
          <span class="text-6xl">🏔️</span>
        </div>

        <!-- Contenido -->
        <div class="p-4">
          <div class="flex items-start justify-between mb-1">
            <h3 class="text-base font-bold text-gray-800 flex-1 mr-2">{{ r.nombre }}</h3>
            <ion-badge [color]="dificultadColor(r.dificultad)" class="shrink-0">
              {{ r.dificultad }}
            </ion-badge>
          </div>

          <p class="text-sm text-gray-500 mb-3 line-clamp-2">{{ r.descripcion }}</p>

          <div class="flex items-center justify-between text-xs text-gray-400">
            <span class="flex items-center gap-1">
              <ion-icon name="time-outline"></ion-icon>
              {{ r.duracionMinutos }} min
            </span>
            <span class="flex items-center gap-1 text-primary font-medium">
              Ver detalles
              <ion-icon name="chevron-forward-outline"></ion-icon>
            </span>
          </div>
        </div>
      </div>

    </ion-content>
  `,
})
export class HomePage {
  private readonly authService = inject(AuthService);
  private readonly rutaService = inject(RutaService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly rutas = signal<RutaResponse[]>([]);

  constructor() {
    addIcons({ timeOutline, chevronForwardOutline });
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
    this.router.navigate(['/rutas', ruta.id]);
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
