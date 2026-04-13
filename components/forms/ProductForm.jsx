"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Field,
  LoadingInline,
  MessageBanner,
  PageIntro,
  Panel,
  PrimaryButton,
  SecondaryButton,
  Select,
  TextArea,
  TextInput,
} from "@/components/AdminUI";
import { categoriesApi } from "@/services/categories";
import { productsApi } from "@/services/products";
import { titleize, unwrapEntityResponse, unwrapListResponse } from "@/services/normalizers";

const defaultForm = {
  name: "",
  imageUrl: "",
  categoryId: "",
  foodType: "veg",
  basePrice: "",
  description: "",
  status: "active",
};

export default function ProductForm({ productId = null }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(Boolean(productId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productId) return;

    const load = async () => {
      try {
        setLoading(true);
        const [categoriesResponse, productResponse] = await Promise.all([
          categoriesApi.list({ status: "active" }),
          productId ? productsApi.get(productId) : Promise.resolve(null),
        ]);
        setCategories(unwrapListResponse(categoriesResponse));
        const product = unwrapEntityResponse(productResponse);
        setForm({
          name: product?.name || "",
          imageUrl: product?.image_url || product?.imageUrl || "",
          categoryId: String(product?.category_id ?? product?.categoryId ?? ""),
          foodType: product?.food_type || product?.foodType || "veg",
          basePrice: product?.base_price ?? product?.basePrice ?? "",
          description: product?.description || "",
          status: product?.status || "active",
        });
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load product.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [productId]);

  useEffect(() => {
    if (productId) return;

    categoriesApi.list({ status: "active" })
      .then((response) => setCategories(unwrapListResponse(response)))
      .catch(() => setCategories([]));
  }, [productId]);

  const onChange = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.categoryId || !form.foodType) {
      setError("Name, category, and food type are required.");
      return;
    }

    if (Number(form.basePrice) < 0) {
      setError("Base price must be zero or greater.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      imageUrl: form.imageUrl.trim() || null,
      categoryId: Number(form.categoryId),
      foodType: form.foodType,
      basePrice: Number(form.basePrice || 0),
      description: form.description.trim() || null,
      status: form.status,
    };

    try {
      setSaving(true);
      if (productId) {
        await productsApi.update(productId, payload);
      } else {
        await productsApi.create(payload);
      }
      router.push("/products");
      router.refresh();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageIntro
        eyebrow="Products"
        title={productId ? "Edit Product" : "New Product"}
        description="Products are linked to category records now. Choose a category id from the catalog instead of storing category text on the product."
      />

      <Panel>
        {loading ? (
          <div className="py-10 text-sm uppercase tracking-[0.16rem] text-[#5d5e61]">Loading product</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Name" required>
                <TextInput value={form.name} onChange={onChange("name")} placeholder="Paneer Tikka" />
              </Field>
              <Field label="Image URL">
                <TextInput value={form.imageUrl} onChange={onChange("imageUrl")} placeholder="https://..." />
              </Field>
              <Field label="Category" required>
                <Select value={form.categoryId} onChange={onChange("categoryId")}>
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({titleize(category.status)})
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Food Type" required>
                <Select value={form.foodType} onChange={onChange("foodType")}>
                  <option value="veg">Veg</option>
                  <option value="non_veg">Non Veg</option>
                </Select>
              </Field>
              <Field label="Base Price" required>
                <TextInput value={form.basePrice} onChange={onChange("basePrice")} type="number" min="0" />
              </Field>
              <Field label="Status">
                <Select value={form.status} onChange={onChange("status")}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </Field>
            </div>

            <Field label="Description">
              <TextArea value={form.description} onChange={onChange("description")} placeholder="Smoked paneer cubes" />
            </Field>

            <MessageBanner tone="danger" message={error} />

            <div className="flex gap-3">
              <PrimaryButton type="submit">{saving ? <LoadingInline label="Saving..." /> : "Save Product"}</PrimaryButton>
              <SecondaryButton type="button" onClick={() => router.push("/products")}>
                Cancel
              </SecondaryButton>
            </div>
          </form>
        )}
      </Panel>
    </div>
  );
}
