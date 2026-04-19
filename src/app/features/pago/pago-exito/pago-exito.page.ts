import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { PagoService } from '../../../core/services/pago.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-pago-exito',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonSpinner],
  templateUrl: './pago-exito.page.html',
})
export class PagoExitoPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pagoService = inject(PagoService);
  private readonly toastService = inject(ToastService);

  readonly verificando = signal(true);
  readonly confirmado = signal(false);

  constructor() {
    addIcons({ checkmarkCircleOutline });
  }

  ngOnInit(): void {
    const intentoId = Number(this.route.snapshot.queryParamMap.get('intentoId'));
    const mpPaymentId = this.route.snapshot.queryParamMap.get('collection_id') ?? '';

    if (!intentoId) {
      this.verificando.set(false);
      return;
    }

    if (mpPaymentId) {
      this.pagoService.asociarPaymentId(intentoId, mpPaymentId).subscribe({
        error: (e) => console.warn('No se pudo asociar el paymentId:', e),
      });
    }

    this.pagoService.esperarConfirmacion(intentoId).subscribe({
      next: (res) => {
        this.verificando.set(false);
        if (res.estado === 'REALIZADO') {
          this.confirmado.set(true);
          this.toastService.success('¡Pago confirmado!');
        } else {
          this.router.navigate(['/tabs/pago/fallo'], { replaceUrl: true });
        }
      },
      error: () => {
        this.verificando.set(false);
        // Si el webhook llegó antes que el polling, mostramos éxito optimista
        this.confirmado.set(true);
        this.toastService.info('Pago recibido. Confirmación en proceso.');
      },
    });
  }

  irAReservas(): void {
    this.router.navigate(['/tabs/reservas'], { replaceUrl: true });
  }
}
