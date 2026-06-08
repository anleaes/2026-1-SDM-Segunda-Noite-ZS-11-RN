import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { apiAuthStatus, apiLogin, apiLogout } from '../services/api';

type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const LEGACY_TOKEN_STORAGE_KEY = 'gestao-contratos:auth-token';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const clearLegacyLocalStorageToken = () => {
  try {
    globalThis.localStorage?.removeItem(LEGACY_TOKEN_STORAGE_KEY);
  } catch {
    return;
  }
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      clearLegacyLocalStorageToken();
      const authenticated = await apiAuthStatus();
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    };

    loadSession().catch(() => {
      setIsAuthenticated(false);
      setIsLoading(false);
    });
  }, []);

  const login = async (username: string, password: string) => {
    await apiLogin(username, password);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      setIsAuthenticated(false);
    }
  };

  const value = useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      login,
      logout,
    }),
    [isAuthenticated, isLoading]
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
