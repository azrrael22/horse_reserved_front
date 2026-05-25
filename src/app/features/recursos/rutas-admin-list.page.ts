import { Component, inject, signal, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonSpinner,
  IonIcon,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  createOutline,
  powerOutline,
  trashOutline,
  mapOutline,
  chevronBackOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { RutaService } from '../../core/services/ruta.service';
import { RutaAdminResponse } from '../../core/models/ruta.models';

type FiltroActiva = 'todas' | 'activas' | 'inactivas';

const DIFICULTAD_LABEL: Record<string, string> = {
  FACIL: 'Fácil',
  MEDIA: 'Media',
  DIFICIL: 'Difícil',
};

@Component({
  selector: 'app-rutas-admin-list',
  standalone: true,
  imports: [RouterLink, IonButton, IonSpinner, IonIcon, DecimalPipe,],
  template: `
    <div class="ion-padding">

      <!-- Cabecera + CTA -->
      <div class="flex items-end justify-between mb-5">
        <div>
          <p class="text-xs tracking-widest uppercase text-tertiary font-semibold mb-0.5">Gestión</p>
          <h2 class="section-title text-gray-800">Rutas</h2>
        </div>
        <ion-button [routerLink]="['/tabs/recursos/rutas/nueva']" size="small">
          <ion-icon name="add-outline" slot="start"></ion-icon>
          Nueva
        </ion-button>
      </div>

      <!-- Filtros -->
      <div class="flex gap-2 mb-4 flex-wrap">
        <!-- Búsqueda por nombre -->
        <input
          type="text"
          placeholder="Buscar por nombre..."
          class="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm
                 focus:outline-none focus:ring-2 focus:ring-primary"
          [value]="searchTerm()"
          (input)="onSearch($event)"
        />
        <!-- Filtro activa -->
        <select
          class="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white
                 focus:outline-none focus:ring-2 focus:ring-primary"
          [value]="filtroActiva()"
          (change)="onFiltroActiva($event)">
          <option value="todas">Todas</option>
          <option value="activas">Activas</option>
          <option value="inactivas">Inactivas</option>
        </select>
      </div>

      <!-- Estado: loading -->
      @if (loading()) {
        <div class="flex justify-center py-8">
          <ion-spinner name="crescent"></ion-spinner>
        </div>
      }

      <!-- Estado: error -->
      @if (error()) {
        <div class="rounded-lg bg-red-50 p-3 text-red-600 text-sm mb-4" role="alert">
          {{ error() }}
        </div>
      }

      <!-- Estado: vacío -->
      @if (!loading() && !error() && rutas().length === 0) {
        <div class="text-center py-12">
          <ion-icon name="map-outline" class="text-5xl text-secondary mb-3 block mx-auto"></ion-icon>
          <p class="text-sm text-muted">No hay rutas que mostrar.</p>
        </div>
      }

      <!-- Lista de rutas -->
      @for (r of rutas(); track r.id) {
        <div class="mb-3 rounded-xl overflow-hidden bg-surface shadow-sm">
          <div class="p-4 flex gap-3">

            <!-- Icono -->
            <div class="w-14 h-14 rounded-xl flex-shrink-0 bg-primary-light
                        flex items-center justify-center">
              <ion-icon name="map-outline" class="text-2xl text-primary"></ion-icon>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2 mb-1">
                <p class="font-bold text-gray-800 section-title truncate">{{ r.nombre }}</p>
                <span [class]="r.activa
                  ? 'inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-full px-2.5 py-0.5 flex-shrink-0'
                  : 'inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full px-2.5 py-0.5 flex-shrink-0'">
                  <span [class]="r.activa
                    ? 'w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0'
                    : 'w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0'">
                  </span>
                  {{ r.activa ? 'Activa' : 'Inactiva' }}
                </span>
              </div>

              <!-- Metadatos -->
              <div class="flex gap-3 text-xs text-muted mb-3">
                <span>{{ dificultadLabel(r.dificultad) }}</span>
                <span>·</span>
                <span>{{ r.duracionMinutos }} min</span>
                <span>·</span>
                <span>$ {{ r.precio | number:'1.0-0' }}</span>
              </div>

              <!-- Acciones -->
              <div class="flex gap-2 flex-wrap">
                <ion-button
                  size="small"
                  fill="outline"
                  [routerLink]="['/tabs/recursos/rutas', r.id, 'editar']">
                  <ion-icon name="create-outline" slot="start"></ion-icon>
                  Editar
                </ion-button>
                <ion-button
                  size="small"
                  fill="outline"
                  [color]="r.activa ? 'danger' : 'success'"
                  (click)="toggleActiva(r)">
                  <ion-icon name="power-outline" slot="start"></ion-icon>
                  {{ r.activa ? 'Desactivar' : 'Activar' }}
                </ion-button>
                <ion-button
                  size="small"
                  fill="outline"
                  color="danger"
                  (click)="confirmarEliminar(r)">
                  <ion-icon name="trash-outline" slot="start"></ion-icon>
                  Eliminar
                </ion-button>
              </div>
            </div>

          </div>
        </div>
      }

      <!-- Paginación -->
      @if (totalPages() > 1) {
        <div class="flex items-center justify-between mt-4 px-1">
          <ion-button
            size="small"
            fill="clear"
            [disabled]="pagina() === 0"
            (click)="irPagina(pagina() - 1)">
            <ion-icon name="chevron-back-outline" slot="icon-only"></ion-icon>
          </ion-button>
          <span class="text-sm text-muted">
            {{ pagina() + 1 }} / {{ totalPages() }}
          </span>
          <ion-button
            size="small"
            fill="clear"
            [disabled]="pagina() === totalPages() - 1"
            (click)="irPagina(pagina() + 1)">
            <ion-icon name="chevron-forward-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </div>
      }

    </div>
  `,
})
export class RutasAdminListPage implements OnInit {
  private readonly rutaService  = inject(RutaService);
  private readonly alertCtrl    = inject(AlertController);
  private readonly toastCtrl    = inject(ToastController);

  readonly loading     = signal(false);
  readonly error       = signal('');
  readonly rutas       = signal<RutaAdminResponse[]>([]);
  readonly pagina      = signal(0);
  readonly totalPages  = signal(0);
  readonly searchTerm  = signal('');
  readonly filtroActiva = signal<FiltroActiva>('todas');

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    addIcons({
      addOutline, createOutline, powerOutline,
      trashOutline, mapOutline,
      chevronBackOutline, chevronForwardOutline,
    });
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set('');

    const params = {
      page: this.pagina(),
      size: 10,
      ...(this.filtroActiva() !== 'todas' && {
        activa: this.filtroActiva() === 'activas',
      }),
      ...(this.searchTerm().trim() && { search: this.searchTerm().trim() }),
    };

    this.rutaService.listarAdmin(params).subscribe({
      next: (page) => {
        this.rutas.set(page.content);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'No se pudieron cargar las rutas.');
      },
    });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    // Debounce 400ms
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.pagina.set(0);
      this.cargar();
    }, 400);
  }

  onFiltroActiva(event: Event): void {
    this.filtroActiva.set((event.target as HTMLSelectElement).value as FiltroActiva);
    this.pagina.set(0);
    this.cargar();
  }

  irPagina(p: number): void {
    this.pagina.set(p);
    this.cargar();
  }

  toggleActiva(r: RutaAdminResponse): void {
    this.rutaService.toggleActiva(r.id, !r.activa).subscribe({
      next: (updated) => {
        this.rutas.update((list) =>
          list.map((x) => (x.id === updated.id ? updated : x))
        );
        this.toast(`Ruta ${updated.activa ? 'activada' : 'desactivada'} correctamente.`);
      },
      error: (err) => {
        this.toast(err?.error?.message ?? 'No se pudo cambiar el estado.', 'danger');
      },
    });
  }

  async confirmarEliminar(r: RutaAdminResponse): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar ruta',
      message: `¿Estás seguro de que deseas eliminar "${r.nombre}"? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          cssClass: 'text-red-600',
          handler: () => this.eliminar(r),
        },
      ],
    });
    await alert.present();
  }

  private eliminar(r: RutaAdminResponse): void {
    this.rutaService.eliminar(r.id).subscribe({
      next: () => {
        this.rutas.update((list) => list.filter((x) => x.id !== r.id));
        this.toast('Ruta eliminada correctamente.');
      },
      error: (err) => {
        this.toast(err?.error?.message ?? 'No se pudo eliminar la ruta.', 'danger');
      },
    });
  }

  dificultadLabel(d: string): string {
    return DIFICULTAD_LABEL[d] ?? d;
  }

  private async toast(msg: string, color: 'success' | 'danger' = 'success'): Promise<void> {
    const t = await this.toastCtrl.create({
      message: msg,
      duration: 2500,
      color,
      position: 'bottom',
    });
    await t.present();
  }
}