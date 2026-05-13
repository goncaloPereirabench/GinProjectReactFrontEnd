import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../features/auth/ProtectedRoute";
import { AppLayout } from "../components/AppLayout";
import { CartPage } from "../pages/CartPage";
import { LoginPage } from "../pages/LoginPage";
import { ManageStorePage } from "../pages/ManageStorePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ProductDetailsPage } from "../pages/ProductDetailsPage";
import { ProductFormPage } from "../pages/ProductFormPage";
import { ProductsPage } from "../pages/ProductsPage";
import { RegisterPage } from "../pages/RegisterPage";

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/products" replace />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="cart" element={<CartPage />} />
          <Route path="manage/store" element={<ManageStorePage />} />
          <Route path="manage/store/products/new" element={<ProductFormPage mode="create" />} />
          <Route path="manage/store/products/:id/edit" element={<ProductFormPage mode="edit" />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
