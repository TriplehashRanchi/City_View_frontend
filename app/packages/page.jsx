"use client";

import { useEffect, useMemo, useState } from "react";
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

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async () => {
    try {
      setLoading(true);
      const [p, pr, s] = await Promise.all([
        catalogApi.listPackages(),
        catalogApi.listProducts({ status: "active", limit: 100 }),
        catalogApi.listServices({ status: "active", limit: 100 }),
      ]);
      setPackages(p.data || []);
      setProducts(pr.data || []);
      setServices(s.data || []);
    } catch {
      setError("Unable to load package data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Prevent background scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = showForm ? "hidden" : "auto";
  }, [showForm]);

  const filteredPackages = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return packages.filter((p) =>
      p.name?.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term) ||
      p.pricing_type?.toLowerCase().includes(term) ||
      p.status?.toLowerCase().includes(term)
    );
  }, [packages, searchTerm]);

  const dataToUse = searchTerm ? filteredPackages : packages;

  const totalPages = Math.ceil(dataToUse.length / itemsPerPage);

  const paginatedPackages = dataToUse.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const onFieldChange = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onArrayChange = (group, index, key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({
      ...f,
      [group]: f[group].map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addRow = (group, template) => {
    setForm((f) => ({ ...f, [group]: [...f[group], template] }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      setSubmitting(true);
      await catalogApi.createPackage({
        ...form,
        basePrice: Number(form.basePrice),
        minimumGuestCount: Number(form.minimumGuestCount || 1),
        products: form.products.filter((p) => p.productId),
        services: form.services.filter((s) => s.serviceId),
      });

      setForm(initialForm);
      setMessage("Package created successfully.");
      setShowForm(false);
      await loadData();
    } catch {
      setError("Unable to create package.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      <PageIntro
        eyebrow="Packages"
        title="Package builder"
        description="Create reusable packages using products & services."
      />

      {/* Search + Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center border border-green-200 rounded-full px-4 py-2 w-72 bg-gray-50">
          <input
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>

        <PrimaryButton onClick={() => setShowForm(true)}>
          + Add Package
        </PrimaryButton>
      </div>

      {/* 🚪 Drawer */}
      <div className="fixed inset-0 z-[9999] pointer-events-none">

        <div
          onClick={() => setShowForm(false)}
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${showForm ? "opacity-100 pointer-events-auto" : "opacity-0"
            }`}
        />


        <div
          className={`absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl flex flex-col
    transform transition-transform duration-500 ease-in-out
    ${showForm ? "translate-x-0 pointer-events-auto" : "translate-x-full"}`}
        >


          <div className="p-4 border-b font-semibold text-lg">
            Create Package
          </div>


          <div className="flex-1 overflow-y-auto">
            <form className="space-y-4 p-4" onSubmit={onSubmit}>

              <Field label="Package name">
                <TextInput value={form.name} onChange={onFieldChange("name")} required />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Pricing type">
                  <Select value={form.pricingType} onChange={onFieldChange("pricingType")}>
                    <option value="fixed">Fixed</option>
                    <option value="per_person">Per person</option>
                  </Select>
                </Field>

                <Field label="Base price">
                  <TextInput
                    type="number"
                    placeholder="200"
                    value={form.basePrice}
                    onChange={onFieldChange("basePrice")}
                    required
                  />
                </Field>
              </div>


              <div className="bg-green-50 p-4 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Products</span>
                  <button type="button" onClick={() => addRow("products", emptyProductRow)}>
                    + Add
                  </button>
                </div>

                {form.products.map((item, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2">
                    <Select value={item.productId} onChange={onArrayChange("products", i, "productId")}>
                      <option value="">Select</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </Select>
                    <TextInput value={item.quantity} onChange={onArrayChange("products", i, "quantity")} />
                    <TextInput value={item.notes} onChange={onArrayChange("products", i, "notes")} />
                  </div>
                ))}
              </div>

              <div className="bg-green-50 p-4 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Services</span>
                  <button type="button" onClick={() => addRow("services", emptyServiceRow)}>
                    + Add
                  </button>
                </div>

                {form.services.map((item, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2">
                    <Select value={item.serviceId} onChange={onArrayChange("services", i, "serviceId")}>
                      <option value="">Select</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </Select>
                    <TextInput value={item.quantity} onChange={onArrayChange("services", i, "quantity")} />
                    <TextInput value={item.notes} onChange={onArrayChange("services", i, "notes")} />
                  </div>
                ))}
              </div>

              <Field label="Description">
                <TextArea
                  value={form.description}
                  placeholder="Add a description..."
                  onChange={onFieldChange("description")}
                />
              </Field>

              <MessageBanner tone="success" message={message} />
              <MessageBanner tone="danger" message={error} />

              <div className="h-20" />
            </form>
          </div>

          <div className="p-4 flex justify-end gap-2 bg-white">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-red-700 bg-red-50 border rounded-full hover:bg-red-100"
            >
              Cancel
            </button>

            <PrimaryButton onClick={onSubmit}>
              {submitting ? <LoadingInline label="Creating..." /> : "Create"}
            </PrimaryButton>
          </div>

        </div>
      </div>

      <Panel title="Packages">
        {loading ? (
          <LoadingState label="Loading..." />
        ) : (
          <>
            <DataTable
              columns={[
                { key: "name", label: "Name" },
                { key: "pricing_type", label: "Pricing" },
                { key: "base_price", label: "Base price" },
                { key: "minimum_guest_count", label: "Min guests" },
                { key: "status", label: "Status" },
              ]}
              rows={paginatedPackages}
              emptyTitle="No packages yet"
              emptyDescription="Create your first package"
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
                    className="px-4 py-1.5 text-sm rounded-full border border-green-200 bg-white hover:bg-green-50 hover:border-green-400 text-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    ← Prev
                  </button>


                  <div className="flex items-center gap-1 bg-green-50 p-1 rounded-full">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 text-sm rounded-full transition ${currentPage === i + 1
                            ? "bg-green-600 text-white shadow-sm"
                            : "text-green-700 hover:bg-white"
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-1.5 text-sm rounded-full border border-green-200 bg-white hover:bg-green-50 hover:border-green-400 text-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Next →
                  </button>

                </div>
              </div>
            )}
          </>
        )}
      </Panel>

    </div>
  );
}