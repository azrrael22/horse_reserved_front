import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.models';

/** Protege rutas que requieren autenticación */
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  router.navigateByUrl('/auth/login');
  return false;
};

/** Solo para usuarios NO autenticados (login/register) */
export const guestGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const role   = auth.userRole();

  if (!auth.isLoggedIn()) return true;

  const routes: Record<string, string> = {
    cliente:       '/cliente/dashboard',
    operador:      '/operador/dashboard',
    administrador: '/admin/dashboard',
  };
  router.navigateByUrl(routes[role!] ?? '/');
  return false;
};

/** Protege rutas según uno o más roles */
export const roleGuard = (...roles: UserRole[]): CanActivateFn => {
  return () => {
    const auth   = inject(AuthService);
    const router = inject(Router);
    if (!auth.isLoggedIn()) { router.navigateByUrl('/auth/login'); return false; }
    if (auth.hasRole(...roles)) return true;
    router.navigateByUrl('/no-autorizado');
    return false;
  };
};
