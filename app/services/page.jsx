"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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

const initialForm = {
  name: "",
  costValue: "",
  pricingType: "fixed",
  description: "",
  status: "active",
};

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

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

  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);

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

  const filteredServices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return services;

    return services.filter((item) => {
      return (
        item.name?.toLowerCase().includes(term) ||
        item.pricing_type?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.status?.toLowerCase().includes(term)
      );
    });
  }, [searchTerm, services]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageIntro
        eyebrow="Catalog"
        title="Service catalog"
        description="Manage operational services such as counters, staff, styling, or logistics that can be quoted directly or embedded in packages."
      />

      <div className="max-w-sm">
        <TextInput
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search services..."
          className="bg-gray-50"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
        <Panel title="New service" subtitle="Maps to `POST /catalog/services`.">
          <form className="space-y-4" onSubmit={onSubmit}>
            <Field label="Service name">
              <TextInput value={form.name} onChange={onChange("name")} placeholder="Live Counter" required />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Cost value">
                <TextInput value={form.costValue} onChange={onChange("costValue")} placeholder="5000" type="number" min="0" step="0.01" required />
              </Field>
              <Field label="Pricing type">
                <Select value={form.pricingType} onChange={onChange("pricingType")}>
                  <option value="per_person">Per person</option>
                  <option value="per_unit">Per unit</option>
                  <option value="fixed">Fixed</option>
                </Select>
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Status">
                <Select value={form.status} onChange={onChange("status")}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </Field>
            </div>

            <Field label="Description">
              <TextArea value={form.description} onChange={onChange("description")} placeholder="Explain what the service includes." />
            </Field>

            <MessageBanner tone="success" message={message} />
            <MessageBanner tone="danger" message={error} />

            <PrimaryButton type="submit" disabled={submitting}>
              {submitting ? <LoadingInline label="Creating service..." /> : "Create service"}
            </PrimaryButton>
          </form>
        </Panel>

        <Panel title="Services" subtitle="Live list from the backend service table.">
          {loading ? (
            <LoadingState label="Loading services..." />
          ) : (
            <DataTable
              columns={[
                { key: "name", label: "Name" },
                { key: "pricing_type", label: "Pricing" },
                { key: "cost_value", label: "Cost" },
                { key: "description", label: "Description" },
                { key: "status", label: "Status" },
              ]}
              rows={filteredServices}
              emptyTitle="No services yet"
              emptyDescription="Add the first service or change the search to see results."
            />
          )}
        </Panel>
      </div>
    </div>
  );
}
