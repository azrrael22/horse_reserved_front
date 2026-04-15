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
  IonItem,
  IonLabel,
  IonToggle,
  IonButtons,
  IonBackButton,
  IonSpinner,
} from '@ionic/angular/standalone';
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
    IonItem,
    IonLabel,
    IonToggle,
    IonButtons,
    IonBackButton,
    IonSpinner,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/recursos"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ esEdicion() ? 'Editar Guía' : 'Nuevo Guía' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (cargandoDatos()) {
        <div style="text-align: center; padding: 24px;">
          <ion-spinner name="crescent"></ion-spinner>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="guardar()">
          <ion-item>
            <ion-label position="stacked">Nombre *</ion-label>
            <ion-input
              formControlName="nombre"
              placeholder="Ej: Carlos Pérez"
              maxlength="100">
            </ion-input>
          </ion-item>
          @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
            <p style="color: var(--ion-color-danger); font-size: 12px; padding: 4px 16px;">
              El nombre es obligatorio.
            </p>
          }

          <ion-item>
            <ion-label position="stacked">Teléfono *</ion-label>
            <ion-input
              formControlName="telefono"
              type="tel"
              placeholder="Ej: 3001234567"
              maxlength="100">
            </ion-input>
          </ion-item>
          @if (form.get('telefono')?.invalid && form.get('telefono')?.touched) {
            <p style="color: var(--ion-color-danger); font-size: 12px; padding: 4px 16px;">
              El teléfono es obligatorio.
            </p>
          }

          <ion-item>
            <ion-label position="stacked">Email *</ion-label>
            <ion-input
              formControlName="email"
              type="email"
              placeholder="Ej: guia@ejemplo.com"
              maxlength="100">
            </ion-input>
          </ion-item>
          @if (form.get('email')?.errors?.['required'] && form.get('email')?.touched) {
            <p style="color: var(--ion-color-danger); font-size: 12px; padding: 4px 16px;">
              El email es obligatorio.
            </p>
          }
          @if (form.get('email')?.errors?.['email'] && form.get('email')?.touched) {
            <p style="color: var(--ion-color-danger); font-size: 12px; padding: 4px 16px;">
              Ingresa un email válido.
            </p>
          }

          <ion-item>
            <ion-label>Activo</ion-label>
            <ion-toggle formControlName="activo" slot="end"></ion-toggle>
          </ion-item>

          @if (error()) {
            <p style="color: var(--ion-color-danger); padding: 8px 0;">{{ error() }}</p>
          }

          <div style="margin-top: 16px;">
            <ion-button
              expand="block"
              type="submit"
              [disabled]="form.invalid || guardando()">
              @if (guardando()) {
                <ion-spinner name="crescent" slot="start"></ion-spinner>
              }
              {{ esEdicion() ? 'Guardar cambios' : 'Crear guía' }}
            </ion-button>
          </div>
        </form>
      }
    </ion-content>
  `,
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
