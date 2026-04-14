import { Component, inject, signal, ViewChild } from '@angular/core';

import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { RecaptchaModule, RecaptchaComponent } from 'ng-recaptcha';
import {
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
  IonIcon,
  IonSpinner,
  IonText,
  IonBackButton,
  IonButtons,
  IonModal,
  IonCheckbox,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  eyeOutline,
  eyeOffOutline,
  personOutline,
  cardOutline,
  mailOutline,
  lockClosedOutline,
  callOutline,
  chevronBackOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { AppFooterComponent } from '../../../shared/components/app-footer/app-footer.component';
import {
  TipoDocumento,
  TIPO_DOCUMENTO_LABELS,
} from '../../../core/models/auth.models';
import { environment } from '../../../../environments/environment';

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value || '';
  const errors: ValidationErrors = {};
  if (value.length > 0 && value.length < 12) errors['minlength'] = { requiredLength: 12, actualLength: value.length };
  if (value.length >= 12 && !/[A-Z]/.test(value)) errors['requiresUppercase'] = true;
  if (value.length >= 12 && !/[0-9]/.test(value)) errors['requiresNumber'] = true;
  if (value.length >= 12 && !/[^A-Za-z0-9]/.test(value)) errors['requiresSpecial'] = true;
  return Object.keys(errors).length ? errors : null;
}

function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmarPassword')?.value;
  if (password && confirm && password !== confirm) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
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
    IonIcon,
    IonSpinner,
    IonText,
    IonBackButton,
    IonButtons,
    IonModal,
    IonCheckbox,
    RecaptchaModule,
    AppFooterComponent
],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  @ViewChild('captcha') captchaRef!: RecaptchaComponent;

  readonly loading = signal(false);
  readonly showPassword = signal(false);
  readonly showPolicyModal = signal(false);
  readonly errorMessage = signal('');
  readonly captchaToken = signal<string | null>(null);
  readonly recaptchaSiteKey = environment.recaptchaSiteKey;

  readonly tipoDocumentoOptions = Object.values(TipoDocumento).map((v) => ({
    value: v,
    label: TIPO_DOCUMENTO_LABELS[v],
  }));

  readonly form = this.fb.nonNullable.group(
    {
      primerNombre: ['', [Validators.required, Validators.maxLength(100)]],
      primerApellido: ['', [Validators.required, Validators.maxLength(100)]],
      tipoDocumento: [TipoDocumento.CEDULA, [Validators.required]],
      documento: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
      password: ['', [Validators.required, passwordStrengthValidator]],
      confirmarPassword: ['', [Validators.required]],
      telefono: ['', [Validators.maxLength(20)]],
      habeasDataConsent: [false, [Validators.requiredTrue]],
    },
    { validators: passwordMatchValidator }
  );

  constructor() {
    addIcons({
      eyeOutline,
      eyeOffOutline,
      personOutline,
      cardOutline,
      mailOutline,
      lockClosedOutline,
      callOutline,
      chevronBackOutline,
    });
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onCaptchaResolved(token: string | null): void {
    this.captchaToken.set(token);
  }

  onSubmit(): void {
    if (this.form.invalid || this.loading() || !this.captchaToken()) return;

    this.errorMessage.set('');
    this.loading.set(true);

    const { confirmarPassword, ...registerData } = this.form.getRawValue();

    this.authService.register({ ...registerData, recaptchaToken: this.captchaToken()! }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/tabs/inicio']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.captchaRef?.reset();
        this.captchaToken.set(null);
        if (err.status === 409) {
          this.errorMessage.set('Ya existe una cuenta con ese correo electrónico.');
        } else if (err.status === 400 && err.error?.message) {
          this.errorMessage.set(err.error.message);
        } else {
          this.errorMessage.set('Ha ocurrido un error. Intenta de nuevo.');
        }
      },
    });
  }

  get f() {
    return this.form.controls;
  }

  hasError(field: keyof typeof this.form.controls, error: string): boolean {
    const ctrl = this.form.controls[field];
    return ctrl.touched && ctrl.hasError(error);
  }
}
