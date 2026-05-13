import { env } from "../lib/env";
import { getStoredSession, removeStoredSession } from "../features/auth/authStorage";
import type { ApiErrorBody } from "./types";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message || body.error || "Request failed");
    this.name = "ApiError";
    this.status = status;
    this.code = body.error;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, body, headers: requestHeaders, ...requestInit } = options;
  const headers = new Headers(requestHeaders);
  const session = getStoredSession();

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  // Keep token attachment in one place so pages and mutations do not duplicate auth plumbing.
  if (auth && session?.token.access_token) {
    headers.set("Authorization", `${session.token.token_type} ${session.token.access_token}`);
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...requestInit,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 401) {
    removeStoredSession();
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function readError(response: Response): Promise<ApiErrorBody> {
  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return {
      error: "request_failed",
      message: `Request failed with HTTP ${response.status}`,
    };
  }
}
