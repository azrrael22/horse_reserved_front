import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { CurrencyPipe, DatePipe } from '@angular/common';
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
import { addOutline, informationCircleOutline, trashOutline } from 'ionicons/icons';
import { ReservaService } from '../../core/services/reserva.service';
import { RutaService } from '../../core/services/ruta.service';
import { AuthService } from '../../core/services/auth.service';
import { CreateReservaRequest, TipoDocumentoReserva } from '../../core/models/reserva.models';
import { RutaResponse } from '../../core/models/ruta.models';
import { AppFooterComponent } from '../../shared/components/app-footer/app-footer.component';

@Component({
  selector: 'app-reserva-create',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
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
    IonModal,
    AppFooterComponent
],
  templateUrl: './reserva-create.page.html',
  styleUrls: ['./reserva-create.page.scss'],
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

  readonly minFecha = new Date().toISOString().split('T')[0];
  readonly maxFecha = `${new Date().getFullYear() + 5}-12-31`;

  onFechaChange(event: CustomEvent): void {
    const value = event.detail.value as string;
    if (value) {
      this.form.controls.fecha.setValue(value.split('T')[0]);
    }
  }

  readonly form = this.fb.nonNullable.group({
    rutaId: [0 as number, [Validators.required, Validators.min(1)]],
    fecha: ['', Validators.required],
    horaInicio: ['', [Validators.required, horaInicioValidator]],
    clienteId: [null as number | null],
    participantes: this.fb.array([this.createParticipanteGroup()]),
  });

  get participantes(): FormArray {
    return this.form.controls.participantes;
  }

  readonly rutaIdSignal = toSignal(this.form.controls.rutaId.valueChanges, {
    initialValue: this.form.controls.rutaId.value,
  });

  readonly participantesSignal = toSignal(this.form.controls.participantes.valueChanges, {
    initialValue: this.form.controls.participantes.value,
  });

  readonly rutaSeleccionada = computed<RutaResponse | undefined>(() =>
    this.rutas().find(r => r.id === this.rutaIdSignal())
  );

  readonly precioEstimado = computed<number | null>(() => {
    const ruta = this.rutaSeleccionada();
    const n = this.participantesSignal().length;
    return ruta && n > 0 ? ruta.precio * n : null;
  });

  constructor() {
    addIcons({ addOutline, informationCircleOutline, trashOutline });
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

    if (!this.esOperador() && this.authService.isLoggedIn()) {
      this.authService.getMe().subscribe({
        next: (perfil) => {
          const patch: Record<string, string> = {};
          if (perfil.primerNombre)   patch['primerNombre']   = perfil.primerNombre;
          if (perfil.primerApellido) patch['primerApellido'] = perfil.primerApellido;
          if (perfil.tipoDocumento)  patch['tipoDocumento']  = perfil.tipoDocumento;
          if (perfil.documento)      patch['documento']      = perfil.documento;
          (this.participantes.at(0) as FormGroup).patchValue(patch);
        },
      });
    }
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
        this.router.navigate(['/tabs/reservas', res.id]);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo crear la reserva.');
      },
    });
  }
}
