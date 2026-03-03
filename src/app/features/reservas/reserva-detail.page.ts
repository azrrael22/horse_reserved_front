import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButton } from '@ionic/angular/standalone';
import { ReservaService } from '../../core/services/reserva.service';
import { ReservaResponse } from '../../core/models/reserva.models';

@Component({
  selector: 'app-reserva-detail',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButton],
  template: `
    <ion-header><ion-toolbar color="primary"><ion-title>Detalle reserva</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      <div *ngIf="loading()">Cargando...</div>
      <div *ngIf="error()" class="text-red-600">{{ error() }}</div>

      <ng-container *ngIf="reserva() as r">
        <p><strong>#{{ r.id }}</strong> - {{ r.estado }}</p>
        <p>{{ r.rutaNombre }}</p>
        <p>{{ r.fechaProgramada }} {{ r.tiempoInicio }} - {{ r.tiempoFin }}</p>

        <ion-button color="danger" (click)="cancelar()" [disabled]="cancelando() || r.estado === 'cancelado' || r.estado === 'completado'">
          {{ cancelando() ? 'Cancelando...' : 'Cancelar reserva' }}
        </ion-button>
      </ng-container>
    </ion-content>
  `,
})
export class ReservaDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reservaService = inject(ReservaService);

  readonly loading = signal(false);
  readonly cancelando = signal(false);
  readonly error = signal('');
  readonly reserva = signal<ReservaResponse | null>(null);

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
}