import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { apiAuthStatus, apiLogin, apiLogout } from '../services/api';
import { UserProfile } from '../constants/access';

type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  username: string | null;
  profile: UserProfile | null;
  employeeId: number | null;
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
  const [username, setUsername] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(null);

  const applySession = (session: Awaited<ReturnType<typeof apiAuthStatus>>) => {
    setIsAuthenticated(Boolean(session?.authenticated));
    setUsername(session?.username ?? null);
    setProfile(session?.profile ?? null);
    setEmployeeId(session?.employee_id ?? null);
  };

  useEffect(() => {
    const loadSession = async () => {
      clearLegacyLocalStorageToken();
      const session = await apiAuthStatus();
      applySession(session);
      setIsLoading(false);
    };

    loadSession().catch(() => {
      setIsAuthenticated(false);
      setUsername(null);
      setProfile(null);
      setEmployeeId(null);
      setIsLoading(false);
    });
  }, []);

  const login = async (username: string, password: string) => {
    const session = await apiLogin(username, password);
    applySession(session);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      setIsAuthenticated(false);
      setUsername(null);
      setProfile(null);
      setEmployeeId(null);
    }
  };

  const value = useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      username,
      profile,
      employeeId,
      login,
      logout,
    }),
    [employeeId, isAuthenticated, isLoading, profile, username]
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
