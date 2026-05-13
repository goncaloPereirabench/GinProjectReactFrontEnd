import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "./AuthProvider";
import { ProtectedRoute } from "./ProtectedRoute";
import { storeSession } from "./authStorage";

function renderProtectedRoute(initialPath = "/cart") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter
          future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
          initialEntries={[initialPath]}
        >
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/cart" element={<div>Protected cart</div>} />
            </Route>
            <Route path="/login" element={<div>Login screen</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe("ProtectedRoute", () => {
  it("redirects anonymous users to login", () => {
    renderProtectedRoute();

    expect(screen.getByText("Login screen")).toBeInTheDocument();
  });

  it("renders protected content for authenticated users", () => {
    storeSession({
      user: { id: "user-1", email: "buyer@example.com", role: "customer" },
      token: {
        access_token: "access-token",
        token_type: "Bearer",
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      },
    });

    renderProtectedRoute();

    expect(screen.getByText("Protected cart")).toBeInTheDocument();
  });
});
