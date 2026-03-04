import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonIcon,
  IonSpinner,
  IonBadge,
  IonRippleEffect,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { timeOutline, chevronForwardOutline, callOutline, mailOutline, locationOutline, headsetOutline, logoInstagram, logoFacebook, logoWhatsapp, logoYoutube } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { RutaService } from '../../core/services/ruta.service';
import { RutaResponse } from '../../core/models/ruta.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonIcon,
    IonSpinner,
    IonBadge,
    IonRippleEffect,
  ],
  templateUrl: './home.page.html',
})
export class HomePage {
  private readonly authService = inject(AuthService);
  private readonly rutaService = inject(RutaService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');
  readonly rutas = signal<RutaResponse[]>([]);

  constructor() {
    addIcons({ timeOutline, chevronForwardOutline, callOutline, mailOutline, locationOutline, headsetOutline, logoInstagram, logoFacebook, logoWhatsapp, logoYoutube });
  }

  ionViewWillEnter(): void {
    this.cargarRutas();
  }

  cargarRutas(): void {
    this.loading.set(true);
    this.error.set('');
    this.rutaService.listarActivas().subscribe({
      next: (data) => {
        this.rutas.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudieron cargar las rutas.');
      },
    });
  }

  verDetalle(ruta: RutaResponection else): void {
    this.router.navigate(['/rutas', ruta.id]);
  }

  dificultadColor(dificultad: string): string {
    switch (dificultad?.toLowerCase()) {
      case 'fácil':
      case 'facil': return 'success';
      case 'moderado':
      case 'moderada': return 'warning';
      case 'difícil':
      case 'dificil': return 'danger';
      default: return 'medium';
    }
  }
}
