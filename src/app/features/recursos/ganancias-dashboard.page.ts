import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonButton,
  SegmentCustomEvent,
} from '@ionic/angular/standalone';
import ApexCharts from 'apexcharts';
import { forkJoin } from 'rxjs';
import { AdminStatsService } from '../../core/services/admin-stats.service';
import {
  MetricasGananciasResponse,
  MetricasPagosResponse,
  RangoMetrica,
} from '../../core/models/admin-stats.models';

@Component({
  selector: 'app-ganancias-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    IonSpinner,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonButton,
  ],
  template: `
    <!-- Selector de rango -->
    <div class="px-4 pt-3 pb-2">
      <ion-segment [value]="rango()" (ionChange)="onRangoChange($event)">
        <ion-segment-button value="DIARIO">
          <ion-label>Diario</ion-label>
        </ion-segment-button>
        <ion-segment-button value="SEMANAL">
          <ion-label>Semanal</ion-label>
        </ion-segment-button>
        <ion-segment-button value="MENSUAL">
          <ion-label>Mensual</ion-label>
        </ion-segment-button>
        <ion-segment-button value="ANUAL">
          <ion-label>Anual</ion-label>
        </ion-segment-button>
      </ion-segment>
    </div>

    <!-- Rango de fechas -->
    <div class="px-4 pb-3 flex gap-2 items-end">
      <div class="flex-1">
        <label class="block text-xs text-gray-500 mb-1">Desde</label>
        <input
          type="date"
          [(ngModel)]="desde"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
        />
      </div>
      <div class="flex-1">
        <label class="block text-xs text-gray-500 mb-1">Hasta</label>
        <input
          type="date"
          [(ngModel)]="hasta"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
        />
      </div>
      <ion-button
        (click)="cargar()"
        [disabled]="cargando()"
        fill="solid"
        size="small"
        style="--border-radius: 8px; height: 38px;"
      >
        Aplicar
      </ion-button>
    </div>

    <!-- Loading -->
    @if (cargando()) {
      <div class="flex justify-center py-12">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
      </div>
    }

    <!-- Error -->
    @if (error() && !cargando()) {
      <div class="mx-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
        {{ error() }}
      </div>
    }

    <!-- Contenido principal -->
    @if (!cargando() && !error() && metricas()) {
      <!-- KPI Cards -->
      <div class="px-4 grid grid-cols-2 gap-3 pb-3">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p class="text-xs text-gray-500 mb-1">Ingresos brutos</p>
          <p class="text-base font-bold text-green-600 truncate">
            {{ metricas()!.ingresosBrutos | currency:'COP':'symbol':'1.0-0':'es-CO' }}
          </p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p class="text-xs text-gray-500 mb-1">Reembolsos</p>
          <p class="text-base font-bold text-red-500 truncate">
            {{ metricas()!.totalReembolsos | currency:'COP':'symbol':'1.0-0':'es-CO' }}
          </p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p class="text-xs text-gray-500 mb-1">Ingresos netos</p>
          <p class="text-base font-bold text-blue-600 truncate">
            {{ metricas()!.ingresosNetos | currency:'COP':'symbol':'1.0-0':'es-CO' }}
          </p>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p class="text-xs text-gray-500 mb-1">Ticket promedio</p>
          <p class="text-base font-bold text-gray-700 truncate">
            {{ metricas()!.ticketPromedio | currency:'COP':'symbol':'1.0-0':'es-CO' }}
          </p>
          <p class="text-xs text-gray-400 mt-1">
            {{ metricas()!.cantidadPagosRealizados }} pagos realizados
          </p>
        </div>
      </div>

      <!-- Gráfico -->
      @if (seriesDatos().length > 0) {
        <div class="mx-4 bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4">
          <p class="text-sm font-semibold text-gray-700 mb-2">Ganancias por período</p>
          <div id="gananciaChart" style="min-height: 260px;"></div>
        </div>
      } @else {
        <div
          class="mx-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400 mb-4"
        >
          Sin datos para el rango seleccionado
        </div>
      }
    }
  `,
})
export class GananciasDashboardPage implements OnInit, OnDestroy {
  private readonly adminStatsService = inject(AdminStatsService);
  private chart: ApexCharts | null = null;

  readonly rango = signal<RangoMetrica>('MENSUAL');
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly metricas = signal<MetricasPagosResponse | null>(null);
  readonly seriesDatos = signal<number[]>([]);
  readonly categorias = signal<string[]>([]);

  desde = '';
  hasta = '';

  readonly formatCOP = (val: number): string =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);

  ngOnInit(): void {
    this.setDefaultDates('MENSUAL');
    this.cargar();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.chart = null;
  }

  onRangoChange(event: SegmentCustomEvent): void {
    const nuevoRango = event.detail.value as RangoMetrica;
    this.rango.set(nuevoRango);
    this.setDefaultDates(nuevoRango);
    this.cargar();
  }

  cargar(): void {
    if (!this.desde || !this.hasta) return;

    this.cargando.set(true);
    this.error.set(null);

    forkJoin({
      metricas: this.adminStatsService.getMetricasPagos(this.desde, this.hasta),
      ganancias: this.adminStatsService.getGanancias(this.rango(), this.desde, this.hasta),
    }).subscribe({
      next: ({ metricas, ganancias }: { metricas: MetricasPagosResponse; ganancias: MetricasGananciasResponse }) => {
        this.metricas.set(metricas);
        this.seriesDatos.set(ganancias.datos.map(d => Number(d.ganancias)));
        this.categorias.set(ganancias.datos.map(d => d.label));
        this.cargando.set(false);
        if (ganancias.datos.length > 0) {
          setTimeout(() => this.renderChart(), 0);
        }
      },
      error: () => {
        this.error.set('No se pudieron cargar las métricas. Intenta de nuevo.');
        this.cargando.set(false);
      },
    });
  }

  private renderChart(): void {
    const el = document.getElementById('gananciaChart');
    if (!el) return;

    this.chart?.destroy();
    this.chart = null;

    this.chart = new ApexCharts(el, {
      chart: {
        type: 'bar',
        height: 260,
        toolbar: { show: false },
        fontFamily: 'inherit',
        animations: { enabled: true },
      },
      series: [{ name: 'Ganancias (COP)', data: this.seriesDatos() }],
      xaxis: {
        categories: this.categorias(),
        labels: { rotate: -30, style: { fontSize: '10px' } },
      },
      yaxis: { labels: { formatter: this.formatCOP } },
      plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
      dataLabels: { enabled: false },
      colors: ['#10b981'],
      tooltip: { y: { formatter: this.formatCOP } },
      grid: { borderColor: '#f3f4f6' },
    });

    this.chart.render();
  }

  private setDefaultDates(rango: RangoMetrica): void {
    const hoy = new Date();
    this.hasta = hoy.toISOString().split('T')[0];
    const desde = new Date(hoy);

    switch (rango) {
      case 'DIARIO':
        desde.setDate(desde.getDate() - 29);
        break;
      case 'SEMANAL':
        desde.setDate(desde.getDate() - 83);
        break;
      case 'ANUAL':
        desde.setFullYear(desde.getFullYear() - 4);
        desde.setMonth(0);
        desde.setDate(1);
        break;
      default:
        desde.setMonth(desde.getMonth() - 5);
        desde.setDate(1);
    }

    this.desde = desde.toISOString().split('T')[0];
  }
}
