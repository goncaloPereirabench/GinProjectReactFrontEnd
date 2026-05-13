import { cartApi } from "../../api/cart";
import { productsApi } from "../../api/products";
import type { Cart, Product, ProductPayload } from "../../api/types";

export function getNextCartQuantity(cart: Cart, productId: string, maxQuantity = 999) {
  const currentQuantity = cart.items.find((item) => item.product_id === productId)?.quantity ?? 0;
  return Math.min(currentQuantity + 1, maxQuantity);
}

export async function addOneToCart(productId: string, maxQuantity = 999) {
  const cart = await cartApi.get();
  return cartApi.setItem(productId, getNextCartQuantity(cart, productId, maxQuantity));
}

export function buildCheckoutProductPayload(product: Product, quantity: number): ProductPayload {
  if (quantity > product.stock) {
    throw new Error(`${product.name} only has ${product.stock} in stock.`);
  }

  return {
    name: product.name,
    sku: product.sku,
    description: product.description,
    price_cents: product.price_cents,
    stock: product.stock - quantity,
    active: product.active,
  };
}

export async function checkoutCart(cart: Cart) {
  for (const item of cart.items) {
    const product = await productsApi.get(item.product_id);
    await productsApi.update(item.product_id, buildCheckoutProductPayload(product, item.quantity));
  }

  await cartApi.clear();
}
