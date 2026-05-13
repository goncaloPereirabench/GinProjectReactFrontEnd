import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CreditCard, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { cartApi, cartKeys } from "../api/cart";
import { productKeys } from "../api/products";
import { PageHeader } from "../components/PageHeader";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { EmptyState, LoadingState } from "../components/ui/StateBlock";
import { checkoutCart } from "../features/cart/checkout";
import { useToast } from "../components/ui/toastContext";
import { formatCents } from "../lib/format";
import { getErrorMessage } from "../lib/errors";

export function CartPage() {
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const [purchaseCompleted, setPurchaseCompleted] = useState(false);

  const cart = useQuery({
    queryKey: cartKeys.current,
    queryFn: cartApi.get,
  });

  const setQuantity = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) => cartApi.setItem(productId, quantity),
    onSuccess: (nextCart) => queryClient.setQueryData(cartKeys.current, nextCart),
  });

  const removeItem = useMutation({
    mutationFn: (productId: string) => cartApi.removeItem(productId),
    onSuccess: (nextCart) => queryClient.setQueryData(cartKeys.current, nextCart),
  });

  const clearCart = useMutation({
    mutationFn: cartApi.clear,
    onSuccess: () => {
      setPurchaseCompleted(false);
      queryClient.setQueryData(cartKeys.current, { items: [], total_cents: 0, user_id: cart.data?.user_id || "" });
    },
  });

  const checkout = useMutation({
    mutationFn: async () => {
      if (!cart.data || cart.data.items.length === 0) return;
      await checkoutCart(cart.data);
    },
    onSuccess: async () => {
      setPurchaseCompleted(true);
      queryClient.setQueryData(cartKeys.current, { items: [], total_cents: 0, user_id: cart.data?.user_id || "" });
      await queryClient.invalidateQueries({ queryKey: productKeys.all });
      notify({
        title: "Purchase completed",
        message: "Your cart was checked out and product stock was updated.",
        tone: "success",
      });
    },
  });

  return (
    <>
      <PageHeader
        actions={
          cart.data?.items.length ? (
            <Button icon={<Trash2 className="h-4 w-4" />} isLoading={clearCart.isPending} onClick={() => clearCart.mutate()} variant="danger">
              Clear cart
            </Button>
          ) : null
        }
        description="Review your cart and finish the purchase. Checkout updates product stock through the existing Go API product update route."
        eyebrow="Protected route"
        title="Cart"
      />

      {purchaseCompleted ? (
        <div className="mb-6">
          <Alert tone="success" title="Purchase completed">
            Your purchase was completed and the product stock was updated.
          </Alert>
        </div>
      ) : null}

      {cart.isLoading ? <LoadingState title="Loading cart" /> : null}
      {cart.isError ? <Alert tone="error">{getErrorMessage(cart.error)}</Alert> : null}
      {setQuantity.isError ? <Alert tone="error">{getErrorMessage(setQuantity.error)}</Alert> : null}
      {removeItem.isError ? <Alert tone="error">{getErrorMessage(removeItem.error)}</Alert> : null}
      {clearCart.isError ? <Alert tone="error">{getErrorMessage(clearCart.error)}</Alert> : null}
      {checkout.isError ? <Alert tone="error">{getErrorMessage(checkout.error)}</Alert> : null}

      {cart.isSuccess && cart.data.items.length === 0 ? (
        <EmptyState title="Your cart is empty">
          <Link className="font-semibold text-market-700 hover:text-market-600" to="/products">
            Browse products
          </Link>{" "}
          and add grocery items when the API has inventory.
        </EmptyState>
      ) : null}

      {cart.isSuccess && cart.data.items.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="overflow-hidden rounded-md border border-ink-950/10 bg-white">
            {cart.data.items.map((item) => (
              <div className="grid gap-4 border-b border-ink-950/10 p-5 last:border-b-0 md:grid-cols-[1fr_auto]" key={item.product_id}>
                <div>
                  <Link className="font-bold text-ink-950 hover:text-market-700" to={`/products/${item.product_id}`}>
                    {item.product_name}
                  </Link>
                  <p className="mt-1 text-sm text-ink-600">
                    {formatCents(item.unit_price)} each - {formatCents(item.line_total)} line total
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    aria-label={`Decrease ${item.product_name}`}
                    icon={<Minus className="h-4 w-4" />}
                    isLoading={setQuantity.isPending && setQuantity.variables?.productId === item.product_id}
                    onClick={() => setQuantity.mutate({ productId: item.product_id, quantity: Math.max(item.quantity - 1, 0) })}
                    variant="secondary"
                  />
                  <span className="min-w-10 text-center text-sm font-bold text-ink-950">{item.quantity}</span>
                  <Button
                    aria-label={`Increase ${item.product_name}`}
                    icon={<ShoppingBag className="h-4 w-4" />}
                    isLoading={setQuantity.isPending && setQuantity.variables?.productId === item.product_id}
                    onClick={() => setQuantity.mutate({ productId: item.product_id, quantity: Math.min(item.quantity + 1, 999) })}
                    variant="secondary"
                  />
                  <Button
                    aria-label={`Remove ${item.product_name}`}
                    icon={<Trash2 className="h-4 w-4" />}
                    isLoading={removeItem.isPending && removeItem.variables === item.product_id}
                    onClick={() => removeItem.mutate(item.product_id)}
                    variant="ghost"
                  />
                </div>
              </div>
            ))}
          </section>

          <aside className="h-fit rounded-md border border-ink-950/10 bg-white p-5 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-600">Order total</p>
            <p className="mt-2 text-3xl font-bold text-ink-950">{formatCents(cart.data.total_cents)}</p>
            <p className="mt-3 text-sm leading-6 text-ink-600">
              This demo checkout decrements stock and clears the cart. A production backend would usually expose a single
              transactional checkout endpoint.
            </p>
            <Button
              className="mt-5 w-full"
              icon={<CreditCard className="h-4 w-4" />}
              isLoading={checkout.isPending}
              onClick={() => checkout.mutate()}
            >
              Finish purchase
            </Button>
          </aside>
        </div>
      ) : null}
    </>
  );
}
