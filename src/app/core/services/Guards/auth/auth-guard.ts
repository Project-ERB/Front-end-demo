import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('accessToken'); // ✅ نفس الاسم

  if (!token) {
    router.navigate(['/admin-login']);
    return false;
  }

  return true;
};
