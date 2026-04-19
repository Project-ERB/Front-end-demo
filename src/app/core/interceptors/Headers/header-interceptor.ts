import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../services/Auth/auth.service';

export const headerInterceptor: HttpInterceptorFn = (req, next) => {

  const _platformID = inject(PLATFORM_ID);

  if (isPlatformBrowser(_platformID)) {

    const token = localStorage.getItem('accessToken');

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  }

  return next(req);
};
