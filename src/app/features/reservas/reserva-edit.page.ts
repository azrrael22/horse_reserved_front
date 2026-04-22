import { Component, inject, signal, OnInit } from '@angular/core';

import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

function horaInicioValidator(control: AbstractControl): ValidationErrors | null {
  const val = control.value as string;
  if (!val) return null;
  const [h, m] = val.split(':').map(Number);
  const total = h * 60 + m;
  if (total < 8 * 60 + 30 || total > 14 * 60 + 30) return { horaFueraRango: true };
  return null;
}

function documentoFormatoValidator(control: AbstractControl): ValidationErrors | null {
  const tipo = control.get('tipoDocumento')?.value as string;
  const doc = control.get('documento')?.value as string;
  if (!tipo || !doc) return null;
  if (tipo === 'CEDULA' || tipo === 'TARJETA_IDENTIDAD') {
    if (!/^\d+$/.test(doc)) return { documentoFormato: 'Solo se permiten números' };
  } else if (tipo === 'PASAPORTE') {
    if (!/^[a-zA-Z0-9]+$/.test(doc)) return { documentoFormato: 'Solo se permiten letras y números' };
  }
  return null;
}
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
  IonMenuButton,
  IonSpinner,
  IonIcon,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline } from 'ionicons/icons';
import { todayInColombia, addDays } from '../../core/utils/date.utils';
import { ReservaService } from '../../core/services/reserva.service';
import { RutaService } from '../../core/services/ruta.service';
import { UpdateReservaRequest, TipoDocumentoReserva, ReservaResponse } from '../../core/models/reserva.models';
import { RutaResponse } from '../../core/models/ruta.models';

@Component({
  selector: 'app-reserva-edit',
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
    IonSelect,
    IonSelectOption,
    IonButtons,
    IonBackButton,
    IonMenuButton,
    IonSpinner,
    IonIcon,
    IonDatetime,
    IonDatetimeButton,
    IonModal
],
  templateUrl: './reserva-edit.page.html',
  styleUrls: ['./reserva-edit.page.scss'],
})
export class ReservaEditPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly reservaService = inject(ReservaService);
  private readonly rutaService = inject(RutaService);

  readonly loading = signal(false);
  readonly loadingData = signal(true);
  readonly error = signal('');
  readonly rutas = signal<RutaResponse[]>([]);
  readonly fechaIso = signal('');

  readonly minFecha = signal(addDays(todayInColombia(), 1));
  readonly maxFecha = `${parseInt(todayInColombia().split('-')[0]) + 5}-12-31`;

  reservaId!: number;
  form!: FormGroup;

  readonly horasDisponibles: string[] = [
    '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
    '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  ];

  seleccionarHora(hora: string): void {
    this.form.controls['horaInicio'].setValue(hora);
    this.form.controls['horaInicio'].markAsTouched();
  }

  constructor() {
    addIcons({ addOutline, trashOutline });
  }

  get participantes(): FormArray {
    return this.form.controls['participantes'] as FormArray;
  }

  ngOnInit(): void {
    this.reservaId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.reservaId) {
      this.error.set('ID inválido');
      this.loadingData.set(false);
      return;
    }

    // Cargar rutas y reserva en paralelo
    Promise.all([
      this.rutaService.listarActivas().toPromise(),
      this.reservaService.obtenerReservaPorId(this.reservaId).toPromise(),
    ])
      .then(([rutas, reserva]) => {
        this.rutas.set(rutas ?? []);
        if (reserva) this.buildForm(reserva);
        this.loadingData.set(false);
      })
      .catch((err) => {
        this.error.set(err?.error?.message ?? 'No se pudo cargar la información.');
        this.loadingData.set(false);
      });
  }

  onFechaChange(event: CustomEvent): void {
    const value = event.detail.value as string;
    if (value) {
      const date = value.split('T')[0];
      this.form.controls['fecha'].setValue(date);
      this.fechaIso.set(date + 'T00:00:00');
    }
  }

  private buildForm(reserva: ReservaResponse): void {
    const tomorrow = addDays(todayInColombia(), 1);
    this.minFecha.set(reserva.fechaProgramada < tomorrow ? reserva.fechaProgramada : tomorrow);
    this.fechaIso.set(reserva.fechaProgramada + 'T00:00:00');
    this.form = this.fb.nonNullable.group({
      rutaId: [reserva.rutaId, [Validators.required, Validators.min(1)]],
      fecha: [reserva.fechaProgramada, Validators.required],
      horaInicio: [reserva.tiempoInicio.slice(0, 5), [Validators.required, horaInicioValidator]],
      participantes: this.fb.array(
        reserva.participantes.map((p) => this.createParticipanteGroup(p))
      ),
    });
  }

  private createParticipanteGroup(defaults?: {
    primerNombre: string;
    primerApellido: string;
    tipoDocumento: string;
    documento: string;
    edad: number;
    cmAltura: number;
    kgPeso: any;
  }): FormGroup {
    return this.fb.nonNullable.group({
      primerNombre: new FormControl(defaults?.primerNombre ?? '', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      primerApellido: new FormControl(defaults?.primerApellido ?? '', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      tipoDocumento: new FormControl(
        (defaults?.tipoDocumento ?? 'CEDULA') as TipoDocumentoReserva,
        { nonNullable: true, validators: [Validators.required] }
      ),
      documento: new FormControl(defaults?.documento ?? '', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(50)],
      }),
      edad: new FormControl(defaults?.edad ?? 18, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1), Validators.max(119)],
      }),
      cmAltura: new FormControl(defaults?.cmAltura ?? 170, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1)],
      }),
      kgPeso: new FormControl(defaults?.kgPeso ?? 70, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0.01)],
      }),
    }, { validators: [documentoFormatoValidator] });
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

    const payload: UpdateReservaRequest = {
      rutaId: Number(raw['rutaId']),
      fecha: raw['fecha'],
      horaInicio: raw['horaInicio'],
      cantPersonas: raw['participantes'].length,
      participantes: raw['participantes'].map((p: any) => ({
        primerNombre: p.primerNombre,
        primerApellido: p.primerApellido,
        tipoDocumento: p.tipoDocumento as TipoDocumentoReserva,
        documento: p.documento,
        edad: Number(p.edad),
        cmAltura: Number(p.cmAltura),
        kgPeso: Number(p.kgPeso),
      })),
    };

    this.loading.set(true);
    this.error.set('');

    this.reservaService.actualizarReserva(this.reservaId, payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/tabs/reservas', this.reservaId]);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo actualizar la reserva.');
      },
    });
  }
}
