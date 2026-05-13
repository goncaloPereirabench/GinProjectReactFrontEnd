import type { AuthResponse } from "./types";
import { apiRequest } from "./http";

type AuthPayload = {
  email: string;
  password: string;
};

export const authApi = {
  register(payload: AuthPayload) {
    return apiRequest<AuthResponse>("/v1/auth/register", {
      method: "POST",
      auth: false,
      body: payload,
    });
  },

  login(payload: AuthPayload) {
    return apiRequest<AuthResponse>("/v1/auth/login", {
      method: "POST",
      auth: false,
      body: payload,
    });
  },
};
