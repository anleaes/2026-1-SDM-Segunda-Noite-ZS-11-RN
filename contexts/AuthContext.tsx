import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { apiLogin, setApiAuthToken } from '../services/api';

type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const TOKEN_STORAGE_KEY = 'gestao-contratos:auth-token';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const canUseLocalStorage = () => {
  try {
    return typeof globalThis.localStorage !== 'undefined';
  } catch {
    return false;
  }
};

const loadStoredToken = () => {
  if (!canUseLocalStorage()) return null;
  return globalThis.localStorage.getItem(TOKEN_STORAGE_KEY);
};

const storeToken = (token: string | null) => {
  if (!canUseLocalStorage()) return;

  if (token) {
    globalThis.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    return;
  }

  globalThis.localStorage.removeItem(TOKEN_STORAGE_KEY);
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = loadStoredToken();
    setToken(storedToken);
    setApiAuthToken(storedToken);
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const nextToken = await apiLogin(username, password);
    setToken(nextToken);
    setApiAuthToken(nextToken);
    storeToken(nextToken);
  };

  const logout = async () => {
    setToken(null);
    setApiAuthToken(null);
    storeToken(null);
  };

  const value = useMemo(
    () => ({
      isLoading,
      isAuthenticated: Boolean(token),
      token,
      login,
      logout,
    }),
    [isLoading, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }

  return context;
}
