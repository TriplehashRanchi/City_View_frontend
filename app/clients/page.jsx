"use client";

import { useEffect, useState } from "react";
import {
  DataTable,
  Field,
  MessageBanner,
  PageIntro,
  Panel,
  PrimaryButton,
  TextArea,
  TextInput,
} from "@/components/AdminUI";
import { clientsApi } from "@/services/modules";

const initialForm = {
  name: "",
  phone: "",
  email: "",
  companyName: "",
  notes: "",
};

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await clientsApi.list();
      setClients(response.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load clients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
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
      await clientsApi.create({
        ...form,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        companyName: form.companyName.trim() || null,
        notes: form.notes.trim() || null,
      });
      setForm(initialForm);
      setMessage("Client created successfully.");
      await loadClients();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to create client.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageIntro
        eyebrow="Clients"
        title="Client registry"
        description="Create and review clients stored in the `clients` table. This screen maps directly to `POST /clients` and `GET /clients`."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
        <Panel title="New client" subtitle="Register a new customer before creating events.">
          <form className="space-y-4" onSubmit={onSubmit}>
            <Field label="Client name">
              <TextInput value={form.name} onChange={onChange("name")} placeholder="Rohit Sharma" required />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Phone">
                <TextInput value={form.phone} onChange={onChange("phone")} placeholder="9876543210" />
              </Field>
              <Field label="Email">
                <TextInput value={form.email} onChange={onChange("email")} placeholder="rohit@example.com" type="email" />
              </Field>
            </div>

            <Field label="Company name">
              <TextInput value={form.companyName} onChange={onChange("companyName")} placeholder="Rohit Events" />
            </Field>

            <Field label="Notes">
              <TextArea value={form.notes} onChange={onChange("notes")} placeholder="Preferred package tier, contact timing, venue context..." />
            </Field>

            <MessageBanner tone="success" message={message} />
            <MessageBanner tone="danger" message={error} />

            <PrimaryButton type="submit" disabled={submitting}>
              {submitting ? "Creating client..." : "Create client"}
            </PrimaryButton>
          </form>
        </Panel>

        <Panel title="Saved clients" subtitle="Latest clients from the backend.">
          {loading ? (
            <p className="text-sm text-[var(--ink-soft)]">Loading clients...</p>
          ) : (
            <DataTable
              columns={[
                { key: "name", label: "Name" },
                { key: "company_name", label: "Company" },
                { key: "phone", label: "Phone" },
                { key: "email", label: "Email" },
                {
                  key: "status",
                  label: "Status",
                  render: (row) => <span className="capitalize text-[var(--foreground)]">{row.status}</span>,
                },
              ]}
              rows={clients}
              emptyTitle="No clients available"
              emptyDescription="Create the first client from the form."
            />
          )}
        </Panel>
      </div>
    </div>
  );
}
