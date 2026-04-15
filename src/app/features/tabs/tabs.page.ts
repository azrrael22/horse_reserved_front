import { Component, inject, computed } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, calendarOutline, personOutline, layersOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage {
  private readonly authService = inject(AuthService);

  readonly esAdmin = computed(() => this.authService.session()?.role === 'ADMINISTRADOR');

  constructor() {
    addIcons({ homeOutline, calendarOutline, personOutline, layersOutline });
  }
}
