"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  type ReactNode,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import { login, registerUser } from "@/lib/api/auth";
import { setUnauthorizedHandler } from "@/lib/api/http";
import { queryKeys } from "@/lib/api/query-keys";
import type { RegisterUserPayload, UserRead } from "@/lib/api/types";
import { getMe } from "@/lib/api/users";
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken,
} from "@/lib/auth/token-storage";
import { ApiError } from "@/lib/errors/api-error";

type AuthContextValue = {
  token: string | null;
  user: UserRead | null;
  hasToken: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: unknown;
  login: (username: string, password: string) => Promise<UserRead>;
  logout: () => void;
  register: (payload: RegisterUserPayload) => Promise<UserRead>;
  refreshUser: () => Promise<UserRead | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null | undefined>(undefined);

  const clearSession = useCallback(() => {
    clearStoredAccessToken();

    startTransition(() => {
      setToken(null);
    });

    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    setToken(getStoredAccessToken());
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => clearSession);
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const meQuery = useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: getMe,
    enabled: Boolean(token),
  });

  useEffect(() => {
    if (meQuery.error instanceof ApiError && meQuery.error.status === 401) {
      clearSession();
    }
  }, [meQuery.error, clearSession]);

  const refreshUser = useCallback(async () => {
    if (!getStoredAccessToken()) {
      return null;
    }

    return queryClient.fetchQuery({
      queryKey: queryKeys.users.me(),
      queryFn: getMe,
    });
  }, [queryClient]);

  const handleLogin = useCallback(
    async (username: string, password: string) => {
      const authToken = await login(username, password);
      setStoredAccessToken(authToken.access_token);

      startTransition(() => {
        setToken(authToken.access_token);
      });

      const user = await queryClient.fetchQuery({
        queryKey: queryKeys.users.me(),
        queryFn: getMe,
      });

      toast.success(`Welcome back, ${user.name || user.username}.`);
      return user;
    },
    [queryClient],
  );

  const handleLogout = useCallback(() => {
    clearSession();
    toast.message("You have been signed out.");
  }, [clearSession]);

  const handleRegister = useCallback((payload: RegisterUserPayload) => {
    return registerUser(payload);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: token ?? null,
      user: meQuery.data ?? null,
      hasToken: Boolean(token),
      isAuthenticated: Boolean(token && meQuery.data),
      isLoading: token === undefined || (Boolean(token) && meQuery.isPending),
      authError: meQuery.error,
      login: handleLogin,
      logout: handleLogout,
      register: handleRegister,
      refreshUser,
    }),
    [
      token,
      meQuery.data,
      meQuery.isPending,
      meQuery.error,
      handleLogin,
      handleLogout,
      handleRegister,
      refreshUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
