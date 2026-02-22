import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder, Validators, ReactiveFormsModule,
  AbstractControl, ValidationErrors,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar,
  IonCard, IonCardHeader, IonCardContent,
  IonItem, IonLabel, IonInput, IonButton, IonIcon,
  IonSpinner, IonSelect, IonSelectOption, IonGrid, IonRow, IonCol,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  eyeOutline, eyeOffOutline, personOutline, cardOutline,
  callOutline, mailOutline, lockClosedOutline, alertCircleOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../../core/services/auth.service';
import { TipoDocumento } from '../../../../core/models/auth.models';

function passwordMatch(ctrl: AbstractControl): ValidationErrors | null {
  const p = ctrl.get('password');
  const c = ctrl.get('confirmPassword');
  if (!p || !c) return null;
  return p.value === c.value ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    IonContent, IonHeader, IonToolbar,
    IonCard, IonCardHeader, IonCardContent,
    IonItem, IonLabel, IonInput, IonButton, IonIcon,
    IonSpinner, IonSelect, IonSelectOption, IonGrid, IonRow, IonCol,
  ],
  templateUrl: './register.page.html',
})
export class RegisterPage {
  private readonly fb   = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly loading     = signal(false);
  readonly error       = signal<string | null>(null);
  readonly showPass    = signal(false);
  readonly showConfirm = signal(false);

  readonly tiposDoc: { value: TipoDocumento; label: string }[] = [
    { value: 'cedula',           label: 'Cédula de Ciudadanía' },
    { value: 'pasaporte',        label: 'Pasaporte' },
    { value: 'tarjeta_identidad', label: 'Tarjeta de Identidad' },
  ];

  readonly form = this.fb.nonNullable.group(
    {
      primerNombre:    ['', [Validators.required, Validators.maxLength(100)]],
      primerApellido:  ['', [Validators.required, Validators.maxLength(100)]],
      tipoDocumento:   ['cedula' as TipoDocumento, Validators.required],
      documento:       ['', [Validators.required, Validators.maxLength(50)]],
      telefono:        ['', Validators.maxLength(20)],
      email:           ['', [Validators.required, Validators.email]],
      password:        ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatch },
  );

  get f()              { return this.form.controls; }
  get passMismatch()   { return this.form.errors?.['mismatch'] && this.f.confirmPassword.touched; }

  constructor() {
    addIcons({
      eyeOutline, eyeOffOutline, personOutline, cardOutline,
      callOutline, mailOutline, lockClosedOutline, alertCircleOutline,
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.loading()) return;
    this.error.set(null);
    this.loading.set(true);

    const loader = await this.auth.createLoader('Creando cuenta...');
    const { confirmPassword, ...values } = this.form.getRawValue();

    this.auth.register(values).subscribe({
      error: async (err) => {
        await loader.dismiss();
        this.loading.set(false);
        const msg = err.status === 409
          ? 'Este correo ya está registrado.'
          : err.status === 400
            ? 'Por favor revisa los datos ingresados.'
            : 'Ocurrió un error. Intenta de nuevo.';
        this.error.set(msg);
        await this.auth.showErrorToast(msg);
      },
      complete: () => loader.dismiss(),
    });
  }

  loginWithGoogle(): void { this.auth.loginWithGoogle(); }
}
