export type ApiErrorBody = {
  error: string;
  message?: string;
};

export type User = {
  id: string;
  email: string;
  role: string;
};

export type AuthToken = {
  access_token: string;
  token_type: string;
  expires_at: string;
};

export type AuthResponse = {
  user: User;
  token: AuthToken;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  description: string;
  price_cents: number;
  stock: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductListResponse = {
  items: Product[];
  count: number;
};

export type ProductPayload = {
  name: string;
  sku: string;
  description: string;
  price_cents: number;
  stock: number;
  active?: boolean;
};

export type CartItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type Cart = {
  user_id: string;
  items: CartItem[];
  total_cents: number;
};

export type HealthResponse = {
  status: string;
};
