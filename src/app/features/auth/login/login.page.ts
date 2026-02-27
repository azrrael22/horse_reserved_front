import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar,
  IonCard, IonCardHeader, IonCardContent,
  IonItem, IonLabel, IonInput, IonButton, IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  eyeOutline, eyeOffOutline, mailOutline, lockClosedOutline,
  alertCircleOutline, logoGoogle,
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { UiService } from '../../../core/services/ui.service';

@Component({
  selector: 'app-login',
  standalone: true,
  host: { class: 'ion-page' },
  imports: [
    ReactiveFormsModule, RouterLink,
    IonContent, IonHeader, IonToolbar,
    IonCard, IonCardHeader, IonCardContent,
    IonItem, IonLabel, IonInput, IonButton, IonIcon,
    IonSpinner,
  ],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private readonly fb    = inject(FormBuilder);
  private readonly auth  = inject(AuthService);
  private readonly ui    = inject(UiService);

  readonly loading     = signal(false);
  readonly error       = signal<string | null>(null);
  readonly showPass    = signal(false);

  readonly form = this.fb.nonNullable.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  get emailCtrl()    { return this.form.controls.email; }
  get passwordCtrl() { return this.form.controls.password; }

  constructor() {
    addIcons({ eyeOutline, eyeOffOutline, mailOutline, lockClosedOutline, alertCircleOutline, logoGoogle });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.loading()) return;
    this.error.set(null);
    this.loading.set(true);

    const loader = await this.ui.createLoader('Iniciando sesión...');

    this.auth.login(this.form.getRawValue()).subscribe({
      error: async (err) => {
        await loader.dismiss();
        this.loading.set(false);
        const msg = err.status === 401
          ? 'Correo o contraseña incorrectos.'
          : err.status === 403
            ? 'Tu cuenta está inactiva. Contacta al administrador.'
            : 'Ocurrió un error. Intenta de nuevo.';
        this.error.set(msg);
        await this.ui.showErrorToast(msg);
      },
      complete: () => { loader.dismiss(); this.loading.set(false); },
    });
  }

  loginWithGoogle(): void { this.auth.loginWithGoogle(); }
  togglePass(): void       { this.showPass.update(v => !v); }
}
