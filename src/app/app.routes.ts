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

  // ── Dashboards por rol (placeholders hasta implementar cada módulo) ─────────
  {
    path: 'cliente',
    canActivate: [authGuard, roleGuard('cliente')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/auth/login/login.page').then(m => m.LoginPage),
      },
    ],
  },
  {
    path: 'operador',
    canActivate: [authGuard, roleGuard('operador')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/auth/login/login.page').then(m => m.LoginPage),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('administrador')],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/auth/login/login.page').then(m => m.LoginPage),
      },
    ],
  },

  { path: '**', redirectTo: 'auth/login' },
];
