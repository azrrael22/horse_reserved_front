import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonSpinner,
  IonText,
  IonBackButton,
  IonButtons,
  IonCheckbox,
  ToastController,
  LoadingController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { warningOutline, personRemoveOutline, chevronBackOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-delete-account',
  standalone: true,
  imports: [
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonIcon,
    IonSpinner,
    IonText,
    IonBackButton,
    IonButtons,
    IonCheckbox,
  ],
  templateUrl: './delete-account.page.html',
})
export class DeleteAccountPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastCtrl = inject(ToastController);
  private readonly loadingCtrl = inject(LoadingController);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  confirmed = false;

  constructor() {
    addIcons({ warningOutline, personRemoveOutline, chevronBackOutline });
  }

  async onConfirm(): Promise<void> {
    if (!this.confirmed || this.loading()) return;

    this.errorMessage.set('');
    this.loading.set(true);

    const loader = await this.loadingCtrl.create({ message: 'Procesando...' });
    await loader.present();

    this.authService.deleteAccount().subscribe({
      next: async () => {
        await loader.dismiss();
        this.loading.set(false);
        this.authService.logout();
        const toast = await this.toastCtrl.create({
          message: 'Tu cuenta ha sido dada de baja. Puedes crear una nueva cuenta en cualquier momento.',
          duration: 5000,
          color: 'medium',
          position: 'top',
        });
        await toast.present();
      },
      error: async (err: HttpErrorResponse) => {
        await loader.dismiss();
        this.loading.set(false);
        if (err.status === 0) {
          this.errorMessage.set('No se pudo conectar con el servidor. Intenta de nuevo.');
        } else {
          this.errorMessage.set('Ha ocurrido un error. Intenta de nuevo.');
        }
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/tabs/cuenta']);
  }
}
