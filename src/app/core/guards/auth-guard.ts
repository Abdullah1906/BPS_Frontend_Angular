import {
  CanActivateFn,
  Router
} from '@angular/router';

import { inject } from '@angular/core';

import { AuthService }
  from '../services/auth';


export const authGuard: CanActivateFn =
  () => {

    const authService =
      inject(AuthService);

    const router =
      inject(Router);


    if (authService.isLoggedIn()) {

      return true;

    }


    return router.createUrlTree([
      '/login'
    ]);

  };


export const roleGuard = (allowedRoles: string[]): CanActivateFn => {

  return () => {

    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.getCurrentUser();

    if (!user) {
      return router.createUrlTree(['/login']);
    }

    if (allowedRoles.includes(user.role)) {
      return true;
    }

    return router.createUrlTree(['/dashboard']);
  };
};