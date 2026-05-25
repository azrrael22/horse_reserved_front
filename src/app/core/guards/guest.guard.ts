import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Redirige al home si el usuario ya está autenticado (evita acceder a login/register). */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    const home = authService.session()?.role === 'ADMINISTRADOR'
      ? '/tabs/recursos'
      : '/tabs/inicio';
    return router.createUrlTree([home]);
  }

  return true;
};
