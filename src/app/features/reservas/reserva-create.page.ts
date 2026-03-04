import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline } from 'ionicons/icons';
import { ReservaService } from '../../core/services/reserva.service';
import { RutaService } from '../../core/services/ruta.service';
import { AuthService } from '../../core/services/auth.service';
import { CreateReservaRequest, TipoDocumentoReserva } from '../../core/models/reserva.models';
import { RutaResponse } from '../../core/models/ruta.models';

@Component({
  selector: 'app-reserva-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonButtons,
    IonBackButton,
    IonSpinner,
    IonIcon,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/reservas"></ion-back-button>
        </ion-buttons>
        <ion-title>Nueva reserva</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">

      <div *ngIf="loadingRutas()" class="flex justify-center py-8">
        <ion-spinner></ion-spinner>
      </div>

      <form *ngIf="!loadingRutas()" [formGroup]="form" (ngSubmit)="onSubmit()">

        <!-- Datos de la salida -->
        <div class="mb-6">
          <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Salida</p>

          <ion-item>
            <ion-label position="floating">Ruta *</ion-label>
            <ion-select formControlName="rutaId" placeholder="Selecciona una ruta">
              <ion-select-option *ngFor="let r of rutas()" [value]="r.id">
                {{ r.nombre }}
              </ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item class="mt-2">
            <ion-label position="floating">Fecha *</ion-label>
            <ion-input type="date" formControlName="fecha"></ion-input>
          </ion-item>

          <ion-item class="mt-2">
            <ion-label position="floating">Hora de inicio *</ion-label>
            <ion-input type="time" formControlName="horaInicio"></ion-input>
          </ion-item>

          <!-- Campo clienteId solo para OPERADOR -->
          <ion-item *ngIf="esOperador()" class="mt-2">
            <ion-label position="floating">ID del cliente (opcional)</ion-label>
            <ion-input type="number" formControlName="clienteId"
              placeholder="Vacío = reserva de invitado"></ion-input>
          </ion-item>
        </div>

        <!-- Participantes -->
        <div class="mb-4">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Participantes ({{ participantes.length }})
            </p>
            <ion-button size="small" fill="outline" (click)="addParticipante()">
              <ion-icon name="add-outline" slot="start"></ion-icon>
              Agregar
            </ion-button>
          </div>

          <div formArrayName="participantes">
            <div
              *ngFor="let p of participantes.controls; let i = index"
              [formGroupName]="i"
              class="mb-4 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
            >
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm font-medium text-gray-700">Participante {{ i + 1 }}</p>
                <ion-button
                  *ngIf="participantes.length > 1"
                  size="small"
                  fill="clear"
                  color="danger"
                  (click)="removeParticipante(i)"
                >
                  <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
                </ion-button>
              </div>

              <ion-item>
                <ion-label position="floating">Primer nombre *</ion-label>
                <ion-input formControlName="primerNombre"></ion-input>
              </ion-item>
              <ion-item>
                <ion-label position="floating">Primer apellido *</ion-label>
                <ion-input formControlName="primerApellido"></ion-input>
              </ion-item>
              <ion-item>
                <ion-label position="floating">Tipo de documento *</ion-label>
                <ion-select formControlName="tipoDocumento">
                  <ion-select-option value="CEDULA">Cédula de Ciudadanía</ion-select-option>
                  <ion-select-option value="PASAPORTE">Pasaporte</ion-select-option>
                  <ion-select-option value="TARJETA_IDENTIDAD">Tarjeta de Identidad</ion-select-option>
                </ion-select>
              </ion-item>
              <ion-item>
                <ion-label position="floating">Número de documento *</ion-label>
                <ion-input formControlName="documento"></ion-input>
              </ion-item>
              <ion-item>
                <ion-label position="floating">Edad *</ion-label>
                <ion-input type="number" formControlName="edad"></ion-input>
              </ion-item>
              <ion-item>
                <ion-label position="floating">Altura (cm) *</ion-label>
                <ion-input type="number" formControlName="cmAltura"></ion-input>
              </ion-item>
              <ion-item>
                <ion-label position="floating">Peso (kg) *</ion-label>
                <ion-input type="number" formControlName="kgPeso"></ion-input>
              </ion-item>
            </div>
          </div>
        </div>

        <div *ngIf="error()" class="rounded-lg bg-red-50 p-3 text-red-600 text-sm mb-4">
          {{ error() }}
        </div>

        <ion-button
          type="submit"
          expand="block"
          [disabled]="form.invalid || loading()"
        >
          <ion-spinner *ngIf="loading()" slot="start" name="crescent"></ion-spinner>
          {{ loading() ? 'Creando...' : 'Crear reserva' }}
        </ion-button>

      </form>
    </ion-content>
  `,
})
export class ReservaCreatePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly reservaService = inject(ReservaService);
  private readonly rutaService = inject(RutaService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly loadingRutas = signal(false);
  readonly error = signal('');
  readonly rutas = signal<RutaResponse[]>([]);

  readonly esOperador = () => this.authService.session()?.role === 'OPERADOR';

  readonly form = this.fb.nonNullable.group({
    rutaId: [0 as number, [Validators.required, Validators.min(1)]],
    fecha: ['', Validators.required],
    horaInicio: ['', Validators.required],
    clienteId: [null as number | null],
    participantes: this.fb.array([this.createParticipanteGroup()]),
  });

  get participantes(): FormArray {
    return this.form.controls.participantes;
  }

  constructor() {
    addIcons({ addOutline, trashOutline });
  }

  ngOnInit(): void {
    this.loadingRutas.set(true);
    this.rutaService.listarActivas().subscribe({
      next: (data) => {
        this.rutas.set(data);
        this.loadingRutas.set(false);
        // Pre-seleccionar ruta si viene como query param (?rutaId=X)
        const rutaIdParam = this.route.snapshot.queryParamMap.get('rutaId');
        if (rutaIdParam) {
          this.form.patchValue({ rutaId: Number(rutaIdParam) });
        }
      },
      error: () => {
        this.loadingRutas.set(false);
        this.error.set('No se pudieron cargar las rutas disponibles.');
      },
    });
  }

  private createParticipanteGroup(): FormGroup {
    return this.fb.nonNullable.group({
      primerNombre: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      primerApellido: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      tipoDocumento: new FormControl('CEDULA' as TipoDocumentoReserva, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      documento: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(50)],
      }),
      edad: new FormControl(18, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1), Validators.max(119)],
      }),
      cmAltura: new FormControl(170, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1)],
      }),
      kgPeso: new FormControl(70, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0.01)],
      }),
    });
  }

  addParticipante(): void {
    this.participantes.push(this.createParticipanteGroup());
  }

  removeParticipante(index: number): void {
    if (this.participantes.length <= 1) return;
    this.participantes.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.invalid || this.loading()) return;

    const raw = this.form.getRawValue();

    const payload: CreateReservaRequest = {
      rutaId: Number(raw.rutaId),
      fecha: raw.fecha,
      horaInicio: raw.horaInicio,
      cantPersonas: raw.participantes.length,
      participantes: raw.participantes.map((p: any) => ({
        primerNombre: p.primerNombre,
        primerApellido: p.primerApellido,
        tipoDocumento: p.tipoDocumento as TipoDocumentoReserva,
        documento: p.documento,
        edad: Number(p.edad),
        cmAltura: Number(p.cmAltura),
        kgPeso: Number(p.kgPeso),
      })),
    };

    if (this.esOperador() && raw.clienteId) {
      payload.clienteId = Number(raw.clienteId);
    }

    this.loading.set(true);
    this.error.set('');

    this.reservaService.crearReserva(payload).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.router.navigate(['/reservas', res.id]);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo crear la reserva.');
      },
    });
  }
}
