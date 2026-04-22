import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonMenuButton,
  IonButtons,
  IonIcon,
  IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { keyOutline, logOutOutline, chevronForwardOutline, personRemoveOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { AppFooterComponent } from '../../shared/components/app-footer/app-footer.component';
import { UserAvatarComponent } from '../../shared/components/user-avatar/user-avatar.component';

@Component({
  selector: 'app-cuenta',
  standalone: true,
  imports: [
    RouterLink,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonMenuButton,
    IonButtons,
    IonIcon,
    IonBadge,
    AppFooterComponent,
    UserAvatarComponent,
  ],
  templateUrl: './cuenta.page.html',
  styleUrls: ['./cuenta.page.scss'],
})
export class CuentaPage {
  private readonly authService = inject(AuthService);
  readonly session = this.authService.session;

  constructor() {
    addIcons({ keyOutline, logOutOutline, chevronForwardOutline, personRemoveOutline });
  }

  logout(): void {
    this.authService.logout();
  }
}
