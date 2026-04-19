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
import { timeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-pago-pendiente',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon],
  templateUrl: './pago-pendiente.page.html',
})
export class PagoPendientePage {
  private readonly router = inject(Router);

  constructor() {
    addIcons({ timeOutline });
  }

  irAReservas(): void {
    this.router.navigate(['/tabs/reservas'], { replaceUrl: true });
  }
}
