import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/inicio',
    pathMatch: 'full',
  },

  // ── Auth (públicas) ───────────────────────────────────────────────
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'auth/register',
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
    path: 'auth/forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.page').then(
        (m) => m.ForgotPasswordPage
      ),
  },
  {
    path: 'auth/reset-password',
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

  {
    path: '**',
    redirectTo: 'tabs/inicio',
  },
];
