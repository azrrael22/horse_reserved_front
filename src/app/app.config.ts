import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { RouteReuseStrategy } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    // ── Ionic ──────────────────────────────────────────────────────────────
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({
      mode: 'md',            // Material Design en todas las plataformas (consistencia)
      animated: true,
      rippleEffect: true,
    }),

    // ── Router ─────────────────────────────────────────────────────────────
    provideRouter(routes, withComponentInputBinding()),

    // ── HTTP + interceptor JWT ──────────────────────────────────────────────
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
