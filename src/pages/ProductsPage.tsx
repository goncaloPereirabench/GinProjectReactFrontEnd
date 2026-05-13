import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { cartKeys } from "../api/cart";
import { productKeys, productsApi } from "../api/products";
import { ProductCard } from "../components/ProductCard";
import { PageHeader } from "../components/PageHeader";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { EmptyState, LoadingState } from "../components/ui/StateBlock";
import { useAuth } from "../features/auth/authContext";
import { addOneToCart } from "../features/cart/checkout";
import { useToast } from "../components/ui/toastContext";
import { getErrorMessage } from "../lib/errors";

export function ProductsPage() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { notify } = useToast();
  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState("");

  const products = useQuery({
    queryKey: productKeys.list({ q: search, limit: 50 }),
    queryFn: () => productsApi.list({ q: search, limit: 50 }),
  });

  const addToCart = useMutation({
    mutationFn: (product: { id: string; stock: number }) => addOneToCart(product.id, product.stock),
    onSuccess: (nextCart, product) => {
      const productName = products.data?.items.find((item) => item.id === product.id)?.name || "Product";
      queryClient.setQueryData(cartKeys.current, nextCart);
      notify({
        title: "Added to cart",
        message: `${productName} is now in your cart.`,
        tone: "success",
      });
    },
  });

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(draftSearch.trim());
  }

  return (
    <>
      <PageHeader
        description="Browse active products and add them to your cart. Inventory creation and edits live in the manage store section."
        eyebrow="Inventory"
        title="Products"
      />

      <form className="mb-6 flex flex-col gap-3 rounded-md border border-ink-950/10 bg-white p-4 sm:flex-row" onSubmit={onSearch}>
        <label className="min-w-0 flex-1 text-sm font-medium text-ink-800">
          Search products
          <input
            className="mt-1 w-full rounded-md border border-ink-950/10 px-3 py-2 text-sm outline-none focus:border-market-600 focus:ring-2 focus:ring-market-600/20"
            onChange={(event) => setDraftSearch(event.target.value)}
            placeholder="Apple, bread, SKU..."
            value={draftSearch}
          />
        </label>
        <div className="flex items-end gap-2">
          <Button icon={<Search className="h-4 w-4" />} type="submit">
            Search
          </Button>
          {search ? (
            <Button
              variant="ghost"
              onClick={() => {
                setDraftSearch("");
                setSearch("");
              }}
            >
              Clear
            </Button>
          ) : null}
        </div>
      </form>

      {addToCart.isError ? <Alert tone="error">{getErrorMessage(addToCart.error)}</Alert> : null}

      <div className="mt-6">
        {products.isLoading ? <LoadingState title="Loading products" /> : null}
        {products.isError ? <Alert tone="error">{getErrorMessage(products.error)}</Alert> : null}
        {products.isSuccess && products.data.items.length === 0 ? (
          <EmptyState title="No products found">
            {search ? "Try a different search term." : "Create a product after signing in, or start the API with seeded data."}
          </EmptyState>
        ) : null}
        {products.isSuccess && products.data.items.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.data.items.map((product) => (
              <ProductCard
                canManage={false}
                isAdding={addToCart.isPending && addToCart.variables?.id === product.id}
                key={product.id}
                onAddToCart={isAuthenticated ? () => addToCart.mutate({ id: product.id, stock: product.stock }) : undefined}
                product={product}
              />
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}
