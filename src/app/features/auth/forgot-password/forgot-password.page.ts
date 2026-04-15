import { Component, inject, signal } from '@angular/core';

import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { RecaptchaModule } from 'ng-recaptcha';
import {
  IonContent,
  IonButton,
  IonInput,
  IonIcon,
  IonSpinner,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { AppFooterComponent } from '../../../shared/components/app-footer/app-footer.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonButton,
    IonInput,
    IonIcon,
    IonSpinner,
    IonText,
    RecaptchaModule,
    AppFooterComponent,
  ],
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly sent = signal(false);
  readonly errorMessage = signal('');
  readonly captchaToken = signal<string | null>(null);
  readonly recaptchaSiteKey = environment.recaptchaSiteKey;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    addIcons({ mailOutline });
  }

  onCaptchaResolved(token: string | null): void {
    this.captchaToken.set(token);
  }

  onSubmit(): void {
    if (this.form.invalid || this.loading() || !this.captchaToken()) return;

    this.errorMessage.set('');
    this.loading.set(true);

    this.authService.forgotPassword({ ...this.form.getRawValue(), recaptchaToken: this.captchaToken()! }).subscribe({
      next: () => {
        this.loading.set(false);
        this.sent.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 400) {
          this.errorMessage.set('El correo ingresado no es válido.');
        } else {
          this.errorMessage.set('Ha ocurrido un error. Intenta de nuevo.');
        }
      },
    });
  }

  get emailCtrl() {
    return this.form.controls.email;
  }
}
