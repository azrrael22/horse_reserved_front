import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-pago-fallo',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon],
  templateUrl: './pago-fallo.page.html',
})
export class PagoFalloPage {
  private readonly router = inject(Router);

  constructor() {
    addIcons({ closeCircleOutline });
  }

  irAReservas(): void {
    this.router.navigate(['/tabs/reservas'], { replaceUrl: true });
  }
}
