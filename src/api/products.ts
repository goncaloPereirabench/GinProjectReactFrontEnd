import type { Product, ProductListResponse, ProductPayload } from "./types";
import { apiRequest } from "./http";

type ProductFilter = {
  q?: string;
  limit?: number;
  offset?: number;
  includeInactive?: boolean;
};

export const productKeys = {
  all: ["products"] as const,
  list: (filter: ProductFilter) => [...productKeys.all, "list", filter] as const,
  detail: (id: string) => [...productKeys.all, "detail", id] as const,
};

export const productsApi = {
  list(filter: ProductFilter = {}) {
    const params = new URLSearchParams();
    if (filter.q) params.set("q", filter.q);
    if (filter.limit) params.set("limit", String(filter.limit));
    if (filter.offset) params.set("offset", String(filter.offset));
    if (filter.includeInactive) params.set("include_inactive", "true");

    const query = params.toString();
    return apiRequest<ProductListResponse>(`/v1/products${query ? `?${query}` : ""}`, {
      auth: false,
    });
  },

  get(id: string) {
    return apiRequest<Product>(`/v1/products/${id}`, { auth: false });
  },

  create(payload: ProductPayload) {
    return apiRequest<Product>("/v1/products", {
      method: "POST",
      body: payload,
    });
  },

  update(id: string, payload: ProductPayload) {
    return apiRequest<Product>(`/v1/products/${id}`, {
      method: "PUT",
      body: payload,
    });
  },

  remove(id: string) {
    return apiRequest<void>(`/v1/products/${id}`, {
      method: "DELETE",
    });
  },
};
