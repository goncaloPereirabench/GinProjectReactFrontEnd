import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Save } from "lucide-react";
import { productKeys, productsApi } from "../api/products";
import type { ProductPayload } from "../api/types";
import { PageHeader } from "../components/PageHeader";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { Input, Textarea } from "../components/ui/Input";
import { LoadingState } from "../components/ui/StateBlock";
import { getErrorMessage } from "../lib/errors";

type ProductFormPageProps = {
  mode: "create" | "edit";
};

type FormState = {
  name: string;
  sku: string;
  description: string;
  price: string;
  stock: string;
  active: boolean;
};

const emptyForm: FormState = {
  name: "",
  sku: "",
  description: "",
  price: "0.00",
  stock: "0",
  active: true,
};

export function ProductFormPage({ mode }: ProductFormPageProps) {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyForm);

  const product = useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.get(id),
    enabled: mode === "edit" && Boolean(id),
  });

  useEffect(() => {
    if (product.data) {
      setForm({
        name: product.data.name,
        sku: product.data.sku,
        description: product.data.description,
        price: (product.data.price_cents / 100).toFixed(2),
        stock: String(product.data.stock),
        active: product.data.active,
      });
    }
  }, [product.data]);

  const saveProduct = useMutation({
    mutationFn: (payload: ProductPayload) =>
      mode === "create" ? productsApi.create(payload) : productsApi.update(id, payload),
    onSuccess: async (savedProduct) => {
      await queryClient.invalidateQueries({ queryKey: productKeys.all });
      navigate(mode === "create" ? "/manage/store" : `/products/${savedProduct.id}`);
    },
  });

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    saveProduct.mutate({
      name: form.name.trim(),
      sku: form.sku.trim(),
      description: form.description.trim(),
      price_cents: Math.round(Number(form.price) * 100),
      stock: Number(form.stock),
      active: form.active,
    });
  }

  if (mode === "edit" && product.isLoading) {
    return <LoadingState title="Loading product" />;
  }

  if (mode === "edit" && product.isError) {
    return <Alert tone="error">{getErrorMessage(product.error)}</Alert>;
  }

  return (
    <>
      <PageHeader
        description="The form submits the exact JSON shape expected by the Gin handler: name, SKU, description, integer cents, stock, and active state."
        eyebrow="Protected route"
        title={mode === "create" ? "Create product" : "Edit product"}
      />

      <form className="max-w-3xl rounded-md border border-ink-950/10 bg-white p-6 shadow-soft" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          {saveProduct.isError ? (
            <div className="sm:col-span-2">
              <Alert tone="error">{getErrorMessage(saveProduct.error)}</Alert>
            </div>
          ) : null}

          <Input
            label="Name"
            minLength={2}
            name="name"
            onChange={(event) => updateField("name", event.target.value)}
            required
            value={form.name}
          />
          <Input
            label="SKU"
            minLength={2}
            name="sku"
            onChange={(event) => updateField("sku", event.target.value)}
            required
            value={form.sku}
          />
          <Input
            label="Price"
            min="0"
            name="price"
            onChange={(event) => updateField("price", event.target.value)}
            required
            step="0.01"
            type="number"
            value={form.price}
          />
          <Input
            label="Stock"
            min="0"
            name="stock"
            onChange={(event) => updateField("stock", event.target.value)}
            required
            type="number"
            value={form.stock}
          />
          <div className="sm:col-span-2">
            <Textarea
              label="Description"
              maxLength={500}
              name="description"
              onChange={(event) => updateField("description", event.target.value)}
              value={form.description}
            />
          </div>

          <label className="flex items-center gap-3 text-sm font-medium text-ink-800 sm:col-span-2">
            <input
              checked={form.active}
              className="h-4 w-4 rounded border-ink-950/20 text-market-600 focus:ring-market-600"
              onChange={(event) => updateField("active", event.target.checked)}
              type="checkbox"
            />
            Active product
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button icon={<Save className="h-4 w-4" />} isLoading={saveProduct.isPending} type="submit">
            Save product
          </Button>
          <Button onClick={() => navigate(-1)} variant="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
}
