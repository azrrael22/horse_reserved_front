import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private toastCtrl: ToastController) {}

  async success(message: string, duration = 3000): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      color: 'success',
      position: 'top',
      icon: 'checkmark-circle-outline',
      cssClass: 'toast-success',
    });
    await toast.present();
  }

  async error(message: string, duration = 4000): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      color: 'danger',
      position: 'top',
      icon: 'alert-circle-outline',
      cssClass: 'toast-error',
    });
    await toast.present();
  }

  async info(message: string, duration = 3000): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      color: 'primary',
      position: 'top',
      icon: 'information-circle-outline',
    });
    await toast.present();
  }
}
