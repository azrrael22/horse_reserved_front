import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonCard, IonCardHeader, IonCardContent,
  IonItem, IonLabel, IonInput, IonButton, IonIcon, IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  eyeOutline, eyeOffOutline, lockClosedOutline, lockOpenOutline,
  alertCircleOutline, checkmarkCircleOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../../core/services/auth.service';

function passwordMatch(ctrl: AbstractControl): ValidationErrors | null {
  const nueva    = ctrl.get('passwordNueva');
  const confirmar = ctrl.get('confirmarPassword');
  return nueva?.value === confirmar?.value ? null : { mismatch: true };
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonCard, IonCardHeader, IonCardContent,
    IonItem, IonLabel, IonInput, IonButton, IonIcon, IonSpinner,
  ],
  templateUrl: './change-password.page.html',
})
export class ChangePasswordPage {
  private readonly fb    = inject(FormBuilder);
  private readonly auth  = inject(AuthService);
  private readonly toast = inject(ToastController);

  readonly loading  = signal(false);
  readonly error    = signal<string | null>(null);
  readonly success  = signal(false);
  readonly showActual   = signal(false);
  readonly showNueva    = signal(false);
  readonly showConfirm  = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      passwordActual:    ['', Validators.required],
      passwordNueva:     ['', [Validators.required, Validators.minLength(8)]],
      confirmarPassword: ['', Validators.required],
    },
    { validators: passwordMatch },
  );

  get actualCtrl()    { return this.form.controls.passwordActual; }
  get nuevaCtrl()     { return this.form.controls.passwordNueva; }
  get confirmarCtrl() { return this.form.controls.confirmarPassword; }

  get mismatch(): boolean {
    return this.form.hasError('mismatch') && this.confirmarCtrl.touched;
  }

  toggleShowActual()  { this.showActual.update(v => !v); }
  toggleShowNueva()   { this.showNueva.update(v => !v); }
  toggleShowConfirm() { this.showConfirm.update(v => !v); }

  constructor() {
    addIcons({
      eyeOutline, eyeOffOutline, lockClosedOutline, lockOpenOutline,
      alertCircleOutline, checkmarkCircleOutline,
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.loading()) return;
    this.error.set(null);
    this.loading.set(true);

    const loader = await this.auth.createLoader('Actualizando contraseña...');

    this.auth.changePassword(this.form.getRawValue()).subscribe({
      next: async () => {
        await loader.dismiss();
        this.loading.set(false);
        this.success.set(true);
        this.form.reset();
        const t = await this.toast.create({
          message: 'Contraseña actualizada correctamente.',
          duration: 3500,
          color: 'success',
          position: 'top',
          icon: 'checkmark-circle-outline',
        });
        await t.present();
      },
      error: async (err) => {
        await loader.dismiss();
        this.loading.set(false);
        const body = typeof err.error === 'string' ? err.error : (err.error?.message ?? '');
        const msg =
          err.status === 0   ? 'Sin conexión con el servidor.' :
          err.status === 401 ? (body || 'La contraseña actual es incorrecta.') :
          err.status === 403 ? 'No puedes cambiar la contraseña de una cuenta de Google.' :
          body || `Error ${err.status}. Intenta de nuevo.`;
        this.error.set(msg);
        await this.auth.showErrorToast(msg);
      },
    });
  }
}
