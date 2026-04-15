import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, powerOutline, pawOutline } from 'ionicons/icons';
import { CaballoService } from '../../core/services/caballo.service';
import { CaballoResponse } from '../../core/models/recurso.models';

@Component({
  selector: 'app-caballos-list',
  standalone: true,
  imports: [
    RouterLink,
    IonButton,
    IonSpinner,
    IonIcon,
  ],
  template: `
    <div class="ion-padding">

      <!-- Cabecera + CTA -->
      <div class="flex items-end justify-between mb-5">
        <div>
          <p class="text-xs tracking-widest uppercase text-tertiary font-semibold mb-0.5">Gestión</p>
          <h2 class="section-title text-gray-800">Caballos</h2>
        </div>
        <ion-button [routerLink]="['/tabs/recursos/caballos/nuevo']" size="small">
          <ion-icon name="add-outline" slot="start"></ion-icon>
          Nuevo
        </ion-button>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-8">
          <ion-spinner name="crescent"></ion-spinner>
        </div>
      }

      @if (error()) {
        <div class="rounded-lg bg-red-50 p-3 text-red-600 text-sm mb-4" role="alert">
          {{ error() }}
        </div>
      }

      @if (!loading() && !error() && caballos().length === 0) {
        <div class="text-center py-12">
          <ion-icon name="paw-outline" class="text-5xl text-secondary mb-3 block mx-auto"></ion-icon>
          <p class="text-sm text-muted">No hay caballos registrados.</p>
        </div>
      }

      @for (c of caballos(); track c.id) {
        <div class="mb-3 rounded-xl overflow-hidden bg-surface shadow-sm">
          <div class="p-4 flex gap-3">

            <!-- Icono -->
            <div class="w-14 h-14 rounded-xl flex-shrink-0 bg-primary-light flex items-center justify-center">
              <ion-icon name="paw-outline" class="text-2xl text-primary"></ion-icon>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2 mb-1">
                <p class="font-bold text-gray-800 section-title truncate">{{ c.nombre }}</p>
                <span [class]="c.activo
                  ? 'inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-full px-2.5 py-0.5 flex-shrink-0'
                  : 'inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full px-2.5 py-0.5 flex-shrink-0'">
                  <span [class]="c.activo ? 'w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0' : 'w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0'"></span>
                  {{ c.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
              <p class="text-sm text-muted mb-3">{{ c.raza }}</p>
              <div class="flex gap-2">
                <ion-button
                  size="small"
                  fill="outline"
                  [routerLink]="['/tabs/recursos/caballos', c.id]">
                  <ion-icon name="create-outline" slot="start"></ion-icon>
                  Editar
                </ion-button>
                <ion-button
                  size="small"
                  fill="outline"
                  [color]="c.activo ? 'danger' : 'success'"
                  (click)="toggleEstado(c)">
                  <ion-icon name="power-outline" slot="start"></ion-icon>
                  {{ c.activo ? 'Desactivar' : 'Activar' }}
                </ion-button>
              </div>
            </div>

          </div>
        </div>
      }

    </div>
  `,
})
export class CaballosListPage implements OnInit {
  private readonly caballoService = inject(CaballoService);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly caballos = signal<CaballoResponse[]>([]);

  constructor() {
    addIcons({ addOutline, createOutline, powerOutline, pawOutline });
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set('');
    this.caballoService.listar().subscribe({
      next: (data) => {
        this.caballos.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'No se pudieron cargar los caballos.');
      },
    });
  }

  toggleEstado(c: CaballoResponse): void {
    this.caballoService.cambiarEstado(c.id, !c.activo).subscribe({
      next: (updated) => {
        this.caballos.update((list) =>
          list.map((x) => (x.id === updated.id ? updated : x))
        );
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo cambiar el estado.');
      },
    });
  }
}
