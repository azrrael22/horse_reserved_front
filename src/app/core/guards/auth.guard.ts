import { inject, untracked } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.models';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (untracked(() => auth.isLoggedIn())) return true;
  router.navigate(['/auth/login']);
  return false;
};

export const guestGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (!untracked(() => auth.isLoggedIn())) return true;
  const role = untracked(() => auth.userRole());
  const roleMap: Record<UserRole, string> = {
    cliente:       '/cliente/dashboard',
    operador:      '/operador/dashboard',
    administrador: '/admin/dashboard',
  };
  router.navigate([role ? (roleMap[role] ?? '/auth/login') : '/auth/login']);
  return false;
};

export const roleGuard = (role: UserRole): CanActivateFn => () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (untracked(() => auth.hasRole(role))) return true;
  router.navigate(['/auth/login']);
  return false;
};
