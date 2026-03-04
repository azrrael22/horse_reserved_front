import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonBadge,
  IonBackButton,
  IonButtons,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, refreshOutline } from 'ionicons/icons';
import { ReservaService } from '../../core/services/reserva.service';
import { AuthService } from '../../core/services/auth.service';
import { ReservaResponse } from '../../core/models/reserva.models';

@Component({
  selector: 'app-reservas-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonBadge,
    IonButtons,
    IonBackButton,
    IonSpinner,
    IonIcon,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ esAdmin() ? 'Todas las reservas' : 'Mis reservas' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cargar()">
            <ion-icon name="refresh-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">

      <div *ngIf="!esAdmin()" class="mb-4">
        <ion-button [routerLink]="['/reservas/nueva']" expand="block">
          <ion-icon name="add-outline" slot="start"></ion-icon>
          Nueva reserva
        </ion-button>
      </div>

      <div *ngIf="loading()" class="flex justify-center py-8">
        <ion-spinner></ion-spinner>
      </div>

      <div *ngIf="error()" class="rounded-lg bg-red-50 p-3 text-red-600 text-sm mb-4">
        {{ error() }}
      </div>

      <div *ngIf="!loading() && reservas().length === 0 && !error()" class="text-center py-12 text-gray-500">
        <p class="text-lg font-medium">No hay reservas</p>
        <p *ngIf="!esAdmin()" class="text-sm mt-1">Crea tu primera reserva para comenzar</p>
      </div>

      <div *ngFor="let r of reservas()" class="mb-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div class="flex items-start justify-between">
          <div>
            <p class="font-semibold text-gray-800">{{ r.rutaNombre }}</p>
            <p class="text-sm text-gray-500 mt-0.5">
              {{ r.fechaProgramada }} · {{ r.tiempoInicio | slice:0:5 }}
            </p>
            <p class="text-sm text-gray-600 mt-1">{{ r.cantPersonas }} persona(s)</p>
            <p *ngIf="esAdmin() && r.clienteEmail" class="text-xs text-gray-400 mt-0.5">
              Cliente: {{ r.clienteEmail }}
            </p>
            <p *ngIf="esAdmin() && !r.clienteEmail" class="text-xs text-gray-400 mt-0.5">
              Cliente: Invitado
            </p>
          </div>
          <ion-badge [color]="badgeColor(r.estado)">{{ r.estado }}</ion-badge>
        </div>
        <div class="mt-3">
          <ion-button [routerLink]="['/reservas', r.id]" size="small" fill="outline">
            Ver detalle
          </ion-button>
        </div>
      </div>

    </ion-content>
  `,
})
export class ReservasListPage {
  private readonly reservaService = inject(ReservaService);
  private readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly reservas = signal<ReservaResponse[]>([]);

  readonly esAdmin = () => this.authService.session()?.role === 'ADMINISTRADOR';

  ionViewWillEnter(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set('');
    const obs = this.esAdmin()
      ? this.reservaService.listarTodas()
      : this.reservaService.listarMisReservas();

    obs.subscribe({
      next: (data) => {
        this.reservas.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'No se pudieron cargar las reservas.');
      },
    });
  }

  badgeColor(estado: string): string {
    switch (estado) {
      case 'reservado':   return 'primary';
      case 'completado':  return 'success';
      case 'cancelado':   return 'danger';
      default:            return 'medium';
    }
  }
}
