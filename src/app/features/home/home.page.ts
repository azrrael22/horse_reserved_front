import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonButtons,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline, keyOutline, calendarOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonButtons,
    IonIcon,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Horse Reserved</ion-title>
        <ion-buttons slot="end">
          <ion-button routerLink="/auth/change-password" fill="clear">
            <ion-icon name="key-outline" slot="icon-only" color="light"></ion-icon>
          </ion-button>
          <ion-button (click)="logout()" fill="clear">
            <ion-icon name="log-out-outline" slot="icon-only" color="light"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <span class="text-6xl">🐴</span>
        <h2 class="text-xl font-bold text-gray-800">
          ¡Bienvenido, {{ session()?.primerNombre }}!
        </h2>
        <p class="text-sm text-gray-500">
          Has iniciado sesión como <strong>{{ session()?.role }}</strong>.
        </p>
        <ion-button routerLink="/reservas" expand="block" class="w-full max-w-xs">
          <ion-icon name="calendar-outline" slot="start"></ion-icon>
          {{ session()?.role === 'ADMINISTRADOR' ? 'Ver todas las reservas' : 'Mis reservas' }}
        </ion-button>
      </div>
    </ion-content>
  `,
})
export class HomePage {
  private readonly authService = inject(AuthService);
  readonly session = this.authService.session;

  constructor() {
    addIcons({ logOutOutline, keyOutline, calendarOutline });
  }

  logout(): void {
    this.authService.logout();
  }
}
