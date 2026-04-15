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
import { CaballoService } from '../../core/services/caballo.service';
import { CaballoResponse } from '../../core/models/recurso.models';

@Component({
  selector: 'app-caballos-list',
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
        <ion-button [routerLink]="['/tabs/recursos/caballos/nuevo']" size="small">
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

      @for (c of caballos(); track c.id) {
        <ion-card>
          <ion-card-header>
            <ion-card-title>{{ c.nombre }}</ion-card-title>
            <ion-card-subtitle>{{ c.raza }}</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-badge [color]="c.activo ? 'success' : 'medium'">
              {{ c.activo ? 'Activo' : 'Inactivo' }}
            </ion-badge>
            <div style="display: flex; gap: 8px; margin-top: 12px;">
              <ion-button
                size="small"
                fill="outline"
                [routerLink]="['/tabs/recursos/caballos', c.id]">
                <ion-icon slot="start" name="create-outline"></ion-icon>
                Editar
              </ion-button>
              <ion-button
                size="small"
                [color]="c.activo ? 'danger' : 'success'"
                fill="outline"
                (click)="toggleEstado(c)">
                <ion-icon slot="start" name="power-outline"></ion-icon>
                {{ c.activo ? 'Desactivar' : 'Activar' }}
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      }

      @if (!loading() && !error() && caballos().length === 0) {
        <p style="text-align: center; color: var(--ion-color-medium);">
          No hay caballos registrados.
        </p>
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
    addIcons({ addOutline, createOutline, powerOutline });
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
