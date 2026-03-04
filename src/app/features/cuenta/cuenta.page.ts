import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonMenuButton,
  IonButtons,
  IonIcon,
  IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { keyOutline, logOutOutline, personCircleOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cuenta',
  standalone: true,
  imports: [
    RouterLink,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonMenuButton,
    IonButtons,
    IonIcon,
    IonBadge,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Mi cuenta</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="flex flex-col items-center pt-8 pb-6">
        <ion-icon name="person-circle-outline" class="text-8xl text-gray-300 mb-3"></ion-icon>
        <h2 class="text-xl font-bold text-gray-800">
          {{ session()?.primerNombre }} {{ session()?.primerApellido }}
        </h2>
        <p class="text-sm text-gray-500 mt-1">{{ session()?.email }}</p>
        <ion-badge color="primary" class="mt-2">{{ session()?.role }}</ion-badge>
      </div>

      <div class="flex flex-col gap-3 max-w-sm mx-auto">
        <ion-button routerLink="/auth/change-password" expand="block" fill="outline">
          <ion-icon name="key-outline" slot="start"></ion-icon>
          Cambiar contraseña
        </ion-button>

        <ion-button color="danger" expand="block" fill="outline" (click)="logout()">
          <ion-icon name="log-out-outline" slot="start"></ion-icon>
          Cerrar sesión
        </ion-button>
      </div>
    </ion-content>
  `,
})
export class CuentaPage {
  private readonly authService = inject(AuthService);
  readonly session = this.authService.session;

  constructor() {
    addIcons({ keyOutline, logOutOutline, personCircleOutline });
  }

  logout(): void {
    this.authService.logout();
  }
}
