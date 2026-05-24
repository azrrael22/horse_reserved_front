import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { IonButton, IonSpinner, IonIcon, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { refreshOutline, bicycleOutline } from 'ionicons/icons';
import { ProgresoService } from '../../core/services/progreso.service';
import { RutaService } from '../../core/services/ruta.service';
import { CabalgataProgresoResponse, RutaAdminResponse } from '../../core/models/ruta.models';

const ESTADO_CONFIG = {
  NO_INICIADA: { label: 'No iniciada', clase: 'bg-gray-100 text-gray-600' },
  EN_CURSO:    { label: 'En curso',    clase: 'bg-green-50 text-green-700' },
  FINALIZADA:  { label: 'Finalizada',  clase: 'bg-blue-50 text-blue-700'  },
} as const;

@Component({
  selector: 'app-progreso-cabalgatas',
  standalone: true,
  imports: [IonButton, IonSpinner, IonIcon, SlicePipe],
  template: `
    <div class="ion-padding">

      <!-- Cabecera -->
      <div class="flex items-end justify-between mb-5">
        <div>
          <p class="text-xs tracking-widest uppercase text-tertiary font-semibold mb-0.5">Monitor</p>
          <h2 class="section-title text-gray-800">Progreso de Cabalgatas</h2>
        </div>
        <div class="flex gap-2 items-center">
          <!-- Toggle auto-refresh -->
          <button
            class="text-xs px-2.5 py-1 rounded-full border transition-colors"
            [class.bg-primary]="autoRefresh()"
            [class.text-white]="autoRefresh()"
            [class.border-primary]="autoRefresh()"
            [class.bg-white]="!autoRefresh()"
            [class.text-gray-500]="!autoRefresh()"
            [class.border-gray-300]="!autoRefresh()"
            (click)="toggleAutoRefresh()">
            Auto
          </button>
          <ion-button size="small" fill="clear" (click)="cargar()">
            <ion-icon name="refresh-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </div>
      </div>

      <!-- Filtro por ruta -->
      <div class="mb-4">
        <select
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white
                 focus:outline-none focus:ring-2 focus:ring-primary"
          [value]="rutaSeleccionada()"
          (change)="onRutaChange($event)">
          <option value="">Todas las rutas</option>
          @for (r of rutasDisponibles(); track r.id) {
            <option [value]="r.id">{{ r.nombre }}</option>
          }
        </select>
      </div>

      <!-- Auto-refresh indicador -->
      @if (autoRefresh()) {
        <p class="text-xs text-muted mb-3 text-center">
          Actualizando cada {{ INTERVALO_SEG }}s
        </p>
      }

      <!-- Loading -->
      @if (loading()) {
        <div class="flex justify-center py-8">
          <ion-spinner name="crescent"></ion-spinner>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="rounded-lg bg-red-50 p-3 text-red-600 text-sm mb-4" role="alert">
          {{ error() }}
        </div>
      }

      <!-- Vacío -->
      @if (!loading() && !error() && salidas().length === 0) {
        <div class="text-center py-12">
          <ion-icon name="bicycle-outline" class="text-5xl text-secondary mb-3 block mx-auto"></ion-icon>
          <p class="text-sm text-muted">No hay salidas registradas.</p>
        </div>
      }

      <!-- Tarjetas de progreso -->
      @for (s of salidas(); track s.salidaId) {
        <div class="mb-3 rounded-xl bg-surface shadow-sm overflow-hidden">
          <div class="p-4">

            <!-- Nombre ruta + badge estado -->
            <div class="flex items-center justify-between gap-2 mb-1">
              <p class="font-bold text-gray-800 truncate">{{ s.rutaNombre }}</p>
              <span [class]="badgeClase(s.estadoCalculado) +
                ' text-xs font-medium rounded-full px-2.5 py-0.5 flex-shrink-0'">
                {{ badgeLabel(s.estadoCalculado) }}
              </span>
            </div>

            <!-- Fecha y hora -->
            <p class="text-xs text-muted mb-3">
              {{ s.fechaProgramada }} · {{ s.tiempoInicio | slice:0:5 }} → {{ s.tiempoFin | slice:0:5 }}
              · {{ s.duracionMinutos }} min
            </p>

            <!-- Barra de progreso -->
            <div class="w-full bg-gray-200 rounded-full h-2 mb-1">
              <div
                class="h-2 rounded-full transition-all duration-500"
                [class.bg-gray-400]="s.estadoCalculado === 'NO_INICIADA'"
                [class.bg-primary]="s.estadoCalculado === 'EN_CURSO'"
                [class.bg-blue-500]="s.estadoCalculado === 'FINALIZADA'"
                [style.width.%]="s.progresoPorcentaje">
              </div>
            </div>

            <!-- Porcentaje y minutos -->
            <div class="flex justify-between text-xs text-muted mt-1">
              <span>{{ s.minutosTranscurridos }} min transcurridos</span>
              <span class="font-semibold">{{ s.progresoPorcentaje }}%</span>
            </div>

          </div>
        </div>
      }

      <!-- Paginación -->
      @if (totalPages() > 1) {
        <div class="flex items-center justify-between mt-4 px-1">
          <ion-button size="small" fill="clear"
            [disabled]="pagina() === 0"
            (click)="irPagina(pagina() - 1)">
            Anterior
          </ion-button>
          <span class="text-sm text-muted">{{ pagina() + 1 }} / {{ totalPages() }}</span>
          <ion-button size="small" fill="clear"
            [disabled]="pagina() === totalPages() - 1"
            (click)="irPagina(pagina() + 1)">
            Siguiente
          </ion-button>
        </div>
      }

    </div>
  `,
})
export class ProgresoCabalgatasPage implements OnInit, OnDestroy {
  protected readonly INTERVALO_SEG = 30;

  private readonly progresoService = inject(ProgresoService);
  private readonly rutaService     = inject(RutaService);
  private readonly toastCtrl       = inject(ToastController);

  readonly loading           = signal(false);
  readonly error             = signal('');
  readonly salidas           = signal<CabalgataProgresoResponse[]>([]);
  readonly rutasDisponibles  = signal<RutaAdminResponse[]>([]);
  readonly rutaSeleccionada  = signal<number | ''>('');
  readonly pagina            = signal(0);
  readonly totalPages        = signal(0);
  readonly autoRefresh       = signal(false);

  private refreshInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    addIcons({ refreshOutline, bicycleOutline });
  }

  ngOnInit(): void {
    this.cargarRutas();
    this.cargar();
  }

  ngOnDestroy(): void {
    this.detenerAutoRefresh();
  }

  private cargarRutas(): void {
    this.rutaService.listarAdmin({ size: 200 }).subscribe({
      next: (page) => this.rutasDisponibles.set(page.content),
      error: () => { /* no crítico: el select simplemente queda vacío */ },
    });
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set('');

    const params = { page: this.pagina(), size: 20 };
    const rutaId = this.rutaSeleccionada();

    const req$ = rutaId
      ? this.progresoService.getProgresoPorRuta(+rutaId, params)
      : this.progresoService.getProgresoGlobal(params);

    req$.subscribe({
      next: (page) => {
        this.salidas.set(page.content);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo cargar el progreso.');
      },
    });
  }

  onRutaChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.rutaSeleccionada.set(val ? +val : '');
    this.pagina.set(0);
    this.cargar();
  }

  irPagina(p: number): void {
    this.pagina.set(p);
    this.cargar();
  }

  toggleAutoRefresh(): void {
    if (this.autoRefresh()) {
      this.detenerAutoRefresh();
      this.autoRefresh.set(false);
    } else {
      this.autoRefresh.set(true);
      this.refreshInterval = setInterval(() => this.cargar(), this.INTERVALO_SEG * 1000);
    }
  }

  private detenerAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  badgeClase(estado: CabalgataProgresoResponse['estadoCalculado']): string {
    return ESTADO_CONFIG[estado]?.clase ?? 'bg-gray-100 text-gray-600';
  }

  badgeLabel(estado: CabalgataProgresoResponse['estadoCalculado']): string {
    return ESTADO_CONFIG[estado]?.label ?? estado;
  }
}