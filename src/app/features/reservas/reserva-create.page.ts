import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';
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
} from '@ionic/angular/standalone';
import { ReservaService } from '../../core/services/reserva.service';
import {
  CreateReservaRequest,
  TipoDocumentoReserva,
} from '../../core/models/reserva.models';

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
  ],
  template: `...`
})
export class ReservaCreatePage {
  private readonly fb = inject(FormBuilder);
  private readonly reservaService = inject(ReservaService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    salidaId: [0, [Validators.required, Validators.min(1)]],
    participantes: this.fb.array([this.createParticipanteGroup()]),
  });

  get participantes() {
  return this.form.controls.participantes;
}

  private createParticipanteGroup(): FormGroup<{
  primerNombre: FormControl<string>;
  primerApellido: FormControl<string>;
  tipoDocumento: FormControl<TipoDocumentoReserva>;
  documento: FormControl<string>;
  edad: FormControl<number>;
  cmAltura: FormControl<number>;
  kgPeso: FormControl<number>;
}> {
  return this.fb.nonNullable.group({
    primerNombre: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80)] }),
    primerApellido: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80)] }),
    tipoDocumento: new FormControl('CEDULA' as TipoDocumentoReserva, { nonNullable: true, validators: [Validators.required] }),
    documento: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(30)] }),
    edad: new FormControl(18, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(120)] }),
    cmAltura: new FormControl(170, { nonNullable: true, validators: [Validators.required, Validators.min(60), Validators.max(250)] }),
    kgPeso: new FormControl(70, { nonNullable: true, validators: [Validators.required, Validators.min(20), Validators.max(250)] }),
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
      salidaId: Number(raw.salidaId),
      participantes: raw.participantes.map((p) => ({
        ...p,
        edad: Number(p.edad),
        cmAltura: Number(p.cmAltura),
        kgPeso: Number(p.kgPeso),
      })),
      cantPersonas: raw.participantes.length, // <- sincronizado con backend
    };

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