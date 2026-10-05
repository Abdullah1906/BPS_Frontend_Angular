import { Injectable, inject } from '@angular/core';

import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  private readonly authService =
    inject(AuthService);


  has(permission: string): boolean {

    const user =
      this.authService.getCurrentUser();

    if (!user) {
      return false;
    }

    return user.permissions?.includes(permission) ?? false;
  }


  hasAny(permissions: string[]): boolean {

    return permissions.some(
      permission => this.has(permission)
    );

  }


  hasAll(permissions: string[]): boolean {

    return permissions.every(
      permission => this.has(permission)
    );

  }


  isAdmin(): boolean {

    return this.authService.getRole() === 'Admin';

  }

}