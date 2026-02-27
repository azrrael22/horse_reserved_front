import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonIcon,
  IonSpinner,
  IonText,
  IonBackButton,
  IonButtons,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  eyeOutline,
  eyeOffOutline,
  lockClosedOutline,
  chevronBackOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';

function newPasswordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const newPwd = control.get('passwordNueva')?.value;
  const confirm = control.get('confirmarPassword')?.value;
  if (newPwd && confirm && newPwd !== confirm) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-change-password',
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
    IonIcon,
    IonSpinner,
    IonText,
    IonBackButton,
    IonButtons,
  ],
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastCtrl = inject(ToastController);

  readonly loading = signal(false);
  readonly showPasswords = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group(
    {
      passwordActual: ['', [Validators.required]],
      passwordNueva: ['', [Validators.required, Validators.minLength(8)]],
      confirmarPassword: ['', [Validators.required]],
    },
    { validators: newPasswordMatchValidator }
  );

  constructor() {
    addIcons({ eyeOutline, eyeOffOutline, lockClosedOutline, chevronBackOutline });
  }

  togglePasswords(): void {
    this.showPasswords.update((v) => !v);
  }

  onSubmit(): void {
    if (this.form.invalid || this.loading()) return;

    this.errorMessage.set('');
    this.successMessage.set('');
    this.loading.set(true);

    this.authService.changePassword(this.form.getRawValue()).subscribe({
      next: async () => {
        this.loading.set(false);
        this.form.reset();
        const toast = await this.toastCtrl.create({
          message: 'Contraseña actualizada correctamente.',
          duration: 3000,
          color: 'success',
          position: 'top',
        });
        await toast.present();
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 400 && err.error?.message) {
          this.errorMessage.set(err.error.message);
        } else if (err.status === 403) {
          this.errorMessage.set('No puedes cambiar la contraseña de una cuenta de Google.');
        } else {
          this.errorMessage.set('Ha ocurrido un error. Intenta de nuevo.');
        }
      },
    });
  }

  get f() {
    return this.form.controls;
  }
}
