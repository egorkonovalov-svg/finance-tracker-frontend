import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '@/services/api-client';
import { authService } from '@/services/auth';
import type { User, LoginPayload, SignupPayload, SocialAuthPayload } from '@/types/auth';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  socialAuth: (payload: SocialAuthPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const TOKEN_KEY = '@fintrack_token';

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const persistToken = useCallback(async (t: string | null) => {
    setToken(t);
    setAuthToken(t);
    if (t) {
      await AsyncStorage.setItem(TOKEN_KEY, t);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(TOKEN_KEY);
        if (stored) {
          setAuthToken(stored);
          const me = await authService.me();
          setToken(stored);
          setUser(me);
        }
      } catch {
        await AsyncStorage.removeItem(TOKEN_KEY);
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await authService.login(payload);
    await persistToken(res.access_token);
    setUser(res.user);
  }, [persistToken]);

  const signup = useCallback(async (payload: SignupPayload) => {
    const res = await authService.signup(payload);
    await persistToken(res.access_token);
    setUser(res.user);
  }, [persistToken]);

  const socialAuth = useCallback(async (payload: SocialAuthPayload) => {
    const res = await authService.socialAuth(payload);
    await persistToken(res.access_token);
    setUser(res.user);
  }, [persistToken]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore logout errors
    }
    setUser(null);
    await persistToken(null);
  }, [persistToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        signup,
        socialAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
