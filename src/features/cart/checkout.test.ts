import { describe, expect, it } from "vitest";
import { buildCheckoutProductPayload, getNextCartQuantity } from "./checkout";
import type { Cart, Product } from "../../api/types";

const product: Product = {
  id: "product-1",
  name: "Honeycrisp Apples",
  sku: "APL-HONEY",
  description: "Fresh apples",
  price_cents: 349,
  stock: 8,
  active: true,
  created_at: "2026-05-13T10:00:00Z",
  updated_at: "2026-05-13T10:00:00Z",
};

describe("buildCheckoutProductPayload", () => {
  it("preserves product fields and decrements stock", () => {
    expect(buildCheckoutProductPayload(product, 3)).toEqual({
      name: "Honeycrisp Apples",
      sku: "APL-HONEY",
      description: "Fresh apples",
      price_cents: 349,
      stock: 5,
      active: true,
    });
  });

  it("throws when the cart quantity exceeds current stock", () => {
    expect(() => buildCheckoutProductPayload(product, 9)).toThrow("Honeycrisp Apples only has 8 in stock.");
  });
});

describe("getNextCartQuantity", () => {
  const cart: Cart = {
    user_id: "user-1",
    total_cents: 698,
    items: [
      {
        product_id: "product-1",
        product_name: "Honeycrisp Apples",
        quantity: 2,
        unit_price: 349,
        line_total: 698,
      },
    ],
  };

  it("increments the existing cart quantity", () => {
    expect(getNextCartQuantity(cart, "product-1", 8)).toBe(3);
  });

  it("starts at one when the product is not in the cart", () => {
    expect(getNextCartQuantity(cart, "product-2", 8)).toBe(1);
  });

  it("caps the quantity at the available stock", () => {
    expect(getNextCartQuantity(cart, "product-1", 2)).toBe(2);
  });
});
