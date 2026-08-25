import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environments';

import {
  LoginRequest,
  LoginResponse
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Auth`;

  private readonly tokenKey =
    'bps_access_token';

  private readonly userKey =
    'bps_current_user';


  login(
    request: LoginRequest
  ): Observable<LoginResponse> {

    return this.http
      .post<LoginResponse>(
        `${this.apiUrl}/login`,
        request
      )
      .pipe(

        tap(response => {

          localStorage.setItem(
            this.tokenKey,
            response.token
          );

          localStorage.setItem(
            this.userKey,
            JSON.stringify(response)
          );

        })

      );
  }


  logout(): void {

    localStorage.removeItem(
      this.tokenKey
    );

    localStorage.removeItem(
      this.userKey
    );

  }


  getToken(): string | null {

    return localStorage.getItem(
      this.tokenKey
    );

  }


  getUser(): LoginResponse | null {

    const raw = localStorage.getItem(
      this.userKey
    );

    return raw ? JSON.parse(raw) : null;

  }


  isLoggedIn(): boolean {

    return !!this.getToken();

  }
}