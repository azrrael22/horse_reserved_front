import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
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
import { AuthService } from '../../../../core/services/auth.service';
import { UserRole } from '../../../../core/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    IonContent, IonHeader, IonToolbar,
    IonCard, IonCardHeader, IonCardContent,
    IonItem, IonLabel, IonInput, IonButton, IonIcon,
    IonSpinner,
  ],
  templateUrl: './login.page.html',
})
export class LoginPage implements OnInit {
  private readonly fb    = inject(FormBuilder);
  private readonly auth  = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

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

  ngOnInit(): void {
    // El backend redirige a /auth/login?token=...&role=...&email=...
    // en vez de /auth/oauth2/callback, así que procesamos el token aquí.
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const role  = params['role'] as UserRole;
      const email = params['email'] ?? '';

      if (!token || !role) return;

      let userId = 0;
      try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        userId = payload['userId'] ?? 0;
      } catch { /* JWT inválido */ }

      this.auth.handleOAuth2Token(token, role, userId, email, '', '');
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.loading()) return;
    this.error.set(null);
    this.loading.set(true);

    const loader = await this.auth.createLoader('Iniciando sesión...');

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
        await this.auth.showErrorToast(msg);
      },
      complete: () => loader.dismiss(),
    });
  }

  loginWithGoogle(): void { this.auth.loginWithGoogle(); }
  togglePass(): void       { this.showPass.update(v => !v); }
}
