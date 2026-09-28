import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent
} from '@angular/common/http';

import { inject } from '@angular/core';
import { Router } from '@angular/router';

import {
  catchError,
  switchMap,
  throwError,
  take,
  Observable
} from 'rxjs';

import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  // Request-এর আগেই check: token expire হতে যাচ্ছে
  // if (authService.shouldRefreshToken() && !authService.getRefreshTokenInProgress()) {
  //   authService.refreshToken().pipe(take(1)).subscribe({
  //     error: () => {
  //       authService.logout();
  //       router.navigate(['/login']);
  //     }
  //   });
  // }
  // No token, request যাও as-is
  if (!token) {
    return next(req);
  }

  // Add access token to headers
  const authRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 Unauthorized
      if (error.status === 401) {
        return handle401Error(authRequest, next, authService, router);
      }

      // অন্য error pass through করো
      return throwError(() => error);
    })
  );
};

//  401 handler function
function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<HttpEvent<unknown>> {
  const refreshToken = authService.getRefreshToken();

  // Refresh token নেই = logout করো
  if (!refreshToken) {
    authService.logout();
    router.navigate(['/login']);
    return throwError(() => new Error('No refresh token available'));
  }

  // Refresh token try করো
  return authService.refreshToken().pipe(
    take(1),
    switchMap((response: any) => {
      // নতুন token দিয়ে original request retry করো
      const retryRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${response.accessToken}`
        }
      });

      return next(retryRequest);  
    }),
    catchError(() => {
      // Refresh failed = logout
      authService.logout();
      router.navigate(['/login']);
      return throwError(() => new Error('Token refresh failed'));
    })
  );
}