import { afterEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "./http";
import { storeSession } from "../features/auth/authStorage";

describe("apiRequest", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("attaches the bearer token for authenticated API calls", async () => {
    storeSession({
      user: { id: "user-1", email: "buyer@example.com", role: "customer" },
      token: {
        access_token: "access-token",
        token_type: "Bearer",
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      },
    });

    const fetchMock = vi.spyOn(window, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await apiRequest<{ ok: boolean }>("/v1/cart");

    const [, init] = fetchMock.mock.calls[0];
    expect((init?.headers as Headers).get("Authorization")).toBe("Bearer access-token");
  });

  it("does not attach auth headers when auth is disabled", async () => {
    storeSession({
      user: { id: "user-1", email: "buyer@example.com", role: "customer" },
      token: {
        access_token: "access-token",
        token_type: "Bearer",
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      },
    });

    const fetchMock = vi.spyOn(window, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ items: [], count: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await apiRequest("/v1/products", { auth: false });

    const [, init] = fetchMock.mock.calls[0];
    expect((init?.headers as Headers).has("Authorization")).toBe(false);
  });

  it("throws the backend error shape for failed responses", async () => {
    vi.spyOn(window, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "invalid_credentials", message: "email or password is incorrect" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(apiRequest("/v1/auth/login", { method: "POST", auth: false })).rejects.toMatchObject({
      status: 401,
      code: "invalid_credentials",
      message: "email or password is incorrect",
    });
  });
});
