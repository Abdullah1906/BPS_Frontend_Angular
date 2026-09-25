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

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-login',
  standalone: true,

  imports: [
    ReactiveFormsModule,
    MatFormFieldModule, 
    MatInputModule, 
    MatIconModule, 
    MatButtonModule
  ],

  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  hide = true;
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
          Validators.required,
          Validators.maxLength(50)
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(20)
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
            error?.error?.title ??
            'Invalid username or password.';

        }

      });

  }

  getPasswordError(): string {
    const control = this.loginForm.controls.password;

    if (control.hasError('required')) {
      return 'Password is required';
    }

    if (control.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }

    if (control.hasError('maxlength')) {
      return 'Password cannot exceed 20 characters';
    }

    return '';
  }
  getUserNameError(): string {
    const control = this.loginForm.controls.username;

    if (control.hasError('required')) {
      return 'Username is required';
    }

    if (control.hasError('maxlength')) {
      return 'Username cannot exceed 20 characters';
    }

    return '';
  }

    
}