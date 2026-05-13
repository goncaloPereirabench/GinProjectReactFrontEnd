import { useQuery } from "@tanstack/react-query";
import { Link, NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, LogOut, ShoppingCart, Store, UserRound } from "lucide-react";
import { healthApi } from "../api/health";
import { useAuth } from "../features/auth/authContext";
import { Button } from "./ui/Button";
import { classNames } from "../lib/format";

type NavItem = {
  to: string;
  label: string;
  protected?: boolean;
};

const navItems: NavItem[] = [
  { to: "/products", label: "Products" },
  { to: "/cart", label: "Cart", protected: true },
  { to: "/manage/store", label: "Manage store", protected: true },
];

export function AppLayout() {
  const { isAuthenticated, logout, session } = useAuth();
  const health = useQuery({
    queryKey: ["health", "ready"],
    queryFn: healthApi.ready,
    refetchInterval: 60_000,
  });

  return (
    <div className="min-h-screen bg-[#f7f5ef]">
      <header className="border-b border-ink-950/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link className="flex items-center gap-3 text-ink-950" to="/products">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-market-600 text-white">
                <Store className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-base font-bold leading-5">Gin Grocery</span>
                <span className="block text-xs text-ink-600">React + Go API</span>
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <span
                className={classNames(
                  "hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-flex",
                  health.isError
                    ? "bg-red-50 text-red-700"
                    : health.isSuccess
                      ? "bg-market-100 text-market-700"
                      : "bg-stone-100 text-ink-600",
                )}
              >
                API {health.isError ? "offline" : health.isSuccess ? "ready" : "checking"}
              </span>

              {isAuthenticated ? (
                <>
                  <span className="hidden items-center gap-2 text-sm text-ink-600 md:inline-flex">
                    <UserRound className="h-4 w-4" aria-hidden="true" />
                    {session?.user.email}
                  </span>
                  <Button icon={<LogOut className="h-4 w-4" />} variant="ghost" onClick={logout}>
                    Sign out
                  </Button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link
                    className="inline-flex min-h-10 items-center justify-center rounded-md px-4 text-sm font-semibold text-ink-800 transition hover:bg-ink-950/5"
                    to="/login"
                  >
                    Sign in
                  </Link>
                  <Link
                    className="hidden min-h-10 items-center justify-center rounded-md border border-ink-950/10 bg-white px-4 text-sm font-semibold text-ink-950 transition hover:bg-stone-50 sm:inline-flex"
                    to="/register"
                  >
                    Create account
                  </Link>
                </div>
              )}
            </div>
          </div>

          <nav className="flex flex-wrap gap-2">
            {navItems
              .filter((item) => !item.protected || isAuthenticated)
              .map((item) => (
                <NavLink
                  className={({ isActive }) =>
                    classNames(
                      "inline-flex min-h-9 items-center rounded-md px-3 text-sm font-semibold transition",
                      isActive ? "bg-ink-950 text-white" : "text-ink-600 hover:bg-ink-950/5 hover:text-ink-950",
                    )
                  }
                  key={item.to}
                  to={item.to}
                >
                  {item.label === "Cart" ? <ShoppingCart className="mr-2 h-4 w-4" aria-hidden="true" /> : null}
                  {item.label === "Manage store" ? <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden="true" /> : null}
                  {item.label}
                </NavLink>
              ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
