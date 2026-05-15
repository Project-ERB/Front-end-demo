import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

const ADMIN_ROLES = ['SystemAdmin', 'SalesManager', 'WarehouseManager', 'HRDirector'];

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const role = localStorage.getItem('role');

  if (!role || !ADMIN_ROLES.includes(role)) {
    router.navigate(['/admin-login']);
    return false;
  }

  return true;
};