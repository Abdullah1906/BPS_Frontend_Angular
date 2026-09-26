export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  fullName: string;
  role: string;
  email: string;
  phoneNumber: string;
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
