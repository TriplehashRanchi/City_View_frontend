"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Field,
  LoadingInline,
  MessageBanner,
  PageIntro,
  Panel,
  PrimaryButton,
  SecondaryButton,
  Select,
  TextArea,
  TextInput,
} from "@/components/AdminUI";
import { clientsApi } from "@/services/clients";
import { unwrapEntityResponse } from "@/services/normalizers";

const defaultForm = {
  name: "",
  phone: "",
  email: "",
  companyName: "",
  notes: "",
  status: "active",
};

export default function ClientForm({ clientId = null }) {
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(Boolean(clientId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!clientId) return;

    const load = async () => {
      try {
        setLoading(true);
        const response = await clientsApi.get(clientId);
        const client = unwrapEntityResponse(response);
        setForm({
          name: client?.name || "",
          phone: client?.phone || "",
          email: client?.email || "",
          companyName: client?.company_name || client?.companyName || "",
          notes: client?.notes || "",
          status: client?.status || "active",
        });
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load client.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [clientId]);

  const onChange = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Client name is required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      companyName: form.companyName.trim() || null,
      notes: form.notes.trim() || null,
      status: form.status,
    };

    try {
      setSaving(true);
      if (clientId) {
        await clientsApi.update(clientId, payload);
      } else {
        await clientsApi.create(payload);
      }
      router.push("/clients");
      router.refresh();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save client.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageIntro
        eyebrow=" "
        title={clientId ? "Edit Client" : "New Client"}
        description="Clients remain separate from events. Keep contact details flat and event-agnostic."
      />

      <Panel>
        {loading ? (
          <div className="py-10 text-sm uppercase tracking-[0.16rem] text-[#5d5e61]">Loading client</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Name" required>
                <TextInput value={form.name} onChange={onChange("name")} placeholder="Rohit Sharma" />
              </Field>
              <Field label="Phone">
                <TextInput value={form.phone} onChange={onChange("phone")} placeholder="9876543210" />
              </Field>
              <Field label="Email">
                <TextInput value={form.email} onChange={onChange("email")} placeholder="rohit@example.com" />
              </Field>
              <Field label="Company Name">
                <TextInput value={form.companyName} onChange={onChange("companyName")} placeholder="Rohit Events" />
              </Field>
              <Field label="Status">
                <Select value={form.status} onChange={onChange("status")}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </Field>
            </div>

            <Field label="Notes">
              <TextArea value={form.notes} onChange={onChange("notes")} placeholder="Client notes" />
            </Field>

            <MessageBanner tone="danger" message={error} />

            <div className="flex gap-3">
              <PrimaryButton type="submit">{saving ? <LoadingInline label="Saving..." /> : "Save Client"}</PrimaryButton>
              <SecondaryButton type="button" onClick={() => router.push("/clients")}>
                Cancel
              </SecondaryButton>
            </div>
          </form>
        )}
      </Panel>
    </div>
  );
}
