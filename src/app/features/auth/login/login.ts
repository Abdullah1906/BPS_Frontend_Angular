import {
  Component,
  inject
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth';


@Component({
  selector: 'app-login',
  standalone: true,

  imports: [
    ReactiveFormsModule
  ],

  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  private readonly fb =
    inject(FormBuilder);

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);


  loading = false;

  errorMessage = '';


  loginForm =
    this.fb.nonNullable.group({

      username: [
        '',
        [
          Validators.required
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ]

    });


  submit(): void {

    if (this.loginForm.invalid) {

      this.loginForm.markAllAsTouched();

      return;
    }


    this.loading = true;

    this.errorMessage = '';


    const request =
      this.loginForm.getRawValue();


    this.authService
      .login(request)
      .subscribe({

        next: () => {

          this.loading = false;

          this.router.navigate([
            '/dashboard'
          ]);

        },


        error: error => {

          this.loading = false;

          console.error(
            'Login error:',
            error
          );

          this.errorMessage =
            error?.error?.message ??
            'Invalid username or password.';

        }

      });

  }
}