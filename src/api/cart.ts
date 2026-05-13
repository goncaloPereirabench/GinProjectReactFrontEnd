import type { Cart } from "./types";
import { apiRequest } from "./http";

export const cartKeys = {
  current: ["cart", "current"] as const,
};

export const cartApi = {
  get() {
    return apiRequest<Cart>("/v1/cart");
  },

  setItem(productId: string, quantity: number) {
    return apiRequest<Cart>(`/v1/cart/items/${productId}`, {
      method: "PUT",
      body: { quantity },
    });
  },

  removeItem(productId: string) {
    return apiRequest<Cart>(`/v1/cart/items/${productId}`, {
      method: "DELETE",
    });
  },

  clear() {
    return apiRequest<void>("/v1/cart", {
      method: "DELETE",
    });
  },
};
