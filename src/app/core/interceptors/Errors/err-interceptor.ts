import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errInterceptor: HttpInterceptorFn = (req, next) => {
   return next(req).pipe(
    catchError((err) => {
      console.log('intercptore', err.error);
      
      return throwError(() => err);
    })
  );
};
 