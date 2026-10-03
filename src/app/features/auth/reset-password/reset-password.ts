import {
  Component,
  inject
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
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


function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {

  const password =
    control.get('newPassword')?.value;

  const confirmPassword =
    control.get('confirmPassword')?.value;

  if (
    password &&
    confirmPassword &&
    password !== confirmPassword
  ) {

    return {
      passwordMismatch: true
    };
  }

  return null;
}


@Component({
  selector: 'app-reset-password',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],

  templateUrl: './reset-password.html',

  styleUrl: './reset-password.scss'
})
export class ResetPassword {

  private readonly fb =
    inject(FormBuilder);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly authService =
    inject(AuthService);

  token = '';

  hidePassword = true;

  hideConfirmPassword = true;

  loading = false;

  success = false;

  errorMessage = '';

  resetForm =
    this.fb.nonNullable.group(

      {
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(20)
          ]
        ],

        confirmPassword: [
          '',
          [
            Validators.required
          ]
        ]
      },

      {
        validators: passwordMatchValidator
      }

    );


  ngOnInit(): void {

    this.route.queryParamMap
      .subscribe(params => {

        this.token =
          params.get('token') ?? '';

        if (!this.token) {

          this.errorMessage =
            'Invalid password reset link.';
        }

      });
  }


  submit(): void {

    if (!this.token) {
      return;
    }

    if (this.resetForm.invalid) {

      this.resetForm.markAllAsTouched();

      return;
    }

    this.loading = true;

    this.errorMessage = '';

    const formValue =
      this.resetForm.getRawValue();

    this.authService
      .resetPassword({

        token: this.token,

        newPassword:
          formValue.newPassword

      })
      .subscribe({

        next: () => {

          this.loading = false;

          this.success = true;

        },

        error: error => {

          this.loading = false;

          console.error(
            'Reset password error:',
            error
          );

          this.errorMessage =
            error?.error?.message ??
            'Invalid or expired reset link.';
        }

      });
  }
}