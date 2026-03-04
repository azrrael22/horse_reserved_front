import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonButtons,
  IonBackButton,
  IonBadge,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { createOutline } from 'ionicons/icons';
import { ReservaService } from '../../core/services/reserva.service';
import { AuthService } from '../../core/services/auth.service';
import { ReservaResponse } from '../../core/models/reserva.models';

@Component({
  selector: 'app-reserva-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonButtons,
    IonBackButton,
    IonBadge,
    IonSpinner,
    IonIcon,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/reservas"></ion-back-button>
        </ion-buttons>
        <ion-title>Detalle de reserva</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">

      <div *ngIf="loading()" class="flex justify-center py-8">
        <ion-spinner></ion-spinner>
      </div>

      <div *ngIf="error()" class="rounded-lg bg-red-50 p-3 text-red-600 text-sm mb-4">
        {{ error() }}
      </div>

      <ng-container *ngIf="reserva() as r">

        <!-- Encabezado -->
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-gray-800">Reserva #{{ r.id }}</h2>
          <ion-badge [color]="badgeColor(r.estado)">{{ r.estado }}</ion-badge>
        </div>

        <!-- Datos de la salida -->
        <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm mb-4">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Ruta</p>
          <p class="font-semibold text-gray-800">{{ r.rutaNombre }}</p>
          <p class="text-sm text-gray-600 mt-1">
            {{ r.fechaProgramada }} · {{ r.tiempoInicio | slice:0:5 }} – {{ r.tiempoFin | slice:0:5 }}
          </p>
          <p class="text-sm text-gray-500 mt-1">{{ r.cantPersonas }} persona(s)</p>
        </div>

        <!-- Cliente / Operador -->
        <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm mb-4">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Responsable</p>
          <p class="text-sm text-gray-700">
            <span class="font-medium">Cliente:</span>
            {{ r.clienteEmail ?? 'Invitado' }}
          </p>
          <p *ngIf="r.operadorId" class="text-sm text-gray-700 mt-1">
            <span class="font-medium">Operador ID:</span> {{ r.operadorId }}
          </p>
        </div>

        <!-- Participantes -->
        <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm mb-6">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Participantes</p>
          <div *ngFor="let p of r.participantes; let i = index" class="mb-3 last:mb-0">
            <p class="text-sm font-medium text-gray-800">
              {{ i + 1 }}. {{ p.primerNombre }} {{ p.primerApellido }}
            </p>
            <p class="text-xs text-gray-500">
              {{ p.tipoDocumento }}: {{ p.documento }} · {{ p.edad }} años ·
              {{ p.cmAltura }} cm · {{ p.kgPeso }} kg
            </p>
          </div>
        </div>

        <!-- Acciones (solo para no-ADMIN) -->
        <div class="flex flex-col gap-3" *ngIf="!esAdmin()">
          <ion-button
            *ngIf="r.estado === 'reservado'"
            [routerLink]="['/reservas', r.id, 'editar']"
            expand="block"
            fill="outline"
          >
            <ion-icon name="create-outline" slot="start"></ion-icon>
            Editar reserva
          </ion-button>

          <ion-button
            color="danger"
            expand="block"
            fill="outline"
            (click)="cancelar()"
            [disabled]="cancelando() || r.estado !== 'reservado'"
          >
            <ion-spinner *ngIf="cancelando()" slot="start" name="crescent"></ion-spinner>
            {{ cancelando() ? 'Cancelando...' : 'Cancelar reserva' }}
          </ion-button>
        </div>

      </ng-container>
    </ion-content>
  `,
})
export class ReservaDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reservaService = inject(ReservaService);
  private readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly cancelando = signal(false);
  readonly error = signal('');
  readonly reserva = signal<ReservaResponse | null>(null);

  readonly esAdmin = () => this.authService.session()?.role === 'ADMINISTRADOR';

  constructor() {
    addIcons({ createOutline });
  }

  ionViewWillEnter(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('ID inválido');
      return;
    }
    this.cargar(id);
  }

  cargar(id: number): void {
    this.loading.set(true);
    this.error.set('');
    this.reservaService.obtenerReservaPorId(id).subscribe({
      next: (res) => {
        this.reserva.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo cargar la reserva.');
      },
    });
  }

  cancelar(): void {
    const current = this.reserva();
    if (!current || this.cancelando()) return;

    this.cancelando.set(true);
    this.error.set('');
    this.reservaService.cancelarReserva(current.id).subscribe({
      next: (res) => {
        this.cancelando.set(false);
        this.reserva.set(res);
      },
      error: (err) => {
        this.cancelando.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo cancelar la reserva.');
      },
    });
  }

  badgeColor(estado: string): string {
    switch (estado) {
      case 'reservado':  return 'primary';
      case 'completado': return 'success';
      case 'cancelado':  return 'danger';
      default:           return 'medium';
    }
  }
}
