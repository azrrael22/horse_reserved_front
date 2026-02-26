import { Injectable, inject } from '@angular/core';
import { ToastController, LoadingController } from '@ionic/angular/standalone';

@Injectable({ providedIn: 'root' })
export class UiService {
  private readonly toast   = inject(ToastController);
  private readonly loading = inject(LoadingController);

  async showErrorToast(message: string): Promise<void> {
    const t = await this.toast.create({
      message,
      duration: 3500,
      color: 'danger',
      position: 'top',
      icon: 'alert-circle-outline',
      buttons: [{ icon: 'close-outline', role: 'cancel' }],
    });
    await t.present();
  }

  async showSuccessToast(message: string): Promise<void> {
    const t = await this.toast.create({
      message,
      duration: 3500,
      color: 'success',
      position: 'top',
      icon: 'checkmark-circle-outline',
    });
    await t.present();
  }

  async createLoader(message = 'Cargando...'): Promise<HTMLIonLoadingElement> {
    const l = await this.loading.create({ message, spinner: 'crescent' });
    await l.present();
    return l;
  }
}
