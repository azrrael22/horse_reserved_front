import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/inicio',
    pathMatch: 'full',
  },

  // ── Auth (públicas) ───────────────────────────────────────────────
  {
    path: 'auth/login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'auth/register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'auth/change-password',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/auth/change-password/change-password.page').then(
        (m) => m.ChangePasswordPage
      ),
  },
  {
    path: 'auth/delete-account',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/auth/delete-account/delete-account.page').then(
        (m) => m.DeleteAccountPage
      ),
  },
  {
    path: 'auth/forgot-password',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.page').then(
        (m) => m.ForgotPasswordPage
      ),
  },
  {
    path: 'auth/reset-password',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.page').then(
        (m) => m.ResetPasswordPage
      ),
  },
  {
    path: 'auth/oauth2-redirect',
    loadComponent: () =>
      import('./features/auth/oauth2-redirect/oauth2-redirect.page').then(
        (m) => m.OAuth2RedirectPage
      ),
  },

  // ── Tabs shell (requiere auth) ────────────────────────────────────
  {
    path: 'tabs',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      // Pestañas principales
      {
        path: 'inicio',
        loadComponent: () =>
          import('./features/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'reservas',
        loadComponent: () =>
          import('./features/reservas/reservas-list.page').then((m) => m.ReservasListPage),
      },
      {
        path: 'cuenta',
        loadComponent: () =>
          import('./features/cuenta/cuenta.page').then((m) => m.CuentaPage),
      },
      // Páginas de detalle (mantienen tab bar visible)
      {
        path: 'rutas/:id',
        loadComponent: () =>
          import('./features/rutas/ruta-detail.page').then((m) => m.RutaDetailPage),
      },
      {
        path: 'reservas/nueva',
        loadComponent: () =>
          import('./features/reservas/reserva-create.page').then((m) => m.ReservaCreatePage),
      },
      {
        path: 'reservas/:id',
        loadComponent: () =>
          import('./features/reservas/reserva-detail.page').then((m) => m.ReservaDetailPage),
      },
      {
        path: 'reservas/:id/editar',
        loadComponent: () =>
          import('./features/reservas/reserva-edit.page').then((m) => m.ReservaEditPage),
      },
      // Recursos (solo ADMIN — validación de rol dentro de la página)
      {
        path: 'recursos',
        loadComponent: () =>
          import('./features/recursos/recursos.page').then((m) => m.RecursosPage),
      },
      {
        path: 'recursos/caballos/nuevo',
        loadComponent: () =>
          import('./features/recursos/caballo-form.page').then((m) => m.CaballoFormPage),
      },
      {
        path: 'recursos/caballos/:id',
        loadComponent: () =>
          import('./features/recursos/caballo-form.page').then((m) => m.CaballoFormPage),
      },
      {
        path: 'recursos/guias/nuevo',
        loadComponent: () =>
          import('./features/recursos/guia-form.page').then((m) => m.GuiaFormPage),
      },
      {
        path: 'recursos/guias/:id',
        loadComponent: () =>
          import('./features/recursos/guia-form.page').then((m) => m.GuiaFormPage),
      },
      {
        path: 'recursos/rutas/nueva',
        canActivate: [roleGuard(['ADMINISTRADOR'])],
        loadComponent: () =>
          import('./features/recursos/ruta-form.page').then((m) => m.RutaFormPage),
      },
      {
        path: 'recursos/rutas/:id/editar',
        canActivate: [roleGuard(['ADMINISTRADOR'])],
        loadComponent: () =>
          import('./features/recursos/ruta-form.page').then((m) => m.RutaFormPage),
      },
      // Resultado de pago MercadoPago
      {
        path: 'pago/exito',
        loadComponent: () =>
          import('./features/pago/pago-exito/pago-exito.page').then((m) => m.PagoExitoPage),
      },
      {
        path: 'pago/fallo',
        loadComponent: () =>
          import('./features/pago/pago-fallo/pago-fallo.page').then((m) => m.PagoFalloPage),
      },
      {
        path: 'pago/pendiente',
        loadComponent: () =>
          import('./features/pago/pago-pendiente/pago-pendiente.page').then(
            (m) => m.PagoPendientePage
          ),
      },
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
    ],
  },

  // ── Legal (públicas) ──────────────────────────────────────────────
  {
    path: 'legal/politica-datos',
    loadComponent: () =>
      import('./features/legal/politica-datos/politica-datos.page').then(
        (m) => m.PoliticaDatosPage
      ),
  },

  // ── Legado: redirige /home → /tabs/inicio ─────────────────────────
  {
    path: 'home',
    redirectTo: 'tabs/inicio',
    pathMatch: 'full',
  },

   // ── Chatbot FAQ (pública, sin authGuard) ──────────────────────────────
  {
    path: 'chatbot',
    loadComponent: () =>
      import('./features/chatbot/chatbot.page').then((m) => m.ChatbotPage),
  },

  {
    path: '**',
    redirectTo: 'tabs/inicio',
  },
];
