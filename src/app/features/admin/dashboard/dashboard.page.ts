import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon,
  IonCard, IonCardHeader, IonCardContent, IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  logOutOutline, personCircleOutline, mailOutline,
  shieldCheckmarkOutline, lockClosedOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  host: { class: 'ion-page' },
  imports: [
    RouterLink,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon,
    IonCard, IonCardHeader, IonCardContent, IonBadge,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class AdminDashboardPage {
  readonly auth = inject(AuthService);

  constructor() {
    addIcons({
      logOutOutline, personCircleOutline, mailOutline,
      shieldCheckmarkOutline, lockClosedOutline,
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
