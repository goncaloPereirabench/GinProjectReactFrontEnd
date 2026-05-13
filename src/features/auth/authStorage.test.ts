import { describe, expect, it } from "vitest";
import { getStoredSession, removeStoredSession, storeSession } from "./authStorage";
import type { AuthSession } from "./authStorage";

function session(expiresAt: string): AuthSession {
  return {
    user: {
      id: "user-1",
      email: "buyer@example.com",
      role: "customer",
    },
    token: {
      access_token: "token-123",
      token_type: "Bearer",
      expires_at: expiresAt,
    },
  };
}

describe("authStorage", () => {
  it("stores and reads a valid JWT session", () => {
    const validSession = session(new Date(Date.now() + 60_000).toISOString());

    storeSession(validSession);

    expect(getStoredSession()).toEqual(validSession);
  });

  it("removes expired JWT sessions", () => {
    storeSession(session(new Date(Date.now() - 60_000).toISOString()));

    expect(getStoredSession()).toBeNull();
  });

  it("removes the stored session explicitly", () => {
    storeSession(session(new Date(Date.now() + 60_000).toISOString()));

    removeStoredSession();

    expect(getStoredSession()).toBeNull();
  });
});
