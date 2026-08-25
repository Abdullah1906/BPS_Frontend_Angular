import {
  Component,
  inject
} from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import {
  AuthService
} from '../../core/services/auth';


@Component({
  selector: 'app-main-layout',

  standalone: true,

  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],

  templateUrl:
    './main-layout.html',

  styleUrl:
    './main-layout.scss'
})
export class MainLayout {

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);

  user = this.authService.getUser();
  logout(): void {

    this.authService.logout();

    this.router.navigate([
      '/login'
    ]);

  }

}