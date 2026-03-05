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
import { AppFooterComponent } from '../../shared/components/app-footer/app-footer.component';

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
    AppFooterComponent,
  ],
  templateUrl: './cuenta.page.html',
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
