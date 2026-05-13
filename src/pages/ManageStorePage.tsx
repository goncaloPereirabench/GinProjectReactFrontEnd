import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Edit3, PackagePlus, Trash2 } from "lucide-react";
import { productKeys, productsApi } from "../api/products";
import { PageHeader } from "../components/PageHeader";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { EmptyState, LoadingState } from "../components/ui/StateBlock";
import { useToast } from "../components/ui/toastContext";
import { formatCents } from "../lib/format";
import { getErrorMessage } from "../lib/errors";

export function ManageStorePage() {
  const queryClient = useQueryClient();
  const { notify } = useToast();

  const products = useQuery({
    queryKey: productKeys.list({ limit: 100, includeInactive: true }),
    queryFn: () => productsApi.list({ limit: 100, includeInactive: true }),
  });

  const deleteProduct = useMutation({
    mutationFn: (productId: string) => productsApi.remove(productId),
    onSuccess: async (_, productId) => {
      const productName = products.data?.items.find((product) => product.id === productId)?.name || "Product";
      await queryClient.invalidateQueries({ queryKey: productKeys.all });
      notify({
        title: "Product deleted",
        message: `${productName} was removed from the store.`,
        tone: "success",
      });
    },
  });

  function handleDelete(productId: string, productName: string) {
    if (window.confirm(`Delete ${productName}? This cannot be undone.`)) {
      deleteProduct.mutate(productId);
    }
  }

  return (
    <>
      <PageHeader
        actions={
          <Link
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-market-600 px-4 text-sm font-semibold text-white transition hover:bg-market-700"
            to="/manage/store/products/new"
          >
            <PackagePlus className="h-4 w-4" aria-hidden="true" />
            New product
          </Link>
        }
        description="Create products and maintain stock here. The shopping product catalog stays focused on customers and cart actions."
        eyebrow="Store management"
        title="Manage store"
      />

      {products.isLoading ? <LoadingState title="Loading store inventory" /> : null}
      {products.isError ? <Alert tone="error">{getErrorMessage(products.error)}</Alert> : null}
      {deleteProduct.isError ? (
        <div className="mb-6">
          <Alert tone="error">{getErrorMessage(deleteProduct.error)}</Alert>
        </div>
      ) : null}

      {products.isSuccess && products.data.items.length === 0 ? (
        <EmptyState title="No inventory yet">Create the first product for the store catalog.</EmptyState>
      ) : null}

      {products.isSuccess && products.data.items.length > 0 ? (
        <section className="overflow-hidden rounded-md border border-ink-950/10 bg-white">
          <div className="hidden grid-cols-[1fr_110px_90px_90px_112px] gap-4 border-b border-ink-950/10 bg-stone-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-ink-600 md:grid">
            <span>Product</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {products.data.items.map((product) => (
            <div
              className="grid grid-cols-1 gap-4 border-b border-ink-950/10 px-5 py-4 last:border-b-0 md:grid-cols-[1fr_110px_90px_90px_112px] md:items-center"
              key={product.id}
            >
              <div className="min-w-0">
                <Link className="font-bold text-ink-950 hover:text-market-700" to={`/products/${product.id}`}>
                  {product.name}
                </Link>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-600">{product.sku}</p>
              </div>
              <span className="text-sm font-semibold text-ink-950">{formatCents(product.price_cents)}</span>
              <span className={product.stock > 0 ? "text-sm font-semibold text-market-700" : "text-sm font-semibold text-red-700"}>
                {product.stock}
              </span>
              <span className={product.active ? "text-sm text-ink-600" : "text-sm font-semibold text-red-700"}>
                {product.active ? "Active" : "Inactive"}
              </span>
              <div className="flex gap-2">
                <Link
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-ink-950/10 bg-white text-ink-800 transition hover:bg-stone-50"
                  to={`/manage/store/products/${product.id}/edit`}
                  title="Edit product"
                >
                  <Edit3 className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Button
                  aria-label={`Delete ${product.name}`}
                  className="h-10 w-10 px-0"
                  icon={<Trash2 className="h-4 w-4" />}
                  isLoading={deleteProduct.isPending && deleteProduct.variables === product.id}
                  onClick={() => handleDelete(product.id, product.name)}
                  variant="danger"
                />
              </div>
            </div>
          ))}
        </section>
      ) : null}
    </>
  );
}
