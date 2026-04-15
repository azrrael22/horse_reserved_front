import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonApp,
  IonRouterOutlet,
  IonSplitPane,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonMenuToggle,
  IonFooter,
  IonButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  calendarOutline,
  personOutline,
  logOutOutline,
  layersOutline,
} from 'ionicons/icons';
import { AuthService } from './core/services/auth.service';
import { AccessibilityFabComponent } from './shared/components/accessibility-fab/accessibility-fab.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterLink,
    IonApp,
    IonRouterOutlet,
    IonSplitPane,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonMenuToggle,
    IonFooter,
    IonButton,
    AccessibilityFabComponent,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private readonly authService = inject(AuthService);

  readonly isLoggedIn = this.authService.isLoggedIn;
  readonly esAdmin = computed(() => this.authService.session()?.role === 'ADMINISTRADOR');

  constructor() {
    addIcons({ homeOutline, calendarOutline, personOutline, logOutOutline, layersOutline });
  }

  logout(): void {
    this.authService.logout();
  }
}
