import { Injectable, inject } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, fromEvent, merge, timer } from 'rxjs';
import { distinctUntilChanged, map, startWith, switchMap, tap } from 'rxjs/operators';
import { AlertController } from '@ionic/angular/standalone';
import { AuthService } from './auth.service';

const WARN_MS = 90_000;
const LOGOUT_MS = 120_000;

const ACTIVITY_EVENTS = [
  'mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll', 'click',
] as const;

@Injectable({ providedIn: 'root' })
export class InactivityService {
  private readonly authService = inject(AuthService);
  private readonly alertCtrl = inject(AlertController);

  private warningAlert: HTMLIonAlertElement | null = null;
  private isWarningPending = false;

  constructor() {
    toObservable(this.authService.isLoggedIn).pipe(
      distinctUntilChanged(),
      switchMap(loggedIn => loggedIn ? this.buildActivityStream() : EMPTY),
      takeUntilDestroyed(),
    ).subscribe(action => {
      if (action === 'warn') {
        this.showWarning();
      } else {
        this.doLogout();
      }
    });
  }

  private buildActivityStream() {
    const events$ = merge(...ACTIVITY_EVENTS.map(ev => fromEvent(document, ev)));

    return events$.pipe(
      startWith(null),
      tap(() => this.dismissWarning()),
      switchMap(() => merge(
        timer(WARN_MS).pipe(map(() => 'warn' as const)),
        timer(LOGOUT_MS).pipe(map(() => 'logout' as const)),
      )),
    );
  }

  private async showWarning(): Promise<void> {
    if (this.warningAlert || this.isWarningPending) return;

    this.isWarningPending = true;
    this.warningAlert = await this.alertCtrl.create({
      header: 'Sesión por expirar',
      message: 'Tu sesión se cerrará en 30 segundos por inactividad.',
      backdropDismiss: false,
      buttons: [{ text: 'Continuar sesión', role: 'confirm' }],
    });
    this.isWarningPending = false;

    if (!this.warningAlert) return;

    await this.warningAlert.present();
    this.warningAlert.onDidDismiss().then(() => {
      this.warningAlert = null;
    });
  }

  private dismissWarning(): void {
    this.isWarningPending = false;
    this.warningAlert?.dismiss();
  }

  private doLogout(): void {
    this.dismissWarning();
    this.authService.logout();
  }
}
