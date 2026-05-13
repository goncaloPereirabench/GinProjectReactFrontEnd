import type { HealthResponse } from "./types";
import { apiRequest } from "./http";

export const healthApi = {
  ready() {
    return apiRequest<HealthResponse>("/health/ready", { auth: false });
  },
};
