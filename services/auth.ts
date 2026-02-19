import { api, USE_MOCK } from './api-client';
import type { AuthResponse, LoginPayload, SignupPayload, SocialAuthPayload, User } from '@/types/auth';

// ─── Mock helpers ─────────────────────────────────────────────────────────────

const MOCK_USER: User = {
  id: 'user-1',
  email: 'demo@fintrack.app',
  name: 'Demo User',
};

const ADMIN_USER: User = {
  id: 'user-0',
  email: 'admin',
  name: 'Admin',
};

const MOCK_TOKEN = 'mock-jwt-token-fintrack';

function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms));
}

async function mockLogin(payload: LoginPayload): Promise<AuthResponse> {
  await delay();
  if (!payload.email || !payload.password) {
    throw new Error('Email and password are required');
  }
  if (payload.email === 'admin' && payload.password === '1') {
    return { user: ADMIN_USER, access_token: MOCK_TOKEN };
  }
  if (payload.password.length < 6) {
    throw new Error('Invalid credentials');
  }
  return { user: { ...MOCK_USER, email: payload.email }, access_token: MOCK_TOKEN };
}

async function mockSignup(payload: SignupPayload): Promise<AuthResponse> {
  await delay(500);
  if (!payload.email || !payload.password) {
    throw new Error('Email and password are required');
  }
  if (payload.password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
  return {
    user: { ...MOCK_USER, email: payload.email, name: payload.name ?? undefined },
    access_token: MOCK_TOKEN,
  };
}

async function mockSocialAuth(_payload: SocialAuthPayload): Promise<AuthResponse> {
  await delay(300);
  return { user: MOCK_USER, access_token: MOCK_TOKEN };
}

async function mockMe(): Promise<User> {
  await delay(200);
  return MOCK_USER;
}

async function mockLogout(): Promise<void> {
  await delay(100);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const authService = {
  login(payload: LoginPayload): Promise<AuthResponse> {
    if (USE_MOCK) return mockLogin(payload);
    return api.post('/auth/login', payload);
  },

  signup(payload: SignupPayload): Promise<AuthResponse> {
    if (USE_MOCK) return mockSignup(payload);
    return api.post('/auth/signup', payload);
  },

  socialAuth(payload: SocialAuthPayload): Promise<AuthResponse> {
    if (USE_MOCK) return mockSocialAuth(payload);
    return api.post('/auth/social', payload);
  },

  me(): Promise<User> {
    if (USE_MOCK) return mockMe();
    return api.get('/auth/me');
  },

  logout(): Promise<void> {
    if (USE_MOCK) return mockLogout();
    return api.post('/auth/logout', {});
  },
};
