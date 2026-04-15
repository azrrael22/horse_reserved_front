import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonBadge,
  IonSpinner,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, powerOutline } from 'ionicons/icons';
import { GuiaService } from '../../core/services/guia.service';
import { GuiaResponse } from '../../core/models/recurso.models';

@Component({
  selector: 'app-guias-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonButton,
    IonBadge,
    IonSpinner,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
  ],
  template: `
    <div class="ion-padding">
      <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
        <ion-button [routerLink]="['/tabs/recursos/guias/nuevo']" size="small">
          <ion-icon slot="start" name="add-outline"></ion-icon>
          Nuevo
        </ion-button>
      </div>

      @if (loading()) {
        <div style="text-align: center; padding: 24px;">
          <ion-spinner name="crescent"></ion-spinner>
        </div>
      }

      @if (error()) {
        <p style="color: var(--ion-color-danger); text-align: center;">{{ error() }}</p>
      }

      @for (g of guias(); track g.id) {
        <ion-card>
          <ion-card-header>
            <ion-card-title>{{ g.nombre }}</ion-card-title>
            <ion-card-subtitle>{{ g.email }} · {{ g.telefono }}</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-badge [color]="g.activo ? 'success' : 'medium'">
              {{ g.activo ? 'Activo' : 'Inactivo' }}
            </ion-badge>
            <div style="display: flex; gap: 8px; margin-top: 12px;">
              <ion-button
                size="small"
                fill="outline"
                [routerLink]="['/tabs/recursos/guias', g.id]">
                <ion-icon slot="start" name="create-outline"></ion-icon>
                Editar
              </ion-button>
              <ion-button
                size="small"
                [color]="g.activo ? 'danger' : 'success'"
                fill="outline"
                (click)="toggleEstado(g)">
                <ion-icon slot="start" name="power-outline"></ion-icon>
                {{ g.activo ? 'Desactivar' : 'Activar' }}
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      }

      @if (!loading() && !error() && guias().length === 0) {
        <p style="text-align: center; color: var(--ion-color-medium);">
          No hay guías registrados.
        </p>
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
    addIcons({ addOutline, createOutline, powerOutline });
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
