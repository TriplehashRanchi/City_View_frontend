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
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredProducts = products.filter((product) => {
    const term = searchTerm.toLowerCase();

    return (
      product.name?.toLowerCase().includes(term) ||
      product.category?.toLowerCase().includes(term) ||
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

        <PrimaryButton onClick={() => setShowForm(true)}>
          + Add Product
        </PrimaryButton>
      </div>



      <div className="fixed inset-0 z-[9999] flex pointer-events-none">


        <div
          onClick={() => setShowForm(false)}
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${showForm ? "opacity-100 pointer-events-auto" : "opacity-0"
            }`}
        />


        <div
          className={`relative ml-auto w-full max-w-lg h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${showForm ? "translate-x-0 pointer-events-auto" : "translate-x-full"
            }`}
        >
          <Panel title="Create Product" className="h-full overflow-y-auto !mt-0">
            <form className="space-y-4 p-4" onSubmit={onSubmit}>

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
                  <TextInput value={form.category} placeholder="Veg" onChange={onChange("category")} required />
                </Field>
                <Field label="Unit price">
                  <TextInput value={form.unitPrice} placeholder="200" onChange={onChange("unitPrice")} type="number" required />
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
                <TextArea value={form.description} onChange={onChange("description")} />
              </Field>

              <MessageBanner tone="success" message={message} />
              <MessageBanner tone="danger" message={error} />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-full text-red-700 bg-red-50 hover:bg-red-100 border border-red-800 text-sm hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <PrimaryButton type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create"}
                </PrimaryButton>
              </div>
            </form>
          </Panel>
        </div>
      </div>


      <div className="space-y-6">
        <Panel title="Products" subtitle="List of All Products">
          {loading ? (
            <p className="text-sm text-[var(--ink-soft)]">
              Loading products...
            </p>
          ) : (
            <div>

              <DataTable
                columns={[
                  { key: "name", label: "Name" },
                  { key: "category", label: "Category" },
                  { key: "pricing_type", label: "Pricing" },
                  { key: "unit_price", label: "Unit Price" },
                  { key: "status", label: "Status" },
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
