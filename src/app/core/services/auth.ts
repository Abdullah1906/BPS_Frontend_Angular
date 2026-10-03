import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environments';

import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Auth`;

  private readonly accessTokenKey =
    'bps_access_token';

  private readonly refreshTokenKey =
    'bps_refresh_token';

  private readonly userKey =
    'bps_current_user';


  // LOGIN

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
            this.accessTokenKey,
            response.accessToken
          );

          localStorage.setItem(
            this.refreshTokenKey,
            response.refreshToken
          );

          localStorage.setItem(
            this.userKey,
            JSON.stringify(response)
          );

        })

      );
  }


  // REFRESH TOKEN

  refreshToken(): Observable<LoginResponse> {

    const accessToken =
      this.getToken();

    const refreshToken =
      this.getRefreshToken();

    const request: RefreshTokenRequest = {
      accessToken: accessToken ?? '',
      refreshToken: refreshToken ?? ''
    };

    return this.http
      .post<LoginResponse>(
        `${this.apiUrl}/refresh-token`,
        request
      )
      .pipe(

        tap(response => {

          localStorage.setItem(
            this.accessTokenKey,
            response.accessToken
          );

          localStorage.setItem(
            this.refreshTokenKey,
            response.refreshToken
          );

          localStorage.setItem(
            this.userKey,
            JSON.stringify(response)
          );

        })

      );
  }


  // REGISTER

  register(
    request: RegisterRequest
  ): Observable<RegisterResponse> {

    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/register`,
      request
    );
  }


  // LOGOUT

  logout(): void {

    localStorage.removeItem(
      this.accessTokenKey
    );

    localStorage.removeItem(
      this.refreshTokenKey
    );

    localStorage.removeItem(
      this.userKey
    );
  }

  // FORGOT PASSWORD

  forgotPassword(request: {email: string;}) {

    return this.http.post(
      `${this.apiUrl}/forgot-password`,
      request
    );
  }

  // RESET PASSWORD

  resetPassword(request: {token: string;newPassword: string;}) {

    return this.http.post(
      `${this.apiUrl}/reset-password`,
      request
    );
  }


  // GET ACCESS TOKEN

  getToken(): string | null {

    return localStorage.getItem(
      this.accessTokenKey
    );
  }


  // GET REFRESH TOKEN

  getRefreshToken(): string | null {

    return localStorage.getItem(
      this.refreshTokenKey
    );
  }


  // GET USER

  getUser(): LoginResponse | null {

    const raw =
      localStorage.getItem(
        this.userKey
      );

    return raw
      ? JSON.parse(raw)
      : null;
  }


  // CHECK LOGIN

  isLoggedIn(): boolean {

    const token =
      this.getToken();

    if (!token) {
      return false;
    }

    try {

      const payload =
        JSON.parse(
          atob(
            token.split('.')[1]
          )
        );

      const expiration =
        payload.exp * 1000;

      return Date.now() < expiration;

    } catch {

      return false;
    }
  }
}





// import { Injectable, inject } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, tap, BehaviorSubject, throwError } from 'rxjs';
// import { environment } from '../../../environments/environments';
// import {
//   LoginRequest,
//   LoginResponse,
//   RegisterRequest,
//   RegisterResponse,
//   RefreshTokenRequest
// } from '../models/auth.model';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {

//   private readonly http = inject(HttpClient);
//   private readonly apiUrl = `${environment.apiUrl}/Auth`;

//   private readonly accessTokenKey = 'bps_access_token';
//   private readonly refreshTokenKey = 'bps_refresh_token';
//   private readonly userKey = 'bps_current_user';

//   // Refresh token প্রসেস track করার জন্য
//   private refreshTokenInProgress = false;
//   private refreshTokenSubject = new BehaviorSubject<LoginResponse | null>(null);

//   // LOGIN
//   login(request: LoginRequest): Observable<LoginResponse> {
//     return this.http
//       .post<LoginResponse>(`${this.apiUrl}/login`, request)
//       .pipe(
//         tap(response => {
//           this.storeTokens(response);
//         })
//       );
//   }

//   // REGISTER
//   register(request: RegisterRequest): Observable<RegisterResponse> {
//     return this.http.post<RegisterResponse>(
//       `${this.apiUrl}/register`,
//       request
//     );
//   }

//   // LOGOUT
//   logout(): void {
//     localStorage.removeItem(this.accessTokenKey);
//     localStorage.removeItem(this.refreshTokenKey);
//     localStorage.removeItem(this.userKey);
//     this.refreshTokenSubject.next(null);
//     this.refreshTokenInProgress = false;
//   }

//   // GET ACCESS TOKEN
//   getToken(): string | null {
//     return localStorage.getItem(this.accessTokenKey);
//   }

//   // GET REFRESH TOKEN
//   getRefreshToken(): string | null {
//     return localStorage.getItem(this.refreshTokenKey);
//   }

//   // GET USER
//   getUser(): LoginResponse | null {
//     const raw = localStorage.getItem(this.userKey);
//     return raw ? JSON.parse(raw) : null;
//   }

//   // ✅ Reload-এর পরেও stay logged in রাখতে
//   isLoggedIn(): boolean {
//     const refreshToken = this.getRefreshToken();
    
//     // Refresh token আছে এবং expire না হয়েছে = still valid session
//     if (refreshToken && !this.isRefreshTokenExpired()) {
//       return true;
//     }

//     // না হলে logout
//     return false;
//   }

//   // ✅ Token-এর expiry check করে
//   private isTokenExpired(token: string | null): boolean {
//     if (!token) return true;

//     try {
//       const payload = JSON.parse(atob(token.split('.')[1]));
//       const expiration = payload.exp * 1000;
//       return Date.now() > expiration;
//     } catch {
//       return true;
//     }
//   }

//   // ✅ Refresh token expire check
//   private isRefreshTokenExpired(): boolean {
//     const refreshToken = this.getRefreshToken();
//     if (!refreshToken) return true;

//     try {
//       const payload = JSON.parse(atob(refreshToken.split('.')[1]));
//       const expiration = payload.exp * 1000;
//       return Date.now() > expiration;
//     } catch {
//       return true;
//     }
//   }

//   // ✅ Token expire হওয়ার আগেই refresh করতে হবে কিনা check
//   shouldRefreshToken(): boolean {
//     const token = this.getToken();
//     if (!token) return false;

//     try {
//       const payload = JSON.parse(atob(token.split('.')[1]));
//       const expirationTime = payload.exp * 1000;
//       const timeUntilExpiry = expirationTime - Date.now();

//       // ৬০ সেকেন্ডের মধ্যে expire হবে = refresh করো
//       return timeUntilExpiry < 60000 && timeUntilExpiry > 0;
//     } catch {
//       return false;
//     }
//   }

//   // ✅ Refresh Token - Race condition safe
//   refreshToken(): Observable<LoginResponse> {
//     // যদি refresh চলছে থাকে, নতুন refresh না করে waiting state return করো
//     if (this.refreshTokenInProgress) {
//       // অন্যান্য request wait করবে refresh complete হওয়ার জন্য
//       return new Observable(observer => {
//         const subscription = this.refreshTokenSubject.subscribe(response => {
//           if (response) {
//             observer.next(response);
//             observer.complete();
//           }
//         });
//         return () => subscription.unsubscribe();
//       });
//     }

//     const accessToken = this.getToken();
//     const refreshToken = this.getRefreshToken();

//     // Tokens নেই = logout করে error throw করো
//     if (!accessToken || !refreshToken) {
//       this.logout();
//       return throwError(() => new Error('No tokens available'));
//     }

//     this.refreshTokenInProgress = true;

//     const request: RefreshTokenRequest = {
//       accessToken,
//       refreshToken
//     };

//     return this.http
//       .post<LoginResponse>(`${this.apiUrl}/refresh-token`, request)
//       .pipe(
//         tap(response => {
//           // নতুন tokens store করো
//           this.storeTokens(response);
          
//           // অন্যান্য waiting requests-কে notify করো
//           this.refreshTokenSubject.next(response);
          
//           // Refresh complete হয়েছে
//           this.refreshTokenInProgress = false;
//         })
//         // Error handle interceptor-এ হবে, এখানে না
//       );
//   }

//   // ✅ Interceptor-এর জন্য: refresh চলছে কিনা check করতে
//   getRefreshTokenInProgress(): boolean {
//     return this.refreshTokenInProgress;
//   }

//   // ✅ Helper: tokens store করার জন্য
//   private storeTokens(response: LoginResponse): void {
//     if (response.accessToken) {
//       localStorage.setItem(this.accessTokenKey, response.accessToken);
//     }
//     if (response.refreshToken) {
//       localStorage.setItem(this.refreshTokenKey, response.refreshToken);
//     }
//     localStorage.setItem(this.userKey, JSON.stringify(response));
//   }
// }
