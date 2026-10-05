export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  username: string;
  fullName: string;
  role: string;
  email: string;
  phoneNumber: string;
  permissions: string[];
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface RegisterResponse {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
}
