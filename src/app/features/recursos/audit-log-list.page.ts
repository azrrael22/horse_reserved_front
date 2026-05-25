import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import {
  IonBadge,
  IonIcon,
  IonInput,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  InfiniteScrollCustomEvent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  closeCircleOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { AuditLogService } from '../../core/services/audit-log.service';
import {
  AuditCategoria,
  AuditLogFiltro,
  AuditLogResponse,
  AuditResultado,
} from '../../core/models/audit-log.models';

@Component({
  selector: 'app-audit-log-list',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    IonBadge,
    IonIcon,
    IonInput,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonSpinner,
  ],
  template: `
    <div class="ion-padding pb-2">

      <!-- Filtros -->
      <div class="grid grid-cols-2 gap-2 mb-4">

        <ion-item class="col-span-2 rounded-lg">
          <ion-label position="stacked">Email usuario</ion-label>
          <ion-input
            [(ngModel)]="filtro.usuarioEmail"
            placeholder="Buscar por email..."
            (ionChange)="resetYCargar()"
            clearInput>
          </ion-input>
        </ion-item>

        <ion-item class="rounded-lg">
          <ion-label position="stacked">Categoría</ion-label>
          <ion-select [(ngModel)]="filtro.categoria" (ionChange)="resetYCargar()" placeholder="Todas">
            <ion-select-option [value]="null">Todas</ion-select-option>
            <ion-select-option value="AUTENTICACION">Autenticación</ion-select-option>
            <ion-select-option value="RESERVA">Reservas</ion-select-option>
            <ion-select-option value="RECURSO_ADMIN">Admin</ion-select-option>
            <ion-select-option value="CUENTA">Cuenta</ion-select-option>
            <ion-select-option value="SISTEMA">Sistema</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item class="rounded-lg">
          <ion-label position="stacked">Resultado</ion-label>
          <ion-select [(ngModel)]="filtro.resultado" (ionChange)="resetYCargar()" placeholder="Todos">
            <ion-select-option [value]="null">Todos</ion-select-option>
            <ion-select-option value="EXITO">Éxito</ion-select-option>
            <ion-select-option value="FALLO">Fallo</ion-select-option>
            <ion-select-option value="ERROR_SISTEMA">Error sistema</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item class="rounded-lg">
          <ion-label position="stacked">Desde</ion-label>
          <ion-input type="date" [(ngModel)]="filtro.desde" (ionChange)="resetYCargar()"></ion-input>
        </ion-item>

        <ion-item class="rounded-lg">
          <ion-label position="stacked">Hasta</ion-label>
          <ion-input type="date" [(ngModel)]="filtro.hasta" (ionChange)="resetYCargar()"></ion-input>
        </ion-item>

      </div>

      @if (loading() && logs().length === 0) {
        <div class="flex justify-center py-8">
          <ion-spinner name="crescent"></ion-spinner>
        </div>
      }

      @if (error()) {
        <div class="rounded-lg bg-red-50 p-3 text-red-600 text-sm mb-4" role="alert">
          {{ error() }}
        </div>
      }

      @if (!loading() && logs().length === 0 && !error()) {
        <div class="text-center py-10 text-gray-400 text-sm">
          No hay registros para los filtros seleccionados.
        </div>
      }

      @for (log of logs(); track log.id) {
        <div class="mb-2 rounded-xl bg-white shadow-sm overflow-hidden border border-gray-100">
          <div class="p-3 flex gap-3 items-start">

            <div [class]="iconContainerClass(log.resultado)"
                 class="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center">
              <ion-icon [name]="iconName(log.resultado)" class="text-lg"></ion-icon>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-1 mb-0.5">
                <p class="text-sm font-semibold text-gray-800 truncate">
                  {{ formatAccion(log.accion) }}
                </p>
                <ion-badge [color]="badgeColor(log.resultado)" class="flex-shrink-0 text-xs">
                  {{ log.resultado }}
                </ion-badge>
              </div>
              <p class="text-xs text-gray-500 truncate mb-0.5">
                {{ log.usuarioEmail ?? 'Sistema' }}
              </p>
              <p class="text-xs text-gray-400">
                {{ log.ocurridoEn | date:'dd/MM/yy HH:mm:ss':'America/Bogota' }}
                @if (log.ipOrigen) { · {{ log.ipOrigen }} }
              </p>
              @if (log.detalle) {
                <p class="text-xs text-red-500 mt-1 line-clamp-2">{{ log.detalle }}</p>
              }
            </div>

          </div>
        </div>
      }

    </div>

    <ion-infinite-scroll [disabled]="!hayMas()" (ionInfinite)="cargarMas($event)">
      <ion-infinite-scroll-content loadingText="Cargando más..."></ion-infinite-scroll-content>
    </ion-infinite-scroll>
  `,
})
export class AuditLogListPage implements OnInit {
  private readonly auditLogService = inject(AuditLogService);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly logs = signal<AuditLogResponse[]>([]);
  readonly hayMas = signal(true);

  filtro: AuditLogFiltro = { page: 0, size: 30, categoria: null, resultado: null };
  private currentLoad?: Subscription;

  constructor() {
    addIcons({ shieldCheckmarkOutline, alertCircleOutline, closeCircleOutline });
  }

  ngOnInit(): void {
    this.cargar();
  }

  resetYCargar(): void {
    this.filtro.page = 0;
    this.logs.set([]);
    this.hayMas.set(true);
    this.cargar();
  }

  cargar(): void {
    this.currentLoad?.unsubscribe();
    this.loading.set(true);
    this.error.set('');
    this.currentLoad = this.auditLogService.listar(this.filtro).subscribe({
      next: (page) => {
        this.logs.update((prev) => [...prev, ...page.content]);
        this.hayMas.set(!page.last);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'No se pudieron cargar los logs.');
      },
    });
  }

  cargarMas(event: InfiniteScrollCustomEvent): void {
    this.filtro.page++;
    this.auditLogService.listar(this.filtro).subscribe({
      next: (page) => {
        this.logs.update((prev) => [...prev, ...page.content]);
        this.hayMas.set(!page.last);
        event.target.complete();
      },
      error: () => event.target.complete(),
    });
  }

  iconName(resultado: AuditResultado): string {
    if (resultado === 'EXITO') return 'shield-checkmark-outline';
    if (resultado === 'FALLO') return 'alert-circle-outline';
    return 'close-circle-outline';
  }

  iconContainerClass(resultado: AuditResultado): string {
    if (resultado === 'EXITO') return 'bg-green-50 text-green-600';
    if (resultado === 'FALLO') return 'bg-yellow-50 text-yellow-600';
    return 'bg-red-50 text-red-600';
  }

  badgeColor(resultado: AuditResultado): string {
    if (resultado === 'EXITO') return 'success';
    if (resultado === 'FALLO') return 'warning';
    return 'danger';
  }

  formatAccion(accion: string): string {
    return accion.replace(/_/g, ' ');
  }
}
