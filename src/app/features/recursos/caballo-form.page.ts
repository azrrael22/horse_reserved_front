import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonInput,
  IonToggle,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { pawOutline, ribbonOutline, chevronBackOutline } from 'ionicons/icons';
import { CaballoService } from '../../core/services/caballo.service';
import { CaballoRequest } from '../../core/models/recurso.models';

@Component({
  selector: 'app-caballo-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonInput,
    IonToggle,
    IonButtons,
    IonBackButton,
    IonSpinner,
    IonIcon,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/recursos" text=""></ion-back-button>
        </ion-buttons>
        <ion-title>{{ esEdicion() ? 'Editar Caballo' : 'Nuevo Caballo' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="form-bg">
      @if (cargandoDatos()) {
        <div class="flex justify-center py-8">
          <ion-spinner name="crescent"></ion-spinner>
        </div>
      } @else {
        <div class="mx-auto max-w-sm px-5 py-6">
          <form [formGroup]="form" (ngSubmit)="guardar()" novalidate>

            <div class="bg-surface rounded-2xl p-4 mb-5">
              <p class="text-xs font-bold text-tertiary uppercase tracking-widest mb-3">Datos del caballo</p>

              <div class="mb-3">
                <ion-input
                  fill="outline"
                  labelPlacement="floating"
                  label="Nombre *"
                  formControlName="nombre"
                  placeholder="Ej: Tornado"
                  maxlength="100"
                  [class.ion-invalid]="form.get('nombre')?.invalid && form.get('nombre')?.touched"
                  [class.ion-touched]="form.get('nombre')?.touched">
                  <ion-icon name="paw-outline" slot="start" color="medium"></ion-icon>
                </ion-input>
                @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
                  <p class="error-message" role="alert">El nombre es obligatorio.</p>
                }
              </div>

              <div class="mb-3">
                <ion-input
                  fill="outline"
                  labelPlacement="floating"
                  label="Raza *"
                  formControlName="raza"
                  placeholder="Ej: Criollo"
                  maxlength="100"
                  [class.ion-invalid]="form.get('raza')?.invalid && form.get('raza')?.touched"
                  [class.ion-touched]="form.get('raza')?.touched">
                  <ion-icon name="ribbon-outline" slot="start" color="medium"></ion-icon>
                </ion-input>
                @if (form.get('raza')?.invalid && form.get('raza')?.touched) {
                  <p class="error-message" role="alert">La raza es obligatoria.</p>
                }
              </div>

              <div class="flex items-center justify-between px-1 py-2 mt-1">
                <span class="text-sm font-medium text-gray-700">Estado activo</span>
                <ion-toggle formControlName="activo"></ion-toggle>
              </div>
            </div>

            @if (error()) {
              <div class="mb-4 rounded-lg bg-red-50 p-3" role="alert">
                <p class="text-sm text-red-600">{{ error() }}</p>
              </div>
            }

            <ion-button expand="block" type="submit" [disabled]="form.invalid || guardando()">
              @if (guardando()) {
                <ion-spinner name="crescent" slot="start" aria-hidden="true"></ion-spinner>
              }
              {{ guardando() ? 'Guardando...' : (esEdicion() ? 'Guardar cambios' : 'Crear caballo') }}
            </ion-button>

          </form>
        </div>
      }
    </ion-content>
  `,
  styles: [`
    ion-content.form-bg { --background: #f9f5ef; }
    ion-button[expand='block'] { --border-radius: 12px; height: 48px; font-weight: 600; }
    ion-button[expand='block']:not([fill='outline']) { --box-shadow: 0 4px 20px rgba(41,80,115,0.22); }
    .error-message { font-size: 0.75rem; color: var(--ion-color-danger); margin: 4px 0 0 4px; display: block; }
  `],
})
export class CaballoFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly caballoService = inject(CaballoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly esEdicion = signal(false);
  readonly cargandoDatos = signal(false);
  readonly guardando = signal(false);
  readonly error = signal('');

  private caballoId: number | null = null;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    raza: ['', [Validators.required, Validators.maxLength(100)]],
    activo: [true],
  });

  constructor() {
    addIcons({ pawOutline, ribbonOutline, chevronBackOutline });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'nuevo') {
      this.esEdicion.set(true);
      this.caballoId = Number(idParam);
      this.cargarCaballo(this.caballoId);
    }
  }

  private cargarCaballo(id: number): void {
    this.cargandoDatos.set(true);
    this.caballoService.obtener(id).subscribe({
      next: (c) => {
        this.form.patchValue({ nombre: c.nombre, raza: c.raza, activo: c.activo });
        this.cargandoDatos.set(false);
      },
      error: (err) => {
        this.cargandoDatos.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo cargar el caballo.');
      },
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.guardando.set(true);
    this.error.set('');

    const dto: CaballoRequest = {
      nombre: this.form.value.nombre!,
      raza: this.form.value.raza!,
      activo: this.form.value.activo ?? true,
    };

    const req$ = this.esEdicion()
      ? this.caballoService.actualizar(this.caballoId!, dto)
      : this.caballoService.crear(dto);

    req$.subscribe({
      next: () => {
        this.guardando.set(false);
        this.router.navigate(['/tabs/recursos']);
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo guardar el caballo.');
      },
    });
  }
}
