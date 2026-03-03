import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButton } from '@ionic/angular/standalone';
import { ReservaService } from '../../core/services/reserva.service';
import { ReservaResponse } from '../../core/models/reserva.models';

@Component({
  selector: 'app-reservas-list',
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent, IonHeader, IonToolbar, IonTitle, IonButton],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Mis reservas</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-button routerLink="/reservas/nueva">Nueva reserva</ion-button>

      <div *ngIf="loading()">Cargando...</div>
      <div *ngIf="error()" class="text-red-600">{{ error() }}</div>

      <div *ngFor="let r of reservas()" class="mt-4 p-3 border rounded">
        <p><strong>#{{ r.id }}</strong> - {{ r.estado }}</p>
        <p>{{ r.rutaNombre }} | {{ r.fechaProgramada }} {{ r.tiempoInicio }}</p>
        <p>{{ r.cantPersonas }} persona(s)</p>
        <ion-button [routerLink]="['/reservas', r.id]" size="small">Ver detalle</ion-button>
      </div>
    </ion-content>
  `,
})
export class ReservasListPage {
  private readonly reservaService = inject(ReservaService);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly reservas = signal<ReservaResponse[]>([]);

  ionViewWillEnter(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set('');
    this.reservaService.listarMisReservas().subscribe({
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
}