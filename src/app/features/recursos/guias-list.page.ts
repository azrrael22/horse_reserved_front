import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonBadge,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, powerOutline, personCircleOutline } from 'ionicons/icons';
import { GuiaService } from '../../core/services/guia.service';
import { GuiaResponse } from '../../core/models/recurso.models';

@Component({
  selector: 'app-guias-list',
  standalone: true,
  imports: [
    RouterLink,
    IonButton,
    IonBadge,
    IonSpinner,
    IonIcon,
  ],
  template: `
    <div class="ion-padding">

      <!-- Cabecera + CTA -->
      <div class="flex items-end justify-between mb-5">
        <div>
          <p class="text-xs tracking-widest uppercase text-tertiary font-semibold mb-0.5">Gestión</p>
          <h2 class="section-title text-gray-800">Guías</h2>
        </div>
        <ion-button [routerLink]="['/tabs/recursos/guias/nuevo']" size="small">
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

      @if (!loading() && !error() && guias().length === 0) {
        <div class="text-center py-12">
          <ion-icon name="person-circle-outline" class="text-5xl text-secondary mb-3 block mx-auto"></ion-icon>
          <p class="text-sm text-muted">No hay guías registrados.</p>
        </div>
      }

      @for (g of guias(); track g.id) {
        <div class="mb-3 rounded-xl overflow-hidden bg-surface shadow-sm">
          <div class="p-4 flex gap-3">

            <!-- Icono -->
            <div class="w-14 h-14 rounded-xl flex-shrink-0 bg-primary-light flex items-center justify-center">
              <ion-icon name="person-circle-outline" class="text-2xl text-primary"></ion-icon>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2 mb-1">
                <p class="font-bold text-gray-800 section-title truncate">{{ g.nombre }}</p>
                <ion-badge [color]="g.activo ? 'success' : 'medium'" class="flex-shrink-0">
                  {{ g.activo ? 'Activo' : 'Inactivo' }}
                </ion-badge>
              </div>
              <div class="flex flex-col gap-0.5 mb-3">
                <span class="text-xs text-muted truncate">{{ g.email }}</span>
                <span class="text-xs text-muted">{{ g.telefono }}</span>
              </div>
              <div class="flex gap-2">
                <ion-button
                  size="small"
                  fill="outline"
                  [routerLink]="['/tabs/recursos/guias', g.id]">
                  <ion-icon name="create-outline" slot="start"></ion-icon>
                  Editar
                </ion-button>
                <ion-button
                  size="small"
                  fill="outline"
                  [color]="g.activo ? 'danger' : 'success'"
                  (click)="toggleEstado(g)">
                  <ion-icon name="power-outline" slot="start"></ion-icon>
                  {{ g.activo ? 'Desactivar' : 'Activar' }}
                </ion-button>
              </div>
            </div>

          </div>
        </div>
      }

    </div>
  `,
})
export class GuiasListPage implements OnInit {
  private readonly guiaService = inject(GuiaService);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly guias = signal<GuiaResponse[]>([]);

  constructor() {
    addIcons({ addOutline, createOutline, powerOutline, personCircleOutline });
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set('');
    this.guiaService.listar().subscribe({
      next: (data) => {
        this.guias.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'No se pudieron cargar los guías.');
      },
    });
  }

  toggleEstado(g: GuiaResponse): void {
    this.guiaService.cambiarEstado(g.id, !g.activo).subscribe({
      next: (updated) => {
        this.guias.update((list) =>
          list.map((x) => (x.id === updated.id ? updated : x))
        );
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo cambiar el estado.');
      },
    });
  }
}
