import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const headerInterceptor: HttpInterceptorFn = (req, next) => {

   const _platformID = inject(PLATFORM_ID);
   const _authService = inject(AuthService);

   if (isPlatformBrowser(_platformID)) {
     req = req.clone({
       setHeaders: {
         Authorization: `Bearer ${_authService.accessToken()}`,
       },
     });
   }
   
  return next(req);
};
