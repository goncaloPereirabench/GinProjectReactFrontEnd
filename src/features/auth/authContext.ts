import { createContext, useContext } from "react";
import type { AuthResponse } from "../../api/types";

export type Credentials = {
  email: string;
  password: string;
};

export type AuthContextValue = {
  session: AuthResponse | null;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<AuthResponse>;
  register: (credentials: Credentials) => Promise<AuthResponse>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
