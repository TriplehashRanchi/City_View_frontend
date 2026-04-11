"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Package2,
  Pencil,
  Search,
  Sparkles,
  Tag,
  UtensilsCrossed,
  X,
} from "lucide-react";
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
import { useToast } from "@/components/ToastProvider";
import { catalogApi } from "@/services/modules";

const CATEGORY_OPTIONS = [
  { value: "starter", label: "Starter" },
  { value: "main_course", label: "Main course" },
  { value: "dessert", label: "Dessert" },
  { value: "drink", label: "Drink" },
  { value: "tandoor", label: "Tandoor" },
  { value: "salad", label: "Salad" },
];

const FOOD_TYPE_OPTIONS = [
  { value: "veg", label: "Veg" },
  { value: "non_veg", label: "Non veg" },
];

const PRICING_TYPE_OPTIONS = [
  { value: "per_person", label: "Per person" },
  { value: "per_unit", label: "Per unit" },
  { value: "fixed", label: "Fixed" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const initialForm = {
  name: "",
  category: "main_course",
  foodType: "veg",
  unitPrice: "",
  pricingType: "per_unit",
  description: "",
  status: "active",
};

function formatLabel(value) {
  if (!value) return "Not set";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCurrency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusClass(status) {
  return status === "active"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-slate-200 bg-slate-100 text-slate-600";
}

function getFoodTypeClass(foodType) {
  return foodType === "veg"
    ? "border-lime-200 bg-lime-50 text-lime-700"
    : "border-amber-200 bg-amber-50 text-amber-700";
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingProductId, setEditingProductId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  const isEditing = editingProductId !== null;
  const itemsPerPage = 6;

  const resetFormState = () => {
    setForm(initialForm);
    setEditingProductId(null);
    setMessage("");
    setError("");
  };

  const openCreateForm = () => {
    resetFormState();
    setShowForm(true);
  };

  const closeCreateForm = () => {
    resetFormState();
    setShowForm(false);
  };

  const openEditForm = (product) => {
    setForm({
      name: product.name || "",
      category: product.category || "main_course",
      foodType: product.food_type || "veg",
      unitPrice: product.unit_price || "",
      pricingType: product.pricing_type || "per_unit",
      description: product.description || "",
      status: product.status || "active",
    });
    setEditingProductId(product.id);
    setMessage("");
    setError("");
    setShowForm(true);
  };

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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);

  const onChange = (key) => (event) => {
    if (message) setMessage("");
    if (error) setError("");
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const trimmedName = form.name.trim();
    const trimmedCategory = form.category.trim();
    const trimmedDescription = form.description?.trim() || null;

    if (!trimmedCategory) {
      const categoryError = "Category is required.";
      setError(categoryError);
      toast({
        variant: "error",
        title: "Product not saved",
        description: categoryError,
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        name: trimmedName,
        category: trimmedCategory,
        unitPrice: Number(form.unitPrice),
        description: trimmedDescription,
      };
      const response = isEditing
        ? await catalogApi.updateProduct(editingProductId, payload)
        : await catalogApi.createProduct(payload);

      const savedProduct = response?.data;
      if (savedProduct) {
        setProducts((current) =>
          isEditing
            ? current.map((product) => (product.id === savedProduct.id ? savedProduct : product))
            : [savedProduct, ...current]
        );
        setCurrentPage(1);
      }

      setForm(initialForm);
      setEditingProductId(null);
      setMessage(isEditing ? "Product updated successfully." : "Product created successfully.");
      toast({
        variant: "success",
        title: isEditing ? "Product updated successfully" : "Product saved successfully",
        description: isEditing
          ? `${trimmedName || "Product"} has been updated in the catalog.`
          : `${trimmedName || "Product"} has been added to the catalog.`,
      });
    } catch (err) {
      const fieldError = err?.response?.data?.errors?.[0]?.msg;
      const submitError = fieldError || err?.response?.data?.message || `Unable to ${isEditing ? "update" : "create"} product.`;
      setError(submitError);
      toast({
        variant: "error",
        title: isEditing ? "Product not updated" : "Product not saved",
        description: submitError,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return products;

    return products.filter((product) => {
      return (
        product.name?.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term) ||
        product.food_type?.toLowerCase().includes(term) ||
        product.pricing_type?.toLowerCase().includes(term) ||
        product.status?.toLowerCase().includes(term) ||
        product.unit_price?.toString().includes(term)
      );
    });
  }, [products, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = useMemo(() => {
    const activeProducts = products.filter((product) => product.status === "active").length;
    const vegProducts = products.filter((product) => product.food_type === "veg").length;
    const averagePrice = products.length
      ? Math.round(
          products.reduce((sum, product) => sum + Number(product.unit_price || 0), 0) / products.length
        )
      : 0;
    const categories = CATEGORY_OPTIONS.map((category) => ({
      ...category,
      count: products.filter((product) => product.category === category.value).length,
    })).sort((a, b) => b.count - a.count);

    return {
      totalProducts: products.length,
      activeProducts,
      vegProducts,
      averagePrice,
      topCategories: categories.slice(0, 4),
    };
  }, [products]);

  const drawerOverlay =
    mounted && typeof document !== "undefined"
      ? createPortal(
          <div
            className={`fixed inset-0 z-[10001] transition ${showForm ? "pointer-events-auto" : "pointer-events-none"}`}
          >
            <button
              type="button"
              aria-label="Close product form"
              onClick={closeCreateForm}
              className={`absolute inset-0 h-full w-full bg-slate-950/35 backdrop-blur-[2px] transition-opacity ${
                showForm ? "opacity-100" : "opacity-0"
              }`}
            />

            <aside
              className={`absolute right-0 top-0 h-full w-full max-w-xl overflow-hidden transform border-l border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] transition-transform duration-300 ${
                showForm ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex h-full flex-col">
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-green-700">Product editor</p>
                    <h2 className="mt-2 font-[var(--font-fraunces)] text-3xl font-semibold text-slate-900">
                      {isEditing ? "Edit product" : "Create product"}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Use the right slider to add clean product details for quotations and package pricing.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeCreateForm}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form className="flex h-full flex-col" onSubmit={onSubmit}>
                  <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6 pb-28">
                    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Core details</p>
                      <div className="mt-4 space-y-4">
                        <Field label="Product name">
                          <TextInput
                            value={form.name}
                            onChange={onChange("name")}
                            placeholder="Paneer Tikka"
                            required
                            className="rounded-xl border-slate-200 bg-white focus:border-green-400 focus:ring-green-100"
                          />
                        </Field>

                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="Category">
                            <Select
                              value={form.category}
                              onChange={onChange("category")}
                              required
                              className="rounded-xl border-slate-200 bg-white focus:border-green-400 focus:ring-green-100"
                            >
                              {CATEGORY_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Select>
                          </Field>
                          <Field label="Food type">
                            <Select
                              value={form.foodType}
                              onChange={onChange("foodType")}
                              className="rounded-xl border-slate-200 bg-white focus:border-green-400 focus:ring-green-100"
                            >
                              {FOOD_TYPE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Select>
                          </Field>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Pricing setup</p>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <Field label="Unit price">
                          <TextInput
                            value={form.unitPrice}
                            placeholder="200"
                            onChange={onChange("unitPrice")}
                            type="number"
                            required
                            className="rounded-xl border-slate-200 bg-white focus:border-green-400 focus:ring-green-100"
                          />
                        </Field>

                        <Field label="Pricing type">
                          <Select
                            value={form.pricingType}
                            onChange={onChange("pricingType")}
                            className="rounded-xl border-slate-200 bg-white focus:border-green-400 focus:ring-green-100"
                          >
                            {PRICING_TYPE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </Select>
                        </Field>

                        <Field label="Status">
                          <Select
                            value={form.status}
                            onChange={onChange("status")}
                            className="rounded-xl border-slate-200 bg-white focus:border-green-400 focus:ring-green-100"
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </Select>
                        </Field>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Notes</p>
                      <div className="mt-4">
                        <Field label="Description (optional)">
                          <TextArea
                            value={form.description}
                            onChange={onChange("description")}
                            placeholder="Add notes about the product if needed"
                            className="rounded-xl border-slate-200 bg-white focus:border-green-400 focus:ring-green-100"
                          />
                        </Field>
                      </div>
                    </div>

                    <MessageBanner tone="success" message={message} />
                    <MessageBanner tone="danger" message={error} />
                  </div>

                  <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-slate-100 bg-white/95 px-6 py-5 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur">
                    <button
                      type="button"
                      onClick={closeCreateForm}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                    <PrimaryButton type="submit" disabled={submitting} className="rounded-xl px-5 py-2.5">
                      {submitting ? (
                        <LoadingInline label={isEditing ? "Updating..." : "Creating..."} />
                      ) : isEditing ? (
                        "Update product"
                      ) : (
                        "Create product"
                      )}
                    </PrimaryButton>
                  </div>
                </form>
              </div>
            </aside>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageIntro
        eyebrow="Catalog"
        title="Product catalog"

        action={
          <PrimaryButton onClick={openCreateForm} className="rounded-xl px-5 py-3 shadow-sm">
            Add Product
          </PrimaryButton>
        }
      />

      <div className="grid gap-6 ">
        <Panel
        >
          <div className="space-y-6">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products, category, price or status"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-11 py-3 text-sm text-slate-700 outline-none transition focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
                />
              </div>
              <PrimaryButton onClick={openCreateForm} className="rounded-xl px-5 py-3 lg:hidden">
                Add Product
              </PrimaryButton>
            </div>

            {loading ? (
              <LoadingState label="Loading products..." />
            ) : filteredProducts.length ? (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-left">
                    <thead className="bg-slate-50">
                      <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        <th className="px-5 py-4 font-semibold">Product</th>
                        <th className="px-5 py-4 font-semibold">Type</th>
                        <th className="px-5 py-4 font-semibold">Category</th>
                        <th className="px-5 py-4 font-semibold">Pricing</th>
                        <th className="px-5 py-4 text-right font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {paginatedProducts.map((product) => (
                        <tr key={product.id} className="border-t border-slate-100 align-top">
                          <td className="px-5 py-4">
                            <div className="space-y-1.5">
                              <p className="text-base font-semibold text-slate-900">{product.name}</p>
                              <p className="text-sm text-slate-500">
                                {/* {formatLabel(product.category)}
                                {product.description ? ` • ${product.description}` : ""} */}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-2">
                              <span
                                className={`inline-flex rounded-xl border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${getFoodTypeClass(product.food_type)}`}
                              >
                                {formatLabel(product.food_type)}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-xl border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusClass(product.status)}`}
                            >
                              {formatLabel(product.category)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-slate-900">
                              {formatCurrency(product.unit_price)}
                            </p>
                            {/* <p className="mt-1 text-sm text-slate-500">
                              {formatLabel(product.pricing_type)}
                            </p> */}
                          </td>
                          
                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => openEditForm(product)}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-green-300 hover:bg-green-50 hover:text-green-800"
                              aria-label={`Edit ${product.name || "product"}`}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
                <p className="font-semibold text-slate-900">No products found</p>
                <p className="mt-2 text-sm text-slate-500">
                  Try a different search term or add a new product to the catalog.
                </p>
              </div>
            )}

            {filteredProducts.length > 0 && (
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-sm text-slate-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length}
                </p>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                      disabled={currentPage === 1}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prev
                    </button>

                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5">
                      {Array.from({ length: totalPages }, (_, index) => {
                        const pageNumber = index + 1;
                        const active = pageNumber === currentPage;

                        return (
                          <button
                            key={pageNumber}
                            type="button"
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`min-w-10 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                              active
                                ? "bg-slate-900 text-white shadow-sm"
                                : "text-slate-600 hover:bg-white"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Panel>
      </div>

      {drawerOverlay}
    </div>
  );
}
