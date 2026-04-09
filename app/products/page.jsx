"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Pencil } from "lucide-react";
import {
  DataTable,
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

const initialForm = {
  name: "",
  category: "main_course",
  foodType: "veg",
  unitPrice: "",
  pricingType: "per_unit",
  description: "",
  status: "active",
};

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
  const isEditing = editingProductId !== null;

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
      const message = "Category is required.";
      setError(message);
      toast({
        variant: "error",
        title: "Product not saved",
        description: message,
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
      const message = fieldError || err?.response?.data?.message || `Unable to ${isEditing ? "update" : "create"} product.`;
      setError(message);
      toast({
        variant: "error",
        title: isEditing ? "Product not updated" : "Product not saved",
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const term = searchTerm.toLowerCase();

    return (
      product.name?.toLowerCase().includes(term) ||
      product.category?.toLowerCase().includes(term) ||
      product.food_type?.toLowerCase().includes(term) ||
      product.pricing_type?.toLowerCase().includes(term) ||
      product.status?.toLowerCase().includes(term) ||
      product.unit_price?.toString().includes(term)
    );
  });
  const dataToUse = searchTerm ? filteredProducts : products;

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(dataToUse.length / itemsPerPage);

  const paginatedProducts = dataToUse.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageIntro
        eyebrow="Catalog"
        title="Product catalog"
        description="Manage billable products that feed package composition and quotation pricing."
      />
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center border border-green-200 focus-within:border-green-400 rounded-full px-4 py-2 w-72 bg-gray-50 transition">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>

        <PrimaryButton onClick={openCreateForm}>
          + Add Product
        </PrimaryButton>
      </div>



      <div className="fixed inset-0 z-[9999] flex pointer-events-none">


        <div
          onClick={closeCreateForm}
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${showForm ? "opacity-100 pointer-events-auto" : "opacity-0"
            }`}
        />


        <div
          className={`relative ml-auto w-full max-w-lg h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${showForm ? "translate-x-0 pointer-events-auto" : "translate-x-full"
            }`}
        >
          <Panel title={isEditing ? "Edit Product" : "Create Product"} className="!mt-0 flex h-full flex-col">
            <form className="flex h-full flex-col" onSubmit={onSubmit}>
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                <Field label="Product name">
                  <TextInput
                    value={form.name}
                    onChange={onChange("name")}
                    placeholder="Paneer Tikka"
                    required
                  />
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Category">
                    <Select value={form.category} onChange={onChange("category")} required>
                      <option value="starter">Starter</option>
                      <option value="main_course">Main course</option>
                      <option value="dessert">Dessert</option>
                      <option value="drink">Drink</option>
                      <option value="tandoor">Tandoor</option>
                      <option value="salad">Salad</option>
                    </Select>
                  </Field>
                  <Field label="Food type">
                    <Select value={form.foodType} onChange={onChange("foodType")}>
                      <option value="veg">Veg</option>
                      <option value="non_veg">Non veg</option>
                    </Select>
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Unit price">
                    <TextInput value={form.unitPrice} placeholder="200" onChange={onChange("unitPrice")} type="number" required />
                  </Field>
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

                <Field label="Description (optional)">
                  <TextArea
                    value={form.description}
                    onChange={onChange("description")}
                    placeholder="Add notes about the product if needed"
                  />
                </Field>

                <MessageBanner tone="success" message={message} />
                <MessageBanner tone="danger" message={error} />
              </div>

              <div className="sticky bottom-0 flex justify-end gap-2 border-t border-green-100 bg-white px-4 py-4">
                <button
                  type="button"
                  onClick={closeCreateForm}
                  className="px-4 py-2 rounded-full text-red-700 bg-red-50 hover:bg-red-100 border border-red-800 text-sm hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <PrimaryButton type="submit" disabled={submitting}>
                  {submitting ? (
                    <LoadingInline label={isEditing ? "Updating..." : "Creating..."} />
                  ) : (
                    isEditing ? "Update" : "Create"
                  )}
                </PrimaryButton>
              </div>
            </form>
          </Panel>
        </div>
      </div>


      <div className="space-y-6">
        <Panel title="Products" subtitle="List of All Products">
          {loading ? (
            <LoadingState label="Loading products..." />
          ) : (
            <div>

              <DataTable
                columns={[
                  { key: "name", label: "Name" },
                  { key: "category", label: "Category" },
                  { key: "food_type", label: "Food Type" },
                  { key: "pricing_type", label: "Pricing" },
                  { key: "unit_price", label: "Unit Price" },
                  {
                    key: "actions",
                    label: "Actions",
                    render: (product) => (
                      <button
                        type="button"
                        onClick={() => openEditForm(product)}
                        className="inline-flex items-center justify-center rounded-full border border-green-300 p-2 text-green-700 transition hover:bg-green-50"
                        aria-label={`Edit ${product.name || "product"}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    ),
                  },
                ]}
                rows={paginatedProducts}
                emptyTitle="No products yet"
                emptyDescription="Add the first product to start building packages."
              />



              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-5">


                  <p className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} –
                    {Math.min(currentPage * itemsPerPage, dataToUse.length)} of{" "}
                    {dataToUse.length}
                  </p>


                  <div className="flex items-center gap-2">

                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-1.5 text-sm rounded-full border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      ← Prev
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-full">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-3 py-1 text-sm rounded-full transition ${currentPage === i + 1
                              ? "bg-green-600 text-white shadow-sm"
                              : "text-gray-600 hover:bg-white"
                            }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    {/* Next */}
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-1.5 text-sm rounded-full border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Next →
                    </button>

                  </div>
                </div>
              )}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
