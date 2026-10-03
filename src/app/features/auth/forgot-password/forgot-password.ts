import {
  Component,
  inject
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  RouterLink
} from '@angular/router';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  MatInputModule
} from '@angular/material/input';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  AuthService
} from '../../../core/services/auth';


@Component({
  selector: 'app-forgot-password',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],

  templateUrl: './forgot-password.html',

  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {

  private readonly fb =
    inject(FormBuilder);

  private readonly authService =
    inject(AuthService);

  loading = false;

  submitted = false;

  errorMessage = '';

  forgotForm =
    this.fb.nonNullable.group({

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ]

    });


  submit(): void {

    if (this.forgotForm.invalid) {

      this.forgotForm.markAllAsTouched();

      return;
    }

    this.loading = true;

    this.errorMessage = '';

    const request =
      this.forgotForm.getRawValue();

    this.authService
      .forgotPassword(request)
      .subscribe({

        next: () => {

          this.loading = false;

          this.submitted = true;
        },

        error: error => {

          this.loading = false;

          console.error(
            'Forgot password error:',
            error
          );

          this.errorMessage =
            'Something went wrong. Please try again.';
        }

      });
  }
}