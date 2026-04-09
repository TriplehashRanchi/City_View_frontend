"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Field,
  LoadingInline,
  LoadingState,
  MessageBanner,
  PageIntro,
  Panel,
  PrimaryButton,
  Select,
  TextArea,
  TextInput,
} from "@/components/AdminUI";
import { catalogApi } from "@/services/modules";

const emptyProductRow = { productId: "" };
const formatLabel = (value) =>
  String(value || "")
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function EditPackagePage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params?.id;
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [packageResponse, productsResponse] = await Promise.all([
        catalogApi.getPackage(packageId),
        catalogApi.listProducts({ status: "active", limit: 100 }),
      ]);

      const pkg = packageResponse.data;
      setProducts(productsResponse.data || []);
      setForm({
        name: pkg?.name || "",
        description: pkg?.description || "",
        minimumGuestCount: String(pkg?.minimum_guest_count || 1),
        status: pkg?.status || "active",
        products:
          pkg?.products?.length
            ? pkg.products.map((item) => ({
                productId: String(item.product_id),
              }))
            : [{ ...emptyProductRow }],
        services:
          pkg?.services?.length
            ? pkg.services.map((item) => ({
                serviceId: String(item.service_id),
                quantity: String(item.quantity),
                notes: item.notes || "",
              }))
            : [],
      });
    } catch {
      setError("Unable to load package details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!packageId) return;
    loadData();
  }, [packageId]);

  const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

  const calculateLineTotal = ({ pricingType, unitPrice, quantity, guestCount }) => {
    const safeUnitPrice = Number(unitPrice || 0);
    const safeQuantity = Math.max(Number(quantity || 0), 0);
    const safeGuestCount = Math.max(Number(guestCount || 0), 0);

    if (pricingType === "per_person") return roundMoney(safeUnitPrice * safeGuestCount * Math.max(safeQuantity, 1));
    if (pricingType === "per_unit") return roundMoney(safeUnitPrice * safeQuantity);
    return roundMoney(safeUnitPrice * Math.max(safeQuantity, 1));
  };

  const computedTotal = useMemo(() => {
    if (!form) return 0;
    const guestCount = Number(form.minimumGuestCount || 1);

    const productTotal = form.products.reduce((sum, item) => {
      const product = products.find((entry) => String(entry.id) === String(item.productId));
      if (!product) return sum;
      return sum + calculateLineTotal({
        pricingType: product.pricing_type,
        unitPrice: product.unit_price,
        quantity: 1,
        guestCount,
      });
    }, 0);

    return roundMoney(productTotal);
  }, [form, products]);

  const onFieldChange = (key) => (event) => {
    if (message) setMessage("");
    if (error) setError("");
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const onArrayChange = (group, index, key) => (event) => {
    const value = event.target.value;
    if (message) setMessage("");
    if (error) setError("");
    setForm((current) => ({
      ...current,
      [group]: current[group].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addRow = (group, template) => {
    setForm((current) => ({
      ...current,
      [group]: [...current[group], { ...template }],
    }));
  };

  const removeRow = (group, index) => {
    setForm((current) => {
      const nextRows = current[group].filter((_, itemIndex) => itemIndex !== index);
      return {
        ...current,
        [group]: nextRows.length ? nextRows : [{ ...emptyProductRow }],
      };
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!form) return;
    setMessage("");
    setError("");

    try {
      setSubmitting(true);
      await catalogApi.updatePackage(packageId, {
        ...form,
        name: form.name.trim(),
        description: form.description || null,
        minimumGuestCount: Number(form.minimumGuestCount || 1),
        products: form.products
          .filter((item) => item.productId)
          .map((item) => ({
            productId: Number(item.productId),
            quantity: 1,
            notes: null,
          })),
        services: form.services
          .filter((item) => item.serviceId)
          .map((item) => ({
            serviceId: Number(item.serviceId),
            quantity: Number(item.quantity || 1),
            notes: item.notes || null,
          })),
      });

      setMessage("Package updated successfully.");
      router.push("/packages");
    } catch {
      setError("Unable to update package.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="mx-auto max-w-7xl">
        <LoadingState label="Loading package editor..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageIntro
        eyebrow="Packages"
        title="Edit package"
        description="Update package details, linked products, and linked services from the dedicated editor."
        action={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/packages")}
              className="px-4 py-2 rounded-full border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100"
            >
              Back to packages
            </button>
            <PrimaryButton onClick={onSubmit} disabled={submitting}>
              {submitting ? <LoadingInline label="Updating..." /> : "Update package"}
            </PrimaryButton>
          </div>
        }
      />

      <MessageBanner tone="success" message={message} />
      <MessageBanner tone="danger" message={error} />

      <form className="space-y-6" onSubmit={onSubmit}>
        <Panel title="Package details" subtitle="Update the core package pricing and availability.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Package name">
              <TextInput value={form.name} onChange={onFieldChange("name")} required />
            </Field>

            <Field label="Minimum guest count">
              <TextInput
                type="number"
                min="1"
                value={form.minimumGuestCount}
                onChange={onFieldChange("minimumGuestCount")}
              />
            </Field>
          </div>

          {/* <div className="mt-4 rounded-[1.5rem] border border-green-200 bg-green-50 px-5 py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">Computed package total</p>
            <p className="mt-2 text-3xl font-semibold text-gray-800">Rs. {computedTotal.toFixed(2)}</p>
            <p className="mt-2 text-sm text-gray-500">
              Total is calculated automatically from selected products, quantities, and minimum guest count.
            </p>
          </div> */}
        </Panel>

        <Panel
          title="Products"
          subtitle="Update selected products and review their type, category, and price."
          aside={
            <PrimaryButton type="button" onClick={() => addRow("products", emptyProductRow)}>
              + Add product
            </PrimaryButton>
          }
        >
          <div className="space-y-3">
            {form.products.map((item, index) => (
              (() => {
                const selectedProduct = products.find((product) => String(product.id) === String(item.productId));

                return (
                  <div
                    key={`product-${index}`}
                    className="grid items-center gap-2 rounded-[1.1rem] border border-green-100 bg-white px-3 py-2 md:grid-cols-[minmax(260px,1.4fr)_auto_160px_auto]"
                  >
                    <Select value={item.productId} onChange={onArrayChange("products", index, "productId")}>
                      <option value="">Select product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </Select>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-800">
                        Food: {selectedProduct ? formatLabel(selectedProduct.food_type) : "--"}
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        Category: {selectedProduct ? formatLabel(selectedProduct.category) : "--"}
                      </span>
                    </div>

                    <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-center">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-green-700">Price</p>
                      <p className="mt-0.5 text-lg font-semibold text-gray-800">
                        {selectedProduct ? `Rs. ${Number(selectedProduct.unit_price || 0).toFixed(2)}` : "--"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeRow("products", index)}
                      className="rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
                    >
                      Remove
                    </button>
                  </div>
                );
              })()
            ))}
          </div>
        </Panel>

        <div className="sticky bottom-0 z-10 flex justify-end gap-3 rounded-[2rem] border border-green-100 bg-white/95 px-6 py-4 shadow-lg backdrop-blur">
          <button
            type="button"
            onClick={() => router.push("/packages")}
            className="px-4 py-2 rounded-full border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100"
          >
            Cancel
          </button>
          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? <LoadingInline label="Updating..." /> : "Update package"}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
