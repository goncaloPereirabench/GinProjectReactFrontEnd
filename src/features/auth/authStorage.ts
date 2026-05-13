import type { AuthResponse } from "../../api/types";

const STORAGE_KEY = "gin-grocery.session";
export const SESSION_CLEARED_EVENT = "gin-grocery.session-cleared";

export type AuthSession = AuthResponse;

export function getStoredSession(): AuthSession | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as AuthSession;
    if (isExpired(session.token.expires_at)) {
      removeStoredSession();
      return null;
    }
    return session;
  } catch {
    removeStoredSession();
    return null;
  }
}

export function storeSession(session: AuthSession) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function removeStoredSession() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(SESSION_CLEARED_EVENT));
}

export function isExpired(expiresAt: string) {
  return new Date(expiresAt).getTime() <= Date.now();
}
