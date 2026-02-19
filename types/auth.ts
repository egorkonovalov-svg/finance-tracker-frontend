export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  name?: string;
}

export interface SocialAuthPayload {
  provider: 'google' | 'apple';
  id_token: string;
}
