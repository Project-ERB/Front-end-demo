import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

const ROLE_ROUTES: Record<string, string> = {
  SystemAdmin: '/admin-dashboard',
  SalesManager: '/sales-analysis',
  WarehouseManager: '/warehouse-management',
  HRDirector: '/hr-dashboard',
};

export const guestGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('accessToken'); // ✅ نفس الاسم
  const role = localStorage.getItem('role');

  if (token && role) {
    const ROLE_ROUTES: Record<string, string> = {
      SystemAdmin: '/admin-dashboard',
      SalesManager: '/sales-analysis',
      WarehouseManager: '/warehouse-management',
      HRDirector: '/hr-dashboard',
    };
    router.navigate([ROLE_ROUTES[role] ?? '/admin-dashboard']);
    return false;
  }

  return true;
};