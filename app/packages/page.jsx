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

const emptyProductRow = { productId: "", quantity: "1", notes: "" };
const emptyServiceRow = { serviceId: "", quantity: "1", notes: "" };

const initialForm = {
  name: "",
  description: "",
  pricingType: "fixed",
  basePrice: "",
  minimumGuestCount: "1",
  status: "active",
  products: [emptyProductRow],
  services: [emptyServiceRow],
};

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [packagesResponse, productsResponse, servicesResponse] = await Promise.all([
        catalogApi.listPackages(),
        catalogApi.listProducts({ status: "active", limit: 100 }),
        catalogApi.listServices({ status: "active", limit: 100 }),
      ]);
      setPackages(packagesResponse.data || []);
      setProducts(productsResponse.data || []);
      setServices(servicesResponse.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load package data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onFieldChange = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const onArrayChange = (group, index, key) => (event) => {
    const value = event.target.value;
    setForm((current) => ({
      ...current,
      [group]: current[group].map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
    }));
  };

  const addRow = (group, template) => {
    setForm((current) => ({ ...current, [group]: [...current[group], template] }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      setSubmitting(true);
      await catalogApi.createPackage({
        name: form.name,
        description: form.description.trim() || null,
        pricingType: form.pricingType,
        basePrice: Number(form.basePrice),
        minimumGuestCount: Number(form.minimumGuestCount || 1),
        status: form.status,
        products: form.products
          .filter((item) => item.productId)
          .map((item) => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity),
            notes: item.notes.trim() || null,
          })),
        services: form.services
          .filter((item) => item.serviceId)
          .map((item) => ({
            serviceId: Number(item.serviceId),
            quantity: Number(item.quantity),
            notes: item.notes.trim() || null,
          })),
      });
      setForm(initialForm);
      setMessage("Package created successfully.");
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to create package.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageIntro
        eyebrow="Packages"
        title="Package builder"
        description="Compose reusable packages from products and services. This matches the `packages`, `package_products`, and `package_services` tables."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.1fr]">
        <Panel title="New package" subtitle="Build one reusable priceable package.">
          <form className="space-y-5" onSubmit={onSubmit}>
            <Field label="Package name">
              <TextInput value={form.name} onChange={onFieldChange("name")} placeholder="Wedding Silver Package" required />
            </Field>

            <Field label="Description">
              <TextArea value={form.description} onChange={onFieldChange("description")} placeholder="Starter plus service bundle for mid-size events." />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Pricing type">
                <Select value={form.pricingType} onChange={onFieldChange("pricingType")}>
                  <option value="per_person">Per person</option>
                  <option value="per_unit">Per unit</option>
                  <option value="fixed">Fixed</option>
                </Select>
              </Field>
              <Field label="Base price">
                <TextInput value={form.basePrice} onChange={onFieldChange("basePrice")} type="number" min="0" step="0.01" placeholder="25000" required />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Minimum guest count">
                <TextInput value={form.minimumGuestCount} onChange={onFieldChange("minimumGuestCount")} type="number" min="1" />
              </Field>
              <Field label="Status">
                <Select value={form.status} onChange={onFieldChange("status")}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </Field>
            </div>

            <div className="space-y-3 rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,250,242,0.8)] p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--foreground)]">Product lines</h3>
                <button type="button" className="text-sm font-semibold text-[var(--accent-deep)]" onClick={() => addRow("products", emptyProductRow)}>
                  Add product
                </button>
              </div>
              {form.products.map((item, index) => (
                <div key={`product-${index}`} className="grid gap-3 md:grid-cols-[1.2fr_0.5fr_1fr]">
                  <Select value={item.productId} onChange={onArrayChange("products", index, "productId")}>
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </Select>
                  <TextInput value={item.quantity} onChange={onArrayChange("products", index, "quantity")} type="number" min="0.01" step="0.01" placeholder="Qty" />
                  <TextInput value={item.notes} onChange={onArrayChange("products", index, "notes")} placeholder="Notes" />
                </div>
              ))}
            </div>

            <div className="space-y-3 rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,250,242,0.8)] p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--foreground)]">Service lines</h3>
                <button type="button" className="text-sm font-semibold text-[var(--accent-deep)]" onClick={() => addRow("services", emptyServiceRow)}>
                  Add service
                </button>
              </div>
              {form.services.map((item, index) => (
                <div key={`service-${index}`} className="grid gap-3 md:grid-cols-[1.2fr_0.5fr_1fr]">
                  <Select value={item.serviceId} onChange={onArrayChange("services", index, "serviceId")}>
                    <option value="">Select service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </Select>
                  <TextInput value={item.quantity} onChange={onArrayChange("services", index, "quantity")} type="number" min="0.01" step="0.01" placeholder="Qty" />
                  <TextInput value={item.notes} onChange={onArrayChange("services", index, "notes")} placeholder="Notes" />
                </div>
              ))}
            </div>

            <MessageBanner tone="success" message={message} />
            <MessageBanner tone="danger" message={error} />

            <PrimaryButton type="submit" disabled={submitting}>
              {submitting ? "Creating package..." : "Create package"}
            </PrimaryButton>
          </form>
        </Panel>

        <Panel title="Saved packages" subtitle="Existing packages available for quotation versions.">
          {loading ? (
            <p className="text-sm text-[var(--ink-soft)]">Loading packages...</p>
          ) : (
            <DataTable
              columns={[
                { key: "name", label: "Name" },
                { key: "pricing_type", label: "Pricing" },
                { key: "base_price", label: "Base price" },
                { key: "minimum_guest_count", label: "Min guests" },
                { key: "status", label: "Status" },
              ]}
              rows={packages}
              emptyTitle="No packages yet"
              emptyDescription="Create a package after adding products and services."
            />
          )}
        </Panel>
      </div>
    </div>
  );
}
