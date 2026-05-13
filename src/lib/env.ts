export const env = {
  // In development this can stay empty so Vite proxies /v1 and /health.
  // In production the Docker build receives VITE_API_BASE_URL and bakes it into the static bundle.
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "",
};
