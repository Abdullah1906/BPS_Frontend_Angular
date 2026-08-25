import {
  Component,
  inject
} from '@angular/core';

import { AuthService }
  from '../../../core/services/auth';

import { Router }
  from '@angular/router';


@Component({
  selector: 'app-dashboard',
  standalone: true,

  templateUrl: './dashboard.html',

  styleUrl: './dashboard.scss'
})
export class Dashboard {

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