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
        <ion-title>{{ esEdicion() ? 'Editar Caballo' : 'Nuevo Caballo' }}</ion-title>
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
              placeholder="Ej: Tornado"
              maxlength="100">
            </ion-input>
          </ion-item>
          @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
            <p style="color: var(--ion-color-danger); font-size: 12px; padding: 4px 16px;">
              El nombre es obligatorio.
            </p>
          }

          <ion-item>
            <ion-label position="stacked">Raza *</ion-label>
            <ion-input
              formControlName="raza"
              placeholder="Ej: Criollo"
              maxlength="100">
            </ion-input>
          </ion-item>
          @if (form.get('raza')?.invalid && form.get('raza')?.touched) {
            <p style="color: var(--ion-color-danger); font-size: 12px; padding: 4px 16px;">
              La raza es obligatoria.
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
              {{ esEdicion() ? 'Guardar cambios' : 'Crear caballo' }}
            </ion-button>
          </div>
        </form>
      }
    </ion-content>
  `,
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
