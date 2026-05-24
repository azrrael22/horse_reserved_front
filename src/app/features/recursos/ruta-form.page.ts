import { Component, inject, signal, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons,
  IonBackButton, IonContent, IonButton, IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import { RutaService } from '../../core/services/ruta.service';
import { CreateRutaRequest, Dificultad } from '../../core/models/ruta.models';

@Component({
  selector: 'app-ruta-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons,
    IonBackButton, IonContent, IonButton, IonSpinner,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/recursos"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ modoEdicion() ? 'Editar ruta' : 'Nueva ruta' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="form-content">
      <div class="ion-padding">

        <!-- Error global -->
        @if (errorGlobal()) {
          <div class="rounded-lg bg-red-50 p-3 text-red-600 text-sm mb-4" role="alert">
            {{ errorGlobal() }}
          </div>
        }

        <!-- Loading inicial (solo en edición) -->
        @if (cargando()) {
          <div class="flex justify-center py-8">
            <ion-spinner name="crescent"></ion-spinner>
          </div>
        }

        @if (!cargando()) {
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">

            <!-- Nombre -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">
                Nombre <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                formControlName="nombre"
                maxlength="150"
                placeholder="Nombre de la ruta"
                class="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                [class.border-red-400]="invalido('nombre')"
                [class.border-gray-300]="!invalido('nombre')"
              />
              @if (invalido('nombre')) {
                <p class="text-xs text-red-500 mt-1">{{ errorDe('nombre') }}</p>
              }
            </div>

            <!-- Descripción -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">
                Descripción <span class="text-red-500">*</span>
              </label>
              <textarea
                formControlName="descripcion"
                rows="3"
                placeholder="Describe la ruta..."
                class="w-full rounded-lg border px-3 py-2.5 text-sm resize-none
                       focus:outline-none focus:ring-2 focus:ring-primary"
                [class.border-red-400]="invalido('descripcion')"
                [class.border-gray-300]="!invalido('descripcion')">
              </textarea>
              @if (invalido('descripcion')) {
                <p class="text-xs text-red-500 mt-1">{{ errorDe('descripcion') }}</p>
              }
            </div>

            <!-- Precio -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">
                Precio (COP) <span class="text-red-500">*</span>
              </label>
              <input
                type="number"
                formControlName="precio"
                min="1"
                placeholder="Ej: 75000"
                class="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                [class.border-red-400]="invalido('precio')"
                [class.border-gray-300]="!invalido('precio')"
              />
              @if (invalido('precio')) {
                <p class="text-xs text-red-500 mt-1">{{ errorDe('precio') }}</p>
              }
            </div>

            <!-- Dificultad -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">
                Dificultad <span class="text-red-500">*</span>
              </label>
              <select
                formControlName="dificultad"
                class="w-full rounded-lg border px-3 py-2.5 text-sm bg-white
                       focus:outline-none focus:ring-2 focus:ring-primary"
                [class.border-red-400]="invalido('dificultad')"
                [class.border-gray-300]="!invalido('dificultad')">
                <option value="">Seleccionar...</option>
                <option value="FACIL">Fácil</option>
                <option value="MEDIA">Media</option>
                <option value="DIFICIL">Difícil</option>
              </select>
              @if (invalido('dificultad')) {
                <p class="text-xs text-red-500 mt-1">{{ errorDe('dificultad') }}</p>
              }
            </div>

            <!-- Duración -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">
                Duración (minutos) <span class="text-red-500">*</span>
              </label>
              <input
                type="number"
                formControlName="duracionMinutos"
                min="1"
                placeholder="Ej: 90"
                class="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                [class.border-red-400]="invalido('duracionMinutos')"
                [class.border-gray-300]="!invalido('duracionMinutos')"
              />
              @if (invalido('duracionMinutos')) {
                <p class="text-xs text-red-500 mt-1">{{ errorDe('duracionMinutos') }}</p>
              }
            </div>

            <!-- URL Imagen (opcional) -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">
                URL de imagen <span class="text-gray-400 text-xs font-normal">(opcional)</span>
              </label>
              <input
                type="url"
                formControlName="urlImagen"
                maxlength="500"
                placeholder="https://..."
                class="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                [class.border-red-400]="invalido('urlImagen')"
                [class.border-gray-300]="!invalido('urlImagen')"
              />
              @if (invalido('urlImagen')) {
                <p class="text-xs text-red-500 mt-1">{{ errorDe('urlImagen') }}</p>
              }
            </div>

            <!-- Botón submit -->
            <ion-button
              expand="block"
              type="submit"
              class="mt-2"
              [disabled]="guardando()">
              @if (guardando()) {
                <ion-spinner name="crescent" slot="start"></ion-spinner>
              }
              {{ modoEdicion() ? 'Guardar cambios' : 'Crear ruta' }}
            </ion-button>

          </form>
        }

      </div>
    </ion-content>
  `,
  styles: [`
    ion-content.form-content { --background: #f9f5ef; }
  `],
})
export class RutaFormPage implements OnInit {
  private readonly fb          = inject(FormBuilder);
  private readonly route       = inject(ActivatedRoute);
  private readonly location    = inject(Location);
  private readonly rutaService = inject(RutaService);
  private readonly toastCtrl   = inject(ToastController);

  readonly modoEdicion = signal(false);
  readonly cargando    = signal(false);
  readonly guardando   = signal(false);
  readonly errorGlobal = signal('');

  private rutaId: number | null = null;

  readonly form: FormGroup = this.fb.group({
    nombre:          ['', [Validators.required, Validators.maxLength(150)]],
    descripcion:     ['', [Validators.required]],
    precio:          [null, [Validators.required, Validators.min(1)]],
    dificultad:      ['', [Validators.required]],
    duracionMinutos: [null, [Validators.required, Validators.min(1)]],
    urlImagen:       ['', [Validators.maxLength(500)]],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.rutaId = +idParam;
      this.modoEdicion.set(true);
      this.cargarRuta(this.rutaId);
    }
  }

  private cargarRuta(id: number): void {
    this.cargando.set(true);
    this.rutaService.obtenerAdmin(id).subscribe({
      next: (r) => {
        this.form.patchValue({
          nombre:          r.nombre,
          descripcion:     r.descripcion,
          precio:          r.precio,
          dificultad:      r.dificultad,
          duracionMinutos: r.duracionMinutos,
          urlImagen:       r.urlImagen ?? '',
        });
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.errorGlobal.set(err?.error?.message ?? 'No se pudo cargar la ruta.');
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorGlobal.set('');

    const payload: CreateRutaRequest = {
      nombre:          this.form.value.nombre.trim(),
      descripcion:     this.form.value.descripcion.trim(),
      precio:          +this.form.value.precio,
      dificultad:      this.form.value.dificultad as Dificultad,
      duracionMinutos: +this.form.value.duracionMinutos,
      urlImagen:       this.form.value.urlImagen?.trim() || null,
    };

    const accion$ = this.modoEdicion() && this.rutaId
      ? this.rutaService.actualizar(this.rutaId, payload)
      : this.rutaService.crear(payload);

    accion$.subscribe({
      next: async () => {
        this.guardando.set(false);
        await this.toast(
          this.modoEdicion() ? 'Ruta actualizada correctamente.' : 'Ruta creada correctamente.'
        );
        this.location.back();
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorGlobal.set(
          err?.error?.message ?? 'Ocurrió un error. Intenta de nuevo.'
        );
      },
    });
  }

  // ── Helpers de validación ─────────────────────────────────────────────────

  invalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  errorDe(campo: string): string {
    const c = this.form.get(campo);
    if (!c?.errors) return '';
    if (c.errors['required'])   return 'Este campo es obligatorio.';
    if (c.errors['maxlength'])  return `Máximo ${c.errors['maxlength'].requiredLength} caracteres.`;
    if (c.errors['min'])        return `El valor debe ser mayor a ${c.errors['min'].min - 1}.`;
    return 'Valor no válido.';
  }

  private async toast(msg: string, color: 'success' | 'danger' = 'success'): Promise<void> {
    const t = await this.toastCtrl.create({
      message: msg, duration: 2500, color, position: 'bottom',
    });
    await t.present();
  }
}