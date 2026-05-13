import { Link } from "react-router-dom";
import { EmptyState } from "../components/ui/StateBlock";

export function NotFoundPage() {
  return (
    <EmptyState title="Page not found">
      <Link className="font-semibold text-market-700 hover:text-market-600" to="/products">
        Return to products
      </Link>
    </EmptyState>
  );
}
