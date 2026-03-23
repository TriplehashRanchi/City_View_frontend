"use client";

import { useEffect, useState } from "react";
import {
  DataTable,
  Field,
  MessageBanner,
  PageIntro,
  Panel,
  PrimaryButton,
  Select,
  TextArea,
  TextInput,
} from "@/components/AdminUI";
import { catalogApi } from "@/services/modules";

const initialForm = {
  name: "",
  category: "",
  unitPrice: "",
  pricingType: "per_unit",
  description: "",
  status: "active",
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await catalogApi.listProducts();
      setProducts(response.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const onChange = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      setSubmitting(true);
      await catalogApi.createProduct({
        ...form,
        unitPrice: Number(form.unitPrice),
        description: form.description.trim() || null,
      });
      setForm(initialForm);
      setMessage("Product created successfully.");
      await loadProducts();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to create product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageIntro
        eyebrow="Catalog"
        title="Product catalog"
        description="Manage billable products that feed package composition and quotation pricing."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
        <Panel title="New product" subtitle="Maps to `POST /catalog/products`.">
          <form className="space-y-4" onSubmit={onSubmit}>
            <Field label="Product name">
              <TextInput value={form.name} onChange={onChange("name")} placeholder="Paneer Tikka" required />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Category">
                <TextInput value={form.category} onChange={onChange("category")} placeholder="Starter" required />
              </Field>
              <Field label="Unit price">
                <TextInput value={form.unitPrice} onChange={onChange("unitPrice")} placeholder="250" type="number" min="0" step="0.01" required />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Pricing type">
                <Select value={form.pricingType} onChange={onChange("pricingType")}>
                  <option value="per_person">Per person</option>
                  <option value="per_unit">Per unit</option>
                  <option value="fixed">Fixed</option>
                </Select>
              </Field>
              <Field label="Status">
                <Select value={form.status} onChange={onChange("status")}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </Field>
            </div>

            <Field label="Description">
              <TextArea value={form.description} onChange={onChange("description")} placeholder="Short description for the kitchen and quotation team." />
            </Field>

            <MessageBanner tone="success" message={message} />
            <MessageBanner tone="danger" message={error} />

            <PrimaryButton type="submit" disabled={submitting}>
              {submitting ? "Creating product..." : "Create product"}
            </PrimaryButton>
          </form>
        </Panel>

        <Panel title="Products" subtitle="Live list from the backend product table.">
          {loading ? (
            <p className="text-sm text-[var(--ink-soft)]">Loading products...</p>
          ) : (
            <DataTable
              columns={[
                { key: "name", label: "Name" },
                { key: "category", label: "Category" },
                { key: "pricing_type", label: "Pricing" },
                { key: "unit_price", label: "Unit Price" },
                { key: "status", label: "Status" },
              ]}
              rows={products}
              emptyTitle="No products yet"
              emptyDescription="Add the first product to start building packages."
            />
          )}
        </Panel>
      </div>
    </div>
  );
}
