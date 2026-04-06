"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Field,
  LoadingInline,
  LoadingState,
  MessageBanner,
  PageIntro,
  Panel,
  PrimaryButton,
  SecondaryButton,
  Select,
  TextArea,
  TextInput,
} from "@/components/AdminUI";
import { useToast } from "@/components/ToastProvider";
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

function SectionHeading({ number, title, subtitle }) {
  return (
    <div className="flex items-start gap-4 pb-2">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
        {number}
      </span>
      <div>
        <h3 className="text-base font-bold text-gray-800">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function VersionStatusBadge({ status }) {
  const colors = {
    draft: "bg-amber-50 text-amber-700 border-amber-200",
    sent: "bg-blue-50 text-blue-700 border-blue-200",
    accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
  };
  const key = (status || "draft").toLowerCase();
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${colors[key] || colors.draft}`}>
      {key}
    </span>
  );
}

export default function NewQuotationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const initialEventId = searchParams.get("eventId") || "";
  const initialQuotationId = searchParams.get("quotationId") || "";

  const [events, setEvents] = useState([]);
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [quotations, setQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [versionForm, setVersionForm] = useState(() => ({
    ...initialVersionForm,
    quotationId: initialQuotationId,
  }));
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const selectedEvent = useMemo(
    () => events.find((item) => String(item.id) === String(selectedEventId)),
    [events, selectedEventId]
  );

  const hydrateQuotation = useCallback(
    async (quotationId) => {
      try {
        const detail = await quotationsApi.getById(quotationId);
        setSelectedQuotation(detail.data);
        setVersionForm((current) => ({ ...current, quotationId: String(quotationId) }));
      } catch (err) {
        const message = err?.response?.data?.message || "Unable to load quotation details.";
        setError(message);
        toast({
          variant: "error",
          title: "Quotation not loaded",
          description: message,
        });
      }
    },
    [toast]
  );

  const loadBootstrap = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [eventsResponse, packagesResponse, servicesResponse] = await Promise.all([
        eventsApi.list({ limit: 100 }),
        catalogApi.listPackages({ status: "active", limit: 100 }),
        catalogApi.listServices({ status: "active", limit: 100 }),
      ]);
      setEvents(eventsResponse.data || []);
      setPackages(packagesResponse.data || []);
      setServices(servicesResponse.data || []);
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to load quotation dependencies.";
      setError(message);
      toast({
        variant: "error",
        title: "Quotation workspace not loaded",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadQuotations = useCallback(
    async (eventId, preferredQuotationId = "") => {
      if (!eventId) {
        setQuotations([]);
        setSelectedQuotation(null);
        setVersionForm((current) => ({ ...initialVersionForm, quotationId: current.quotationId || "" }));
        return;
      }

      try {
        const response = await quotationsApi.listByEvent(eventId);
        const items = response.data || [];
        setQuotations(items);

        if (preferredQuotationId && items.some((item) => String(item.id) === String(preferredQuotationId))) {
          await hydrateQuotation(preferredQuotationId);
          return;
        }

        setSelectedQuotation(null);
        setVersionForm((current) => ({ ...current, quotationId: "" }));
      } catch (err) {
        const message = err?.response?.data?.message || "Unable to load quotations for the selected event.";
        setError(message);
        toast({
          variant: "error",
          title: "Event quotations not loaded",
          description: message,
        });
      }
    },
    [hydrateQuotation, toast]
  );

  useEffect(() => {
    loadBootstrap();
  }, [loadBootstrap]);

  useEffect(() => {
    loadQuotations(selectedEventId, initialQuotationId);
  }, [initialQuotationId, loadQuotations, selectedEventId]);

  useEffect(() => {
    if (!versionForm.quotationId) {
      if (!initialQuotationId) {
        setSelectedQuotation(null);
      }
      return;
    }

    if (String(selectedQuotation?.id) === String(versionForm.quotationId)) {
      return;
    }

    hydrateQuotation(versionForm.quotationId);
  }, [hydrateQuotation, initialQuotationId, selectedQuotation?.id, versionForm.quotationId]);

  const onVersionFieldChange = (key) => (event) => {
    setVersionForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const onInitQuotation = async () => {
    if (!selectedEventId) return;

    try {
      setBusy(true);
      setError("");
      const response = await quotationsApi.init({ eventId: Number(selectedEventId) });
      toast({
        variant: "success",
        title: "Quotation initialized",
        description: "The quotation is ready for version creation.",
      });
      await loadQuotations(selectedEventId, response.data.id);
      await hydrateQuotation(response.data.id);
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to initialize quotation.";
      setError(message);
      toast({
        variant: "error",
        title: "Quotation not initialized",
        description: message,
      });
    } finally {
      setBusy(false);
    }
  };

  const onCreateVersion = async (event) => {
    event.preventDefault();
    if (!versionForm.quotationId) return;

    try {
      setBusy(true);
      setError("");

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

      await quotationsApi.createVersion(Number(versionForm.quotationId), payload);
      toast({
        variant: "success",
        title: "Quotation version saved",
        description: "The new version has been created successfully.",
      });
      router.push("/quotations?created=1");
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to create quotation version.";
      setError(message);
      toast({
        variant: "error",
        title: "Version not saved",
        description: message,
      });
    } finally {
      setBusy(false);
    }
  };

  const onAcceptVersion = async (versionId) => {
    if (!selectedQuotation?.id) return;

    try {
      setBusy(true);
      setError("");
      await quotationsApi.updateVersionStatus(versionId, {
        status: "accepted",
        notes: "Accepted from admin portal",
      });
      toast({
        variant: "success",
        title: "Version accepted",
        description: "The quotation version status has been updated.",
      });
      await hydrateQuotation(selectedQuotation.id);
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to accept quotation version.";
      setError(message);
      toast({
        variant: "error",
        title: "Version not accepted",
        description: message,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <PageIntro
        eyebrow="Quotations"
        title="Quotation workspace"
        description="Create and manage quotation versions from a single, streamlined workspace."
        action={
          <div className="flex items-center gap-3">
            <SecondaryButton type="button" onClick={() => router.push("/quotations")}>
              Back to list
            </SecondaryButton>
            <PrimaryButton type="button" onClick={onInitQuotation} disabled={!selectedEventId || busy || loading}>
              {busy ? <LoadingInline label="Processing..." /> : "Initialize quotation"}
            </PrimaryButton>
          </div>
        }
      />

      {loading ? (
        <LoadingState label="Loading workspace..." className="py-20" />
      ) : (
        <div className="space-y-6">
          {/* Section 1: Event & Quotation Selection */}
          <Panel>
            <SectionHeading number="1" title="Select event & quotation" subtitle="Pick the event, then choose or initialize a quotation." />

            <div className="mt-5 space-y-5">
              <Field label="Event">
                <Select
                  value={selectedEventId}
                  onChange={(event) => {
                    setSelectedEventId(event.target.value);
                    setSelectedQuotation(null);
                    setVersionForm(() => ({ ...initialVersionForm, quotationId: "" }));
                  }}
                >
                  <option value="">Select event</option>
                  {events.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.client_name} — {item.occasion_type} — {item.event_date}
                    </option>
                  ))}
                </Select>
              </Field>

              {selectedEvent && (
                <div className="rounded-2xl border border-green-100 bg-gradient-to-r from-green-50/80 to-white p-5">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-green-600">Client</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">{selectedEvent.client_name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-green-600">Occasion</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">{selectedEvent.occasion_type}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-green-600">Date</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">{selectedEvent.event_date}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-green-600">Venue</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">{selectedEvent.venue || "Pending"}</p>
                    </div>
                  </div>
                </div>
              )}

              {quotations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Existing quotations</p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {quotations.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => hydrateQuotation(item.id)}
                        className={`rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
                          String(selectedQuotation?.id) === String(item.id)
                            ? "border-green-300 bg-green-50 shadow-sm"
                            : "border-gray-100 bg-white hover:border-green-200 hover:shadow-sm"
                        }`}
                      >
                        <p className="text-sm font-bold text-gray-800">{item.quote_code}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          v{item.current_version_number || "—"} · {item.current_status || "draft"}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <MessageBanner tone="danger" message={error} />
            </div>
          </Panel>

          {/* Section 2: Create Version Form */}
          <Panel>
            <SectionHeading number="2" title="Create version" subtitle="Fill in the details to generate a new quotation version." />

            <form className="mt-5 space-y-6" onSubmit={onCreateVersion}>
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

              {/* Pricing row */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">Pricing & Discount</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  <Field label="Discount value">
                    <TextInput value={versionForm.discountValue} onChange={onVersionFieldChange("discountValue")} type="number" step="0.01" min="0" />
                  </Field>
                  <Field label="Manual adjustment">
                    <TextInput value={versionForm.manualAdjustment} onChange={onVersionFieldChange("manualAdjustment")} type="number" step="0.01" />
                  </Field>
                </div>
              </div>

              {/* Package row */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">Package</p>
                <div className="grid gap-4 sm:grid-cols-3">
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
                  <Field label="Guest count">
                    <TextInput
                      value={versionForm.packageGuestCount}
                      onChange={onVersionFieldChange("packageGuestCount")}
                      type="number"
                      min="1"
                      placeholder="Event default"
                    />
                  </Field>
                  <Field label="Quantity">
                    <TextInput
                      value={versionForm.packageQuantity}
                      onChange={onVersionFieldChange("packageQuantity")}
                      type="number"
                      min="0.01"
                      step="0.01"
                    />
                  </Field>
                </div>
              </div>

              {/* Extra service row */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">Extra Service</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Service">
                    <Select value={versionForm.extraServiceId} onChange={onVersionFieldChange("extraServiceId")}>
                      <option value="">No extra service</option>
                      {services.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Override price">
                    <TextInput
                      value={versionForm.extraServicePrice}
                      onChange={onVersionFieldChange("extraServicePrice")}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="4500"
                    />
                  </Field>
                </div>
              </div>

              {/* Custom item row */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">Custom Item</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name">
                    <TextInput value={versionForm.customName} onChange={onVersionFieldChange("customName")} placeholder="Decoration" />
                  </Field>
                  <Field label="Price">
                    <TextInput
                      value={versionForm.customPrice}
                      onChange={onVersionFieldChange("customPrice")}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="12000"
                    />
                  </Field>
                </div>
                <div className="mt-4">
                  <Field label="Description">
                    <TextArea
                      value={versionForm.customDescription}
                      onChange={onVersionFieldChange("customDescription")}
                      placeholder="Stage and floral decoration"
                    />
                  </Field>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-4">
                <Field label="Terms and conditions">
                  <TextArea
                    value={versionForm.termsAndConditions}
                    onChange={onVersionFieldChange("termsAndConditions")}
                    placeholder="50% advance required before production begins."
                  />
                </Field>
                <Field label="Customer notes">
                  <TextArea
                    value={versionForm.customerNotes}
                    onChange={onVersionFieldChange("customerNotes")}
                    placeholder="Best package for the selected venue and guest count."
                  />
                </Field>
              </div>

              <div className="flex justify-end border-t border-gray-100 pt-5">
                <PrimaryButton type="submit" disabled={busy || !versionForm.quotationId}>
                  {busy ? <LoadingInline label="Saving..." /> : "Save quotation version"}
                </PrimaryButton>
              </div>
            </form>
          </Panel>

          {/* Section 3: Quotation Details & Versions */}
          <Panel>
            <SectionHeading number="3" title="Quotation details" subtitle="Review saved versions and accept the final one." />

            <div className="mt-5">
              {selectedQuotation ? (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-green-100 bg-gradient-to-r from-green-50/80 to-white p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-green-600">
                          {selectedQuotation.quote_code}
                        </p>
                        <h3 className="mt-1.5 text-lg font-bold text-gray-800">
                          {selectedQuotation.client_name} · {selectedQuotation.occasion_type}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {selectedQuotation.event_date} at {selectedQuotation.venue}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedQuotation.versions?.length > 0 ? (
                    <div className="space-y-3">
                      {selectedQuotation.versions.map((version) => (
                        <div
                          key={version.id}
                          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition-all duration-200 hover:border-green-100 hover:shadow-sm"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-sm font-bold text-green-700">
                              v{version.version_number}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-gray-800">Version {version.version_number}</p>
                                <VersionStatusBadge status={version.status} />
                              </div>
                              <p className="mt-0.5 text-xs text-gray-500">
                                Valid until {version.valid_until || "—"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Subtotal</p>
                              <p className="text-sm font-semibold text-gray-700">{version.subtotal_amount ?? "—"}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Discount</p>
                              <p className="text-sm font-semibold text-gray-700">{version.discount_amount ?? "—"}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Final</p>
                              <p className="text-sm font-bold text-gray-800">{version.final_amount ?? "—"}</p>
                            </div>
                            <SecondaryButton
                              type="button"
                              onClick={() => onAcceptVersion(version.id)}
                              disabled={busy || version.status === "accepted"}
                              className="!px-4 !py-2 text-xs"
                            >
                              {version.status === "accepted" ? "Accepted" : "Accept"}
                            </SecondaryButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-green-300 bg-green-50/50 py-10 text-center">
                      <p className="text-sm font-semibold text-gray-700">No versions yet</p>
                      <p className="mt-1 text-sm text-gray-500">Create a version from the form above to see it here.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-10 text-center">
                  <p className="text-sm text-gray-500">Select an event and quotation to review its saved versions.</p>
                </div>
              )}
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
