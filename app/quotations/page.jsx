"use client";

import { useEffect, useState } from "react";
import {
  DataTable,
  Field,
  MessageBanner,
  PageIntro,
  Panel,
  PrimaryButton,
  SecondaryButton,
  Select,
  TextArea,
  TextInput,
} from "@/components/AdminUI";
import { catalogApi, eventsApi, quotationsApi } from "@/services/modules";

const initialVersionForm = {
  quotationId: "",
  validUntil: "",
  termsAndConditions: "",
  customerNotes: "",
  discountType: "none",
  discountValue: "0",
  manualAdjustment: "0",
  packageId: "",
  packageGuestCount: "",
  packageQuantity: "1",
  extraServiceId: "",
  extraServicePrice: "",
  customName: "",
  customDescription: "",
  customPrice: "",
};

export default function QuotationsPage() {
  const [events, setEvents] = useState([]);
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [quotations, setQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [versionForm, setVersionForm] = useState(initialVersionForm);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const hydrateQuotation = async (quotationId) => {
    const detail = await quotationsApi.getById(quotationId);
    setSelectedQuotation(detail.data);
    setVersionForm((current) => ({ ...current, quotationId: String(quotationId) }));
  };

  const loadBootstrap = async () => {
    try {
      setLoading(true);
      const [eventsResponse, packagesResponse, servicesResponse] = await Promise.all([
        eventsApi.list({ limit: 100 }),
        catalogApi.listPackages({ status: "active", limit: 100 }),
        catalogApi.listServices({ status: "active", limit: 100 }),
      ]);
      setEvents(eventsResponse.data || []);
      setPackages(packagesResponse.data || []);
      setServices(servicesResponse.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load quotation dependencies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBootstrap();
  }, []);

  useEffect(() => {
    const loadQuotations = async () => {
      if (!selectedEventId) {
        setQuotations([]);
        setSelectedQuotation(null);
        return;
      }

      try {
        const response = await quotationsApi.listByEvent(selectedEventId);
        setQuotations(response.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load quotations for the selected event.");
      }
    };

    loadQuotations();
  }, [selectedEventId]);

  const onInitQuotation = async () => {
    if (!selectedEventId) return;

    try {
      setBusy(true);
      setMessage("");
      setError("");
      const response = await quotationsApi.init({ eventId: Number(selectedEventId) });
      setMessage("Quotation initialized successfully.");
      const refreshed = await quotationsApi.listByEvent(selectedEventId);
      setQuotations(refreshed.data || []);
      await hydrateQuotation(response.data.id);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to initialize quotation.");
    } finally {
      setBusy(false);
    }
  };

  const onVersionFieldChange = (key) => (event) => {
    setVersionForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const onCreateVersion = async (event) => {
    event.preventDefault();
    if (!versionForm.quotationId) return;

    try {
      setBusy(true);
      setMessage("");
      setError("");

      const selectedEvent = events.find((item) => String(item.id) === String(selectedEventId));
      const payload = {
        validUntil: versionForm.validUntil || null,
        termsAndConditions: versionForm.termsAndConditions.trim() || null,
        customerNotes: versionForm.customerNotes.trim() || null,
        discountType: versionForm.discountType,
        discountValue: Number(versionForm.discountValue || 0),
        manualAdjustment: Number(versionForm.manualAdjustment || 0),
        selectedPackages: versionForm.packageId
          ? [
              {
                packageId: Number(versionForm.packageId),
                quantity: Number(versionForm.packageQuantity || 1),
                guestCount: Number(versionForm.packageGuestCount || selectedEvent?.guest_count || 1),
              },
            ]
          : [],
        customItems: [
          versionForm.extraServiceId
            ? {
                catalogType: "service",
                catalogId: Number(versionForm.extraServiceId),
                pricingType: "fixed",
                quantity: 1,
                unitPriceOverride: Number(versionForm.extraServicePrice || 0),
                descriptionOverride: "Extra service added from quotation desk",
              }
            : null,
          versionForm.customName
            ? {
                catalogType: "custom",
                name: versionForm.customName,
                description: versionForm.customDescription.trim() || null,
                pricingType: "fixed",
                quantity: 1,
                unitPrice: Number(versionForm.customPrice || 0),
                unitLabel: "job",
              }
            : null,
        ].filter(Boolean),
      };

      const response = await quotationsApi.createVersion(Number(versionForm.quotationId), payload);
      setMessage("Quotation version created successfully.");
      await hydrateQuotation(versionForm.quotationId);
      setVersionForm((current) => ({ ...initialVersionForm, quotationId: current.quotationId }));
      if (response?.data?.id) {
        await quotationsApi.getById(versionForm.quotationId);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to create quotation version.");
    } finally {
      setBusy(false);
    }
  };

  const onAcceptVersion = async (versionId) => {
    try {
      setBusy(true);
      setMessage("");
      setError("");
      await quotationsApi.updateVersionStatus(versionId, {
        status: "accepted",
        notes: "Accepted from admin portal",
      });
      setMessage("Quotation version accepted.");
      await hydrateQuotation(selectedQuotation.id);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to accept quotation version.");
    } finally {
      setBusy(false);
    }
  };

  const [openPopup, setPopup] = useState(false);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageIntro
        eyebrow="Quotations"
        title="Quotation desk"
        description="Initialize quotations per event, create versions using packages and custom items, then accept a version to complete the booking flow."
      />
      <PrimaryButton type="button" onClick={()=>setPopup(true)}>
        + New Quotation
      </PrimaryButton>

      {
        openPopup &&
         <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex justify-center items-center z-50">
            <div className="bg-white w-200 h-120 overflow-y-auto p-8 rounded-lg">
              <div className="w-full flex justify-between">
                <p className="font-semibold">Quotation setup</p>
                <SecondaryButton onClick={()=>setPopup(false)}>X</SecondaryButton>
              </div>

              <div className="w-full flex flex-col space-y-5">
                <Field label="Event">
                <Select value={selectedEventId} onChange={(event) => setSelectedEventId(event.target.value)}>
                  <option value="">Select event</option>
                  {events.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.client_name} - {item.occasion_type} - {item.event_date}
                    </option>
                  ))}
                </Select>
                </Field>

                <form className="space-y-4" onSubmit={onCreateVersion}>
                <Field label="Selected quotation">
                  <Select value={versionForm.quotationId} onChange={onVersionFieldChange("quotationId")} required>
                    <option value="">Select quotation</option>
                    {quotations.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.quote_code}
                      </option>
                    ))}
                  </Select>
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Valid until">
                    <TextInput value={versionForm.validUntil} onChange={onVersionFieldChange("validUntil")} type="date" />
                  </Field>
                  <Field label="Discount type">
                    <Select value={versionForm.discountType} onChange={onVersionFieldChange("discountType")}>
                      <option value="none">None</option>
                      <option value="flat">Flat</option>
                      <option value="percentage">Percentage</option>
                    </Select>
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Discount value">
                    <TextInput value={versionForm.discountValue} onChange={onVersionFieldChange("discountValue")} type="number" step="0.01" min="0" />
                  </Field>
                  <Field label="Manual adjustment">
                    <TextInput value={versionForm.manualAdjustment} onChange={onVersionFieldChange("manualAdjustment")} type="number" step="0.01" />
                  </Field>
                </div>

                <Field label="Package">
                  <Select value={versionForm.packageId} onChange={onVersionFieldChange("packageId")}>
                    <option value="">No package</option>
                    {packages.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </Select>
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Package guest count">
                    <TextInput value={versionForm.packageGuestCount} onChange={onVersionFieldChange("packageGuestCount")} type="number" min="1" placeholder="Use event guest count if blank" />
                  </Field>
                  <Field label="Package quantity">
                    <TextInput value={versionForm.packageQuantity} onChange={onVersionFieldChange("packageQuantity")} type="number" min="0.01" step="0.01" />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Extra service">
                    <Select value={versionForm.extraServiceId} onChange={onVersionFieldChange("extraServiceId")}>
                      <option value="">No extra service</option>
                      {services.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Extra service override price">
                    <TextInput value={versionForm.extraServicePrice} onChange={onVersionFieldChange("extraServicePrice")} type="number" min="0" step="0.01" placeholder="4500" />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Custom item name">
                    <TextInput value={versionForm.customName} onChange={onVersionFieldChange("customName")} placeholder="Decoration" />
                  </Field>
                  <Field label="Custom item price">
                    <TextInput value={versionForm.customPrice} onChange={onVersionFieldChange("customPrice")} type="number" min="0" step="0.01" placeholder="12000" />
                  </Field>
                </div>

                <Field label="Custom item description">
                  <TextArea value={versionForm.customDescription} onChange={onVersionFieldChange("customDescription")} placeholder="Stage and floral decoration" />
                </Field>

                <Field label="Terms and conditions">
                  <TextArea value={versionForm.termsAndConditions} onChange={onVersionFieldChange("termsAndConditions")} placeholder="50% advance required before production begins." />
                </Field>

                <Field label="Customer notes">
                  <TextArea value={versionForm.customerNotes} onChange={onVersionFieldChange("customerNotes")} placeholder="Best package for the selected venue and guest count." />
                </Field>

                <PrimaryButton type="submit" disabled={busy || !versionForm.quotationId}>
                  {busy ? "Saving..." : "Create quotation version"}
                </PrimaryButton>
              </form>
          </div>
      </div>
    </div>
  }

      <MessageBanner tone="success" message={message} />
      <MessageBanner tone="danger" message={error} />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.2fr]">
        <Panel title="Quotation setup" subtitle="Pick an event, initialize a quotation, and create versions.">
          {loading ? (
            <p className="text-sm text-[var(--ink-soft)]">Loading quotation dependencies...</p>
          ) : (
            <div className="space-y-5">
              <Field label="Event">
                <Select value={selectedEventId} onChange={(event) => setSelectedEventId(event.target.value)}>
                  <option value="">Select event</option>
                  {events.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.client_name} - {item.occasion_type} - {item.event_date}
                    </option>
                  ))}
                </Select>
              </Field>

              <PrimaryButton type="button" onClick={onInitQuotation} disabled={!selectedEventId || busy}>
                {busy ? "Processing..." : "Initialize quotation"}
              </PrimaryButton>

              <div className="space-y-3 rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,250,242,0.8)] p-4">
                <h3 className="text-sm font-semibold text-[var(--foreground)]">Existing quotations for this event</h3>
                {quotations.length ? (
                  quotations.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => hydrateQuotation(item.id)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                        String(selectedQuotation?.id) === String(item.id)
                          ? "border-[rgba(201,111,74,0.45)] bg-white"
                          : "border-[var(--line)] bg-[rgba(255,255,255,0.65)]"
                      }`}
                    >
                      <p className="text-sm font-semibold text-[var(--foreground)]">{item.quote_code}</p>
                      <p className="mt-1 text-xs text-[var(--ink-soft)]">
                        Current version {item.current_version_number} · status {item.current_status}
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-[var(--ink-soft)]">No quotation exists for this event yet.</p>
                )}
              </div>

              <form className="space-y-4" onSubmit={onCreateVersion}>
                <Field label="Selected quotation">
                  <Select value={versionForm.quotationId} onChange={onVersionFieldChange("quotationId")} required>
                    <option value="">Select quotation</option>
                    {quotations.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.quote_code}
                      </option>
                    ))}
                  </Select>
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Valid until">
                    <TextInput value={versionForm.validUntil} onChange={onVersionFieldChange("validUntil")} type="date" />
                  </Field>
                  <Field label="Discount type">
                    <Select value={versionForm.discountType} onChange={onVersionFieldChange("discountType")}>
                      <option value="none">None</option>
                      <option value="flat">Flat</option>
                      <option value="percentage">Percentage</option>
                    </Select>
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Discount value">
                    <TextInput value={versionForm.discountValue} onChange={onVersionFieldChange("discountValue")} type="number" step="0.01" min="0" />
                  </Field>
                  <Field label="Manual adjustment">
                    <TextInput value={versionForm.manualAdjustment} onChange={onVersionFieldChange("manualAdjustment")} type="number" step="0.01" />
                  </Field>
                </div>

                <Field label="Package">
                  <Select value={versionForm.packageId} onChange={onVersionFieldChange("packageId")}>
                    <option value="">No package</option>
                    {packages.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </Select>
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Package guest count">
                    <TextInput value={versionForm.packageGuestCount} onChange={onVersionFieldChange("packageGuestCount")} type="number" min="1" placeholder="Use event guest count if blank" />
                  </Field>
                  <Field label="Package quantity">
                    <TextInput value={versionForm.packageQuantity} onChange={onVersionFieldChange("packageQuantity")} type="number" min="0.01" step="0.01" />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Extra service">
                    <Select value={versionForm.extraServiceId} onChange={onVersionFieldChange("extraServiceId")}>
                      <option value="">No extra service</option>
                      {services.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Extra service override price">
                    <TextInput value={versionForm.extraServicePrice} onChange={onVersionFieldChange("extraServicePrice")} type="number" min="0" step="0.01" placeholder="4500" />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Custom item name">
                    <TextInput value={versionForm.customName} onChange={onVersionFieldChange("customName")} placeholder="Decoration" />
                  </Field>
                  <Field label="Custom item price">
                    <TextInput value={versionForm.customPrice} onChange={onVersionFieldChange("customPrice")} type="number" min="0" step="0.01" placeholder="12000" />
                  </Field>
                </div>

                <Field label="Custom item description">
                  <TextArea value={versionForm.customDescription} onChange={onVersionFieldChange("customDescription")} placeholder="Stage and floral decoration" />
                </Field>

                <Field label="Terms and conditions">
                  <TextArea value={versionForm.termsAndConditions} onChange={onVersionFieldChange("termsAndConditions")} placeholder="50% advance required before production begins." />
                </Field>

                <Field label="Customer notes">
                  <TextArea value={versionForm.customerNotes} onChange={onVersionFieldChange("customerNotes")} placeholder="Best package for the selected venue and guest count." />
                </Field>

                <PrimaryButton type="submit" disabled={busy || !versionForm.quotationId}>
                  {busy ? "Saving..." : "Create quotation version"}
                </PrimaryButton>
              </form>
            </div>
          )}
        </Panel>

        <Panel title="Quotation details" subtitle="Shows the selected quotation and its saved versions.">
          {selectedQuotation ? (
            <div className="space-y-5">
              <div className="rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,250,242,0.75)] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--accent-deep)]">{selectedQuotation.quote_code}</p>
                <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                  {selectedQuotation.client_name} · {selectedQuotation.occasion_type}
                </h3>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">
                  Event on {selectedQuotation.event_date} at {selectedQuotation.venue}
                </p>
              </div>

              <DataTable
                columns={[
                  { key: "version_number", label: "Version" },
                  { key: "status", label: "Status" },
                  { key: "valid_until", label: "Valid Until" },
                  { key: "subtotal_amount", label: "Subtotal" },
                  { key: "discount_amount", label: "Discount" },
                  { key: "final_amount", label: "Final" },
                  {
                    key: "actions",
                    label: "Actions",
                    render: (row) => (
                      <SecondaryButton type="button" onClick={() => onAcceptVersion(row.id)} disabled={busy || row.status === "accepted"}>
                        {row.status === "accepted" ? "Accepted" : "Accept"}
                      </SecondaryButton>
                    ),
                  },
                ]}
                rows={selectedQuotation.versions || []}
                emptyTitle="No versions yet"
                emptyDescription="Create a quotation version from the form."
              />
            </div>
          ) : (
            <p className="text-sm text-[var(--ink-soft)]">Select an event and quotation to inspect its versions.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}
