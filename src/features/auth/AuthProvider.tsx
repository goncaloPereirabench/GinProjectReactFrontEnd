import { useQueryClient } from "@tanstack/react-query";
import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import { authApi } from "../../api/auth";
import { AuthResponse } from "../../api/types";
import { AuthContext, type Credentials } from "./authContext";
import { getStoredSession, removeStoredSession, SESSION_CLEARED_EVENT, storeSession } from "./authStorage";

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<AuthResponse | null>(() => getStoredSession());

  const applySession = useCallback((nextSession: AuthResponse) => {
    storeSession(nextSession);
    setSession(nextSession);
    return nextSession;
  }, []);

  const login = useCallback(
    async (credentials: Credentials) => applySession(await authApi.login(credentials)),
    [applySession],
  );

  const register = useCallback(
    async (credentials: Credentials) => applySession(await authApi.register(credentials)),
    [applySession],
  );

  const logout = useCallback(() => {
    removeStoredSession();
    setSession(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    function handleSessionCleared() {
      setSession(null);
      queryClient.clear();
    }

    window.addEventListener(SESSION_CLEARED_EVENT, handleSessionCleared);
    return () => window.removeEventListener(SESSION_CLEARED_EVENT, handleSessionCleared);
  }, [queryClient]);

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      login,
      register,
      logout,
    }),
    [login, logout, register, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
