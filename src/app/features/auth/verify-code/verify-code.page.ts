import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {
  IonContent,
  IonButton,
  IonInput,
  IonIcon,
  IonSpinner,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { shieldCheckmarkOutline, refreshOutline, arrowBackOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { AppFooterComponent } from '../../../shared/components/app-footer/app-footer.component';

@Component({
  selector: 'app-verify-code',
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
    AppFooterComponent,
  ],
  templateUrl: './verify-code.page.html',
  styleUrls: ['./verify-code.page.scss'],
})
export class VerifyCodePage implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly challengeId = signal('');
  readonly timeRemaining = signal(300);
  readonly resendCooldown = signal(60);
  readonly remainingResends = signal(3);

  readonly canResend = computed(
    () => this.resendCooldown() === 0 && this.remainingResends() > 0 && this.timeRemaining() > 0
  );

  readonly timeDisplay = computed(() => {
    const t = this.timeRemaining();
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  });

  private countdownTimer?: ReturnType<typeof setInterval>;
  private resendTimer?: ReturnType<typeof setInterval>;

  readonly form = this.fb.nonNullable.group({
    otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  constructor() {
    addIcons({ shieldCheckmarkOutline, refreshOutline, arrowBackOutline });
  }

  ngOnInit(): void {
    const state = history.state as { challengeId?: string; expiresInSeconds?: number };
    if (!state?.challengeId) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.challengeId.set(state.challengeId);
    this.timeRemaining.set(state.expiresInSeconds ?? 300);
    this.startCountdown();
    this.startResendCooldown(60);
  }

  ngOnDestroy(): void {
    clearInterval(this.countdownTimer);
    clearInterval(this.resendTimer);
  }

  onSubmit(): void {
    if (this.form.invalid || this.loading()) return;
    this.errorMessage.set('');
    this.loading.set(true);

    this.authService
      .verifyTwoFactor({ challengeId: this.challengeId(), otp: this.form.getRawValue().otp })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/tabs/inicio']);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.form.controls.otp.reset();
          if (err.status === 401) {
            this.errorMessage.set('Código incorrecto o expirado. Inténtalo de nuevo.');
          } else if (err.status === 403) {
            this.errorMessage.set(
              'Has superado el número máximo de intentos. Vuelve a iniciar sesión.'
            );
            clearInterval(this.countdownTimer);
            clearInterval(this.resendTimer);
            this.timeRemaining.set(0);
          } else {
            this.errorMessage.set('Ha ocurrido un error. Intenta de nuevo.');
          }
        },
      });
  }

  resend(): void {
    if (!this.canResend() || this.loading()) return;
    this.errorMessage.set('');
    this.loading.set(true);

    this.authService.resendTwoFactor({ challengeId: this.challengeId() }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.remainingResends.update((n) => n - 1);
        this.startResendCooldown(res.remainingSeconds > 0 ? res.remainingSeconds : 60);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 429) {
          const secs: number = (err.error as { remainingSeconds?: number })?.remainingSeconds ?? 60;
          this.startResendCooldown(secs);
          this.errorMessage.set(`Espera ${secs} segundos antes de reenviar.`);
        } else if (err.status === 403) {
          this.remainingResends.set(0);
          this.errorMessage.set('Has alcanzado el límite de reenvíos.');
        } else {
          this.errorMessage.set('No se pudo reenviar el código. Intenta de nuevo.');
        }
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/auth/login']);
  }

  private startCountdown(): void {
    clearInterval(this.countdownTimer);
    this.countdownTimer = setInterval(() => {
      this.timeRemaining.update((t) => {
        if (t <= 1) {
          clearInterval(this.countdownTimer);
          this.errorMessage.set(
            'El código ha expirado. Por favor, vuelve a iniciar sesión.'
          );
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  private startResendCooldown(seconds: number): void {
    clearInterval(this.resendTimer);
    this.resendCooldown.set(seconds);
    this.resendTimer = setInterval(() => {
      this.resendCooldown.update((s) => {
        if (s <= 1) {
          clearInterval(this.resendTimer);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  get otpCtrl() {
    return this.form.controls.otp;
  }
}
