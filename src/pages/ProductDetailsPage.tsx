import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { cartKeys } from "../api/cart";
import { productKeys, productsApi } from "../api/products";
import { PageHeader } from "../components/PageHeader";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { LoadingState } from "../components/ui/StateBlock";
import { useAuth } from "../features/auth/authContext";
import { addOneToCart } from "../features/cart/checkout";
import { useToast } from "../components/ui/toastContext";
import { formatCents, formatDate } from "../lib/format";
import { getErrorMessage } from "../lib/errors";

export function ProductDetailsPage() {
  const { id = "" } = useParams();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { notify } = useToast();

  const product = useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.get(id),
    enabled: Boolean(id),
  });

  const addToCart = useMutation({
    mutationFn: () => addOneToCart(id, product.data?.stock ?? 999),
    onSuccess: (nextCart) => {
      queryClient.setQueryData(cartKeys.current, nextCart);
      notify({
        title: "Added to cart",
        message: `${product.data?.name || "Product"} is now in your cart.`,
        tone: "success",
      });
    },
  });

  if (product.isLoading) {
    return <LoadingState title="Loading product" />;
  }

  if (product.isError) {
    return <Alert tone="error">{getErrorMessage(product.error)}</Alert>;
  }

  if (!product.data) {
    return null;
  }

  return (
    <>
      <PageHeader
        description={product.data.description || "No product description is currently set."}
        eyebrow={product.data.sku}
        title={product.data.name}
      />

      {addToCart.isError ? <Alert tone="error">{getErrorMessage(addToCart.error)}</Alert> : null}

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Price" value={formatCents(product.data.price_cents)} />
        <Metric label="Stock" value={String(product.data.stock)} />
        <Metric label="Status" value={product.data.active ? "Active" : "Inactive"} />
        <Metric label="Updated" value={formatDate(product.data.updated_at)} />
      </section>

      <div className="mt-6 rounded-md border border-ink-950/10 bg-white p-6">
        <h2 className="text-lg font-bold text-ink-950">Cart action</h2>
        <p className="mt-2 text-sm leading-6 text-ink-600">
          Cart endpoints are protected by the same bearer token middleware as product writes.
        </p>
        <div className="mt-4">
          <Button
            disabled={!isAuthenticated || product.data.stock <= 0}
            icon={<ShoppingCart className="h-4 w-4" />}
            isLoading={addToCart.isPending}
            onClick={() => addToCart.mutate()}
          >
            Add one to cart
          </Button>
          {!isAuthenticated ? (
            <p className="mt-2 text-sm text-ink-600">
              <Link className="font-semibold text-market-700" to="/login">
                Sign in
              </Link>{" "}
              to use the cart.
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink-950/10 bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-ink-600">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink-950">{value}</p>
    </div>
  );
}
