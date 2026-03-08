import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.models';

/**
 * Guard configurable por rol. Uso en rutas:
 *   canActivate: [roleGuard(['ADMINISTRADOR'])]
 *   canActivate: [roleGuard(['OPERADOR', 'ADMINISTRADOR'])]
 */
export const roleGuard = (roles: UserRole[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const session = authService.currentUser();

    if (!session || !authService.isLoggedIn()) {
      return router.createUrlTree(['/auth/login']);
    }

    if (roles.includes(session.role)) {
      return true;
    }

    // Autenticado pero sin el rol requerido → home
    return router.createUrlTree(['/tabs/inicio']);
  };
};
