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
import { personCircleOutline, mailOutline, callOutline, chevronBackOutline } from 'ionicons/icons';
import { GuiaService } from '../../core/services/guia.service';
import { GuiaRequest } from '../../core/models/recurso.models';

@Component({
  selector: 'app-guia-form',
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
        <ion-title>{{ esEdicion() ? 'Editar Guía' : 'Nuevo Guía' }}</ion-title>
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
              <p class="text-xs font-bold text-tertiary uppercase tracking-widest mb-3">Datos del guía</p>

              <div class="mb-3">
                <ion-input
                  fill="outline"
                  labelPlacement="floating"
                  label="Nombre *"
                  formControlName="nombre"
                  placeholder="Ej: Carlos Pérez"
                  maxlength="100"
                  [class.ion-invalid]="form.get('nombre')?.invalid && form.get('nombre')?.touched"
                  [class.ion-touched]="form.get('nombre')?.touched">
                  <ion-icon name="person-circle-outline" slot="start" color="medium"></ion-icon>
                </ion-input>
                @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
                  <p class="error-message" role="alert">El nombre es obligatorio.</p>
                }
              </div>

              <div class="mb-3">
                <ion-input
                  fill="outline"
                  labelPlacement="floating"
                  label="Teléfono *"
                  formControlName="telefono"
                  type="tel"
                  inputmode="tel"
                  placeholder="Ej: 3001234567"
                  maxlength="100"
                  [class.ion-invalid]="form.get('telefono')?.invalid && form.get('telefono')?.touched"
                  [class.ion-touched]="form.get('telefono')?.touched">
                  <ion-icon name="call-outline" slot="start" color="medium"></ion-icon>
                </ion-input>
                @if (form.get('telefono')?.invalid && form.get('telefono')?.touched) {
                  <p class="error-message" role="alert">El teléfono es obligatorio.</p>
                }
              </div>

              <div class="mb-3">
                <ion-input
                  fill="outline"
                  labelPlacement="floating"
                  label="Correo electrónico *"
                  formControlName="email"
                  type="email"
                  inputmode="email"
                  placeholder="Ej: guia@ejemplo.com"
                  maxlength="100"
                  [class.ion-invalid]="form.get('email')?.invalid && form.get('email')?.touched"
                  [class.ion-touched]="form.get('email')?.touched">
                  <ion-icon name="mail-outline" slot="start" color="medium"></ion-icon>
                </ion-input>
                @if (form.get('email')?.errors?.['required'] && form.get('email')?.touched) {
                  <p class="error-message" role="alert">El correo es obligatorio.</p>
                }
                @if (form.get('email')?.errors?.['email'] && form.get('email')?.touched) {
                  <p class="error-message" role="alert">Ingresa un correo válido.</p>
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
              {{ guardando() ? 'Guardando...' : (esEdicion() ? 'Guardar cambios' : 'Crear guía') }}
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
export class GuiaFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly guiaService = inject(GuiaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly esEdicion = signal(false);
  readonly cargandoDatos = signal(false);
  readonly guardando = signal(false);
  readonly error = signal('');

  private guiaId: number | null = null;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    telefono: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    activo: [true],
  });

  constructor() {
    addIcons({ personCircleOutline, mailOutline, callOutline, chevronBackOutline });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'nuevo') {
      this.esEdicion.set(true);
      this.guiaId = Number(idParam);
      this.cargarGuia(this.guiaId);
    }
  }

  private cargarGuia(id: number): void {
    this.cargandoDatos.set(true);
    this.guiaService.obtener(id).subscribe({
      next: (g) => {
        this.form.patchValue({
          nombre: g.nombre,
          telefono: g.telefono,
          email: g.email,
          activo: g.activo,
        });
        this.cargandoDatos.set(false);
      },
      error: (err) => {
        this.cargandoDatos.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo cargar el guía.');
      },
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.guardando.set(true);
    this.error.set('');

    const dto: GuiaRequest = {
      nombre: this.form.value.nombre!,
      telefono: this.form.value.telefono!,
      email: this.form.value.email!,
      activo: this.form.value.activo ?? true,
    };

    const req$ = this.esEdicion()
      ? this.guiaService.actualizar(this.guiaId!, dto)
      : this.guiaService.crear(dto);

    req$.subscribe({
      next: () => {
        this.guardando.set(false);
        this.router.navigate(['/tabs/recursos']);
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo guardar el guía.');
      },
    });
  }
}
