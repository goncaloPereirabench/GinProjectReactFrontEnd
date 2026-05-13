import { Link } from "react-router-dom";
import { Edit3, ShoppingCart } from "lucide-react";
import type { Product } from "../api/types";
import { formatCents } from "../lib/format";
import { Button } from "./ui/Button";

type ProductCardProps = {
  product: Product;
  canManage: boolean;
  isAdding?: boolean;
  onAddToCart?: () => void;
};

export function ProductCard({ canManage, isAdding, onAddToCart, product }: ProductCardProps) {
  return (
    <article className="flex h-full flex-col rounded-md border border-ink-950/10 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link className="text-lg font-bold text-ink-950 hover:text-market-700" to={`/products/${product.id}`}>
            {product.name}
          </Link>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-600">{product.sku}</p>
        </div>
        <span className="rounded-full bg-citrus-100 px-2.5 py-1 text-xs font-bold text-ink-800">
          {formatCents(product.price_cents)}
        </span>
      </div>

      <p className="mt-3 line-clamp-3 min-h-16 text-sm leading-6 text-ink-600">
        {product.description || "No description provided."}
      </p>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className={product.stock > 0 ? "font-semibold text-market-700" : "font-semibold text-red-700"}>
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </span>
        <span className={product.active ? "text-ink-600" : "text-red-700"}>{product.active ? "Active" : "Inactive"}</span>
      </div>

      <div className="mt-5 flex gap-2">
        <Button
          className="flex-1"
          disabled={product.stock <= 0 || !onAddToCart}
          icon={<ShoppingCart className="h-4 w-4" aria-hidden="true" />}
          isLoading={isAdding}
          onClick={onAddToCart}
        >
          Add
        </Button>
        {canManage ? (
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-ink-950/10 bg-white px-3 text-sm font-semibold text-ink-950 transition hover:bg-stone-50"
            to={`/manage/store/products/${product.id}/edit`}
            title="Edit product"
          >
            <Edit3 className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
