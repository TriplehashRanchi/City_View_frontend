"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  DataTable,
  Field,
  LoadingInline,
  LoadingState,
  MessageBanner,
  PageIntro,
  Panel,
  PrimaryButton,
  SecondaryButton,
  TextArea,
  TextInput,
} from "@/components/AdminUI";
import { useToast } from "@/components/ToastProvider";
import { clientsApi } from "@/services/modules";

const initialForm = {
  name: "",
  phone: "",
  email: "",
  companyName: "",
  notes: "",
};

const itemsPerPage = 8;

export default function ClientsPage() {
  const { toast } = useToast();
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const deferredSearchTerm = useDeferredValue(searchTerm);

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await clientsApi.list();
      setClients(response.data || []);
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to load clients.";
      setError(message);
      toast({
        variant: "error",
        title: "Clients not loaded",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    if (!showDrawer) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowDrawer(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [showDrawer]);

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearchTerm, statusFilter]);

  const onChange = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const openDrawer = () => {
    setError("");
    setShowDrawer(true);
  };

  const resetDrawer = () => {
    setForm(initialForm);
    setError("");
    setShowDrawer(false);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      setSubmitting(true);
      const clientName = form.name.trim();
      await clientsApi.create({
        ...form,
        name: clientName,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        companyName: form.companyName.trim() || null,
        notes: form.notes.trim() || null,
      });
      setMessage("Client created successfully.");
      toast({
        variant: "success",
        title: "Client saved successfully",
        description: `${clientName || "Client"} has been added to the list.`,
      });
      resetDrawer();
      await loadClients();
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to create client.";
      setError(message);
      toast({
        variant: "error",
        title: "Client not saved",
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredClients = useMemo(() => {
    const term = deferredSearchTerm.trim().toLowerCase();

    return clients.filter((client) => {
      const matchesSearch =
        !term ||
        client.name?.toLowerCase().includes(term) ||
        client.company_name?.toLowerCase().includes(term) ||
        String(client.phone || "").toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" || (client.status || "").toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [clients, deferredSearchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / itemsPerPage));
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageIntro
        eyebrow="Clients"
        title="Clients"
        description="Keep the client list clean, searchable, and ready for the next workflow."
        action={<PrimaryButton onClick={openDrawer}>+ Add client</PrimaryButton>}
      />

      <Panel
        title="All clients"
        subtitle="Search, filter, and review clients in one place."
        aside={
          <div className="flex flex-col gap-3 md:flex-row">
            <TextInput
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search name, company, phone, email"
              className="w-full min-w-[240px] bg-gray-50"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-green-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-green-300 focus:ring-2 focus:ring-green-100"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="lead">Lead</option>
            </select>
          </div>
        }
      >
        <MessageBanner tone="success" message={message} />
        <MessageBanner tone="danger" message={error} />

        {loading ? (
          <LoadingState label="Loading clients..." />
        ) : (
          <div className="space-y-5">
            <DataTable
              columns={[
                {
                  key: "name",
                  label: "Client",
                  render: (row) => (
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-800">{row.name || "-"}</p>
                      <p className="text-xs text-gray-500">{row.company_name || "No company added"}</p>
                    </div>
                  ),
                },
                { key: "phone", label: "Phone" },
                { key: "email", label: "Email" },
                {
                  key: "status",
                  label: "Status",
                  render: (row) => (
                    <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold capitalize text-green-700">
                      {row.status || "active"}
                    </span>
                  ),
                },
              ]}
              rows={paginatedClients}
              emptyTitle="No clients found"
              emptyDescription="Try a different search, change the filter, or add a new client."
            />

            {filteredClients.length > itemsPerPage ? (
              <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </p>

                <div className="flex items-center gap-2">
                  <SecondaryButton
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2"
                  >
                    Prev
                  </SecondaryButton>

                  <div className="flex items-center gap-1 rounded-full bg-gray-100 p-1">
                    {Array.from({ length: totalPages }, (_, index) => {
                      const page = index + 1;

                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`h-9 min-w-9 rounded-full px-3 text-sm font-semibold transition ${
                            currentPage === page
                              ? "bg-green-700 text-white"
                              : "text-gray-600 hover:bg-white"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <SecondaryButton
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2"
                  >
                    Next
                  </SecondaryButton>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </Panel>

      <div className="pointer-events-none fixed inset-0 z-[9999]">
        <div
          onClick={resetDrawer}
          className={`absolute inset-0 bg-black/35 backdrop-blur-sm transition-opacity duration-300 ${
            showDrawer ? "pointer-events-auto opacity-100" : "opacity-0"
          }`}
        />

        <aside
          className={`absolute right-0 top-0 h-full w-full max-w-xl transform bg-white shadow-2xl transition-transform duration-300 ease-out ${
            showDrawer ? "pointer-events-auto translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-gray-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-green-600">New client</p>
                  <h2 className="mt-2 text-2xl font-semibold text-gray-800">Add client</h2>
                  <p className="mt-2 text-sm text-gray-500">Fill the details here and save the client.</p>
                </div>
                <button
                  type="button"
                  onClick={resetDrawer}
                  className="rounded-full border border-gray-200 px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-50 hover:text-gray-800"
                >
                  Close
                </button>
              </div>
            </div>

            <form className="flex flex-1 flex-col overflow-y-auto px-6 py-6" onSubmit={onSubmit}>
              <div className="space-y-4">
                <Field label="Client name">
                  <TextInput
                    value={form.name}
                    onChange={onChange("name")}
                    placeholder="Rohit Sharma"
                    required
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Phone">
                    <TextInput
                      value={form.phone}
                      onChange={onChange("phone")}
                      placeholder="9876543210"
                    />
                  </Field>
                  <Field label="Email">
                    <TextInput
                      value={form.email}
                      onChange={onChange("email")}
                      placeholder="rohit@example.com"
                      type="email"
                    />
                  </Field>
                </div>

                <Field label="Company name">
                  <TextInput
                    value={form.companyName}
                    onChange={onChange("companyName")}
                    placeholder="Rohit Events"
                  />
                </Field>

                <Field label="Notes">
                  <TextArea
                    value={form.notes}
                    onChange={onChange("notes")}
                    placeholder="Any short detail for the team"
                  />
                </Field>

                <MessageBanner tone="danger" message={error} />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
                <SecondaryButton type="button" onClick={resetDrawer}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={submitting}>
                  {submitting ? <LoadingInline label="Saving..." /> : "Save client"}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
