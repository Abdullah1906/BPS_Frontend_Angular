import {
  CanActivateFn,
  Router
} from '@angular/router';

import { inject } from '@angular/core';

import { AuthService }
  from '../services/auth';
import { PermissionService } from '../services/permission';


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

export const permissionGuard = (
  permission: string
): CanActivateFn => {

  return () => {

    const permissionService =
      inject(PermissionService);

    const router =
      inject(Router);

    if (
      permissionService.has(permission)
    ) {

      return true;

    }

    return router.createUrlTree([
      '/dashboard'
    ]);

  };

};