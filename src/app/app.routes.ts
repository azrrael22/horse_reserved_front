import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  // ── Autenticación ─────────────────────────────────────────────────────────
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/auth/login/login.page').then(m => m.LoginPage),
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/auth/register/register.page').then(m => m.RegisterPage),
      },
      {
        path: 'oauth2/callback',
        loadComponent: () =>
          import('./features/auth/oauth2-callback/oauth2-callback.page').then(
            m => m.OAuth2CallbackPage,
          ),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // ── Dashboard Cliente ──────────────────────────────────────────────────────
  {
    path: 'cliente',
    canActivate: [authGuard, roleGuard('cliente')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/cliente/dashboard/dashboard.page').then(
            m => m.ClienteDashboardPage,
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // ── Dashboard Operador ─────────────────────────────────────────────────────
  {
    path: 'operador',
    canActivate: [authGuard, roleGuard('operador')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/operador/dashboard/dashboard.page').then(
            m => m.OperadorDashboardPage,
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // ── Dashboard Admin ────────────────────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('administrador')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.page').then(
            m => m.AdminDashboardPage,
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // ── Cuenta (cualquier usuario autenticado) ─────────────────────────────────
  {
    path: 'cuenta',
    canActivate: [authGuard],
    children: [
      {
        path: 'cambiar-password',
        loadComponent: () =>
          import('./features/cuenta/cambiar-password/change-password.page').then(
            m => m.ChangePasswordPage,
          ),
      },
    ],
  },

  { path: '**', redirectTo: 'auth/login' },
];
