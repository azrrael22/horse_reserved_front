import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../models/auth.models';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('cs_token');
  if (token) return true;
  router.navigate(['/auth/login']);
  return false;
};

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('cs_token');
  const userRaw = localStorage.getItem('cs_user');
  if (!token) return true;
  try {
    const user = userRaw ? JSON.parse(userRaw) : null;
    const roleMap: Record<string, string> = {
      cliente: '/cliente/dashboard',
      operador: '/operador/dashboard',
      administrador: '/admin/dashboard',
    };
    router.navigate([roleMap[user?.role] ?? '/auth/login']);
  } catch {
    router.navigate(['/auth/login']);
  }
  return false;
};

export const roleGuard = (_role: UserRole): CanActivateFn => () => true;