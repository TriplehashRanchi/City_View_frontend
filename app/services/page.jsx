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
  costValue: "",
  pricingType: "fixed",
  description: "",
  status: "active",
};

export default function ServicesPage() {
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

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await catalogApi.listServices();
      setServices(response.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
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
      await catalogApi.createService({
        ...form,
        costValue: Number(form.costValue),
        description: form.description.trim() || null,
      });
      setForm(initialForm);
      setMessage("Service created successfully.");
      await loadServices();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to create service.");
    } finally {
      setSubmitting(false);
    }
  };

  // 🔍 Filter
  const filteredServices = services.filter((service) => {
    const term = searchTerm.toLowerCase();
    return (
      service.name?.toLowerCase().includes(term) ||
      service.pricing_type?.toLowerCase().includes(term) ||
      service.status?.toLowerCase().includes(term) ||
      service.cost_value?.toString().includes(term)
    );
  });

  const dataToUse = searchTerm ? filteredServices : services;

  // 📄 Pagination
  const totalPages = Math.ceil(dataToUse.length / itemsPerPage);

  const paginatedServices = dataToUse.slice(
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
        title="Service catalog"
        description="Manage operational services such as counters, staff, styling, or logistics."
      />

      {/* 🔍 Search + Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center border border-green-200 focus-within:border-green-400 rounded-full px-4 py-2 w-72 bg-gray-50 transition">
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>

        <PrimaryButton onClick={() => setShowForm(true)}>
          + Add Service
        </PrimaryButton>
      </div>

      {/* 🚪 Drawer */}
      <div className="fixed inset-0 z-[9999] flex pointer-events-none">
        <div
          onClick={() => setShowForm(false)}
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
  showForm ? "opacity-100 pointer-events-auto" : "opacity-0"
}`}
        />

        <div
          className={`relative ml-auto w-full max-w-lg h-full bg-white shadow-xl   ${
            showForm ? "translate-x-0 pointer-events-auto" : "translate-x-full"
          }`}
        > 
          <Panel title="Create Service" className="h-full overflow-y-auto !mt-0">
            <form className="space-y-4 p-4" onSubmit={onSubmit}>
              <Field label="Service name">
                <TextInput value={form.name} placeholder="Enter service name" onChange={onChange("name")} required />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Cost value">
                  <TextInput
                    value={form.costValue}
                    onChange={onChange("costValue")}
                    type="number"
                    required
                    placeholder="300"
                  />
                </Field>

                <Field label="Pricing type">
                  <Select value={form.pricingType} onChange={onChange("pricingType")}>
                    <option value="per_person">Per person</option>
                    <option value="per_unit">Per unit</option>
                    <option value="fixed">Fixed</option>
                  </Select>
                </Field>
              </div>

              <Field label="Status">
                <Select value={form.status} onChange={onChange("status")}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </Field>

              <Field label="Description">
                <TextArea value={form.description}  placeholder="Add a description..." onChange={onChange("description")} />
              </Field>

              <MessageBanner tone="success" message={message} />
              <MessageBanner tone="danger" message={error} />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-full text-red-700 bg-red-50 hover:bg-red-100 border border-red-300 text-sm transition"
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

      {/* 📊 Table */}
      <Panel title="Services" subtitle="List of all services">
        {loading ? (
          <p className="text-sm text-[var(--ink-soft)]">Loading services...</p>
        ) : (
          <div>
            <DataTable
              columns={[
                { key: "name", label: "Name" },
                { key: "pricing_type", label: "Pricing" },
                { key: "cost_value", label: "Cost" },
                { key: "description", label: "Description" },
                { key: "status", label: "Status" },
              ]}
              rows={paginatedServices}
              emptyTitle="No services yet"
              emptyDescription="Add your first service"
            />

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-5">

                <p className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} –
                  {Math.min(currentPage * itemsPerPage, dataToUse.length)} of{" "}
                  {dataToUse.length}
                </p>

                <div className="flex items-center gap-2">

                  {/* Prev */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-1.5 text-sm rounded-full border border-green-200 bg-white hover:bg-green-50 hover:border-green-400 text-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    ← Prev
                  </button>

                  {/* Pages */}
                  <div className="flex items-center gap-1 bg-green-50 p-1 rounded-full">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 text-sm rounded-full transition ${
                          currentPage === i + 1
                            ? "bg-green-600 text-white shadow-sm"
                            : "text-green-700 hover:bg-white"
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
                    className="px-4 py-1.5 text-sm rounded-full border border-green-200 bg-white hover:bg-green-50 hover:border-green-400 text-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
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
  );
}