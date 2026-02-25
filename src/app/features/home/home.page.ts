import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon,
  IonCard, IonCardHeader, IonCardContent, IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  logOutOutline, personCircleOutline, mailOutline, shieldCheckmarkOutline,
  lockClosedOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon,
    IonCard, IonCardHeader, IonCardContent, IonBadge,
  ],
  templateUrl: './home.page.html',
})
export class HomePage {
  readonly auth = inject(AuthService);

  constructor() {
    addIcons({ logOutOutline, personCircleOutline, mailOutline, shieldCheckmarkOutline, lockClosedOutline });
  }

  logout(): void {
    this.auth.logout();
  }

  roleBadgeColor(): string {
    const map: Record<string, string> = {
      administrador: 'danger',
      operador: 'warning',
      cliente: 'success',
    };
    return map[this.auth.currentUser()?.role ?? ''] ?? 'medium';
  }
}
