export const env = {
  // Empty by default so Vite dev proxy and same-origin container proxy can handle /v1 and /health.
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "",
};
