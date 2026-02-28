import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, lockClosedOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const pwd = control.get('nuevaPassword')?.value;
  const confirm = control.get('confirmarPassword')?.value;
  if (pwd && confirm && pwd !== confirm) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
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
    IonIcon,
    IonSpinner,
    IonText,
  ],
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastCtrl = inject(ToastController);

  readonly loading = signal(false);
  readonly showPasswords = signal(false);
  readonly errorMessage = signal('');
  readonly invalidToken = signal(false);

  private token = '';

  readonly form = this.fb.nonNullable.group(
    {
      nuevaPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmarPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator }
  );

  constructor() {
    addIcons({ eyeOutline, eyeOffOutline, lockClosedOutline });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.invalidToken.set(true);
    }
  }

  togglePasswords(): void {
    this.showPasswords.update((v) => !v);
  }

  onSubmit(): void {
    if (this.form.invalid || this.loading()) return;

    this.errorMessage.set('');
    this.loading.set(true);

    this.authService
      .resetPassword({ token: this.token, nuevaPassword: this.form.getRawValue().nuevaPassword })
      .subscribe({
        next: async () => {
          this.loading.set(false);
          const toast = await this.toastCtrl.create({
            message: 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.',
            duration: 4000,
            color: 'success',
            position: 'top',
          });
          await toast.present();
          this.router.navigate(['/auth/login']);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          if (err.status === 400 || err.status === 404) {
            this.invalidToken.set(true);
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
