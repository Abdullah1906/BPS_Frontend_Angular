import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router,RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './registration.html',
  styleUrl: './registration.scss'
})
export class RegisterComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  hidePassword = true;
  hideConfirmPassword = true;

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  registerForm = this.fb.nonNullable.group({
    fullName: [
      '',
      [
        Validators.required,
        Validators.maxLength(150)
      ]
    ],

    username: [
      '',
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ],

    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(255)
      ]
    ],

    phoneNumber: [
      '',
      [
        Validators.required,
        Validators.maxLength(20)
      ]
    ],

    password: [
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
  });


  get fullName() {
    return this.registerForm.controls.fullName;
  }

  get username() {
    return this.registerForm.controls.username;
  }

  get email() {
    return this.registerForm.controls.email;
  }

  get phoneNumber() {
    return this.registerForm.controls.phoneNumber;
  }

  get password() {
    return this.registerForm.controls.password;
  }

  get confirmPassword() {
    return this.registerForm.controls.confirmPassword;
  }


  register(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const formValue = this.registerForm.getRawValue();

    if (formValue.password !== formValue.confirmPassword) {
      this.confirmPassword.setErrors({
        passwordMismatch: true
      });

      return;
    }

    this.isLoading = true;

    const request = {
      username: formValue.username.trim(),
      password: formValue.password,
      fullName: formValue.fullName.trim(),
      email: formValue.email.trim(),
      phoneNumber: formValue.phoneNumber.trim()
    };

    this.authService.register(request).subscribe({
      next: (response) => {

        this.isLoading = false;

        this.successMessage =
          'Registration successful. Redirecting to login...';

        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1200);
      },

      error: (error) => {

        this.isLoading = false;

        if (error.status === 409) {
          this.errorMessage =
            error.error?.message ??
            'Username already exists.';
        }
        else if (error.status === 400) {
          this.errorMessage =
            typeof error.error === 'string'
              ? error.error
              : 'Please check your information.';
        }
        else {
          this.errorMessage =
            'Registration failed. Please try again.';
        }
      }
    });
  }
}