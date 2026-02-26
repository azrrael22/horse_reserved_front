import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';
import { UiService } from '../../../core/services/ui.service';
import { UserRole } from '../../../core/models/auth.models';

/**
 * Página de callback OAuth2.
 * El backend redirige a: /auth/oauth2/callback?token=...&role=...&userId=...
 *                        &email=...&primerNombre=...&primerApellido=...
 */
@Component({
  selector: 'app-oauth2-callback',
  standalone: true,
  host: { class: 'ion-page' },
  imports: [IonContent, IonSpinner],
  template: `
    <ion-content class="auth-content">
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        gap: 20px;
      ">
        <div style="
          width: 64px; height: 64px;
          border-radius: 50%;
          background: var(--ion-color-primary);
          display: flex; align-items: center; justify-content: center;
          font-size: 28px;
        ">🐴</div>
        <ion-spinner name="crescent" color="primary" style="width:40px;height:40px;"></ion-spinner>
        <p style="color:var(--ion-color-medium);font-size:15px;margin:0;">
          Iniciando sesión con Google...
        </p>
      </div>
    </ion-content>
  `,
})
export class OAuth2CallbackPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly auth  = inject(AuthService);
  private readonly ui    = inject(UiService);

  ngOnInit(): void {
    console.log('[OAuth2Callback] URL completa:', window.location.href);

    this.route.queryParams.subscribe(params => {
      console.log('[OAuth2Callback] Params recibidos:', params);
      const { token, role, userId, email, primerNombre, primerApellido } = params;

      if (token && role) {
        console.log('[OAuth2Callback] Token OK, rol:', role, '→ redirigiendo al dashboard');
        this.auth.handleOAuth2Token(
          token,
          role as UserRole,
          Number(userId),
          email,
          primerNombre,
          primerApellido,
        );
      } else {
        console.warn('[OAuth2Callback] Falta token o role. Params:', params);
        this.ui.showErrorToast('Error al iniciar sesión con Google. Intenta de nuevo.');
        window.location.href = '/auth/login';
      }
    });
  }
}
