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

const emptyPackageSelection = {
  packageId: "",
  packageGuestCount: "",
  packageQuantity: "1",
};

const initialVersionForm = {
  quotationId: "",
  validUntil: "",
  termsAndConditions: "",
  customerNotes: "",
  discountType: "none",
  discountValue: "0",
  manualAdjustment: "0",
  packageSelections: [emptyPackageSelection],
  customName: "",
  customDescription: "",
  customPrice: "",
};

const initialNewCustomerForm = {
  clientName: "",
  clientPhone: "",
  clientEmail: "",
  companyName: "",
  clientNotes: "",
  occasionType: "",
  eventDate: "",
  startTime: "",
  endTime: "",
  guestCount: "",
  venue: "",
  eventNotes: "",
};

const buildVersionFormFromDetail = (versionDetail) => {
  const packageLines = versionDetail.lineItems?.filter((item) => item.source_type === "package") || [];
  const customLine = versionDetail.lineItems?.find((item) => item.catalog_type === "custom");

  return {
    ...initialVersionForm,
    quotationId: String(versionDetail.quotation_id),
    validUntil: versionDetail.valid_until ? String(versionDetail.valid_until).slice(0, 10) : "",
    termsAndConditions: versionDetail.terms_and_conditions || "",
    customerNotes: versionDetail.customer_notes || "",
    discountType: versionDetail.discount_type || "none",
    discountValue: String(versionDetail.discount_value ?? 0),
    manualAdjustment: String(versionDetail.manual_adjustment ?? 0),
    packageSelections: packageLines.length
      ? packageLines.map((item) => ({
          packageId: item.catalog_id ? String(item.catalog_id) : "",
          packageGuestCount: item.guest_count ? String(item.guest_count) : "",
          packageQuantity: item.quantity ? String(item.quantity) : "1",
        }))
      : [emptyPackageSelection],
    customName: customLine?.item_name || "",
    customDescription: customLine?.item_description || "",
    customPrice: customLine?.unit_price ? String(customLine.unit_price) : "",
  };
};

const buildVersionPayload = (form, eventGuestCount) => ({
  validUntil: form.validUntil || null,
  termsAndConditions: form.termsAndConditions.trim() || null,
  customerNotes: form.customerNotes.trim() || null,
  discountType: form.discountType,
  discountValue: Number(form.discountValue || 0),
  manualAdjustment: Number(form.manualAdjustment || 0),
  selectedPackages: (form.packageSelections || [])
    .filter((item) => item.packageId)
    .map((item) => ({
      packageId: Number(item.packageId),
      quantity: Number(item.packageQuantity || 1),
      guestCount: Number(item.packageGuestCount || eventGuestCount || 1),
    })),
  customItems: [
    form.customName.trim() || form.customDescription.trim() || form.customPrice
      ? {
          catalogType: "custom",
          name: form.customName.trim() || "Custom item",
          description: form.customDescription.trim() || null,
          pricingType: "fixed",
          quantity: 1,
          unitPrice: Number(form.customPrice || 0),
          unitLabel: "job",
        }
      : null,
  ].filter(Boolean),
});

const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const resolveLineTotal = ({ pricingType, unitPrice, quantity = 1, guestCount = 0 }) => {
  const safeUnitPrice = Number(unitPrice || 0);
  const safeQuantity = Math.max(Number(quantity || 0), 0);
  const safeGuestCount = Math.max(Number(guestCount || 0), 0);

  if (pricingType === "per_person") {
    return roundMoney(safeUnitPrice * safeGuestCount * Math.max(safeQuantity, 1));
  }
  if (pricingType === "per_unit") {
    return roundMoney(safeUnitPrice * safeQuantity);
  }
  return roundMoney(safeUnitPrice * Math.max(safeQuantity, 1));
};

const computeDiscountAmount = ({ subtotalAmount, discountType, discountValue }) => {
  const subtotal = Number(subtotalAmount || 0);
  const value = Number(discountValue || 0);

  if (discountType === "none" || !value) return 0;
  if (discountType === "flat") return roundMoney(Math.min(value, subtotal));
  if (discountType === "percentage") return roundMoney(Math.min((subtotal * value) / 100, subtotal));
  return 0;
};

const formatMoney = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

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
  const isReadOnly = searchParams.get("mode") === "view";

  const [events, setEvents] = useState([]);
  const [packages, setPackages] = useState([]);
  const [workspaceMode, setWorkspaceMode] = useState(initialQuotationId ? "existing" : "create");
  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [quotations, setQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [newCustomerForm, setNewCustomerForm] = useState(initialNewCustomerForm);
  const [editingVersionMeta, setEditingVersionMeta] = useState(null);
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

  const quotationTotals = useMemo(() => {
    const defaultGuestCount = Number(
      selectedEvent?.guest_count || newCustomerForm.guestCount || 1
    );

    const packageSubtotal = (versionForm.packageSelections || []).reduce((sum, selection) => {
      const pkg = packages.find((item) => String(item.id) === String(selection.packageId));
      if (!pkg) return sum;

      return (
        sum +
        resolveLineTotal({
          pricingType: pkg.pricing_type,
          unitPrice: pkg.base_price,
          quantity: selection.packageQuantity || 1,
          guestCount: selection.packageGuestCount || defaultGuestCount,
        })
      );
    }, 0);

    const customSubtotal =
      versionForm.customName.trim() || versionForm.customDescription.trim() || versionForm.customPrice
        ? resolveLineTotal({
            pricingType: "fixed",
            unitPrice: versionForm.customPrice || 0,
            quantity: 1,
            guestCount: defaultGuestCount,
          })
        : 0;

    const subtotalAmount = roundMoney(packageSubtotal + customSubtotal);
    const discountAmount = computeDiscountAmount({
      subtotalAmount,
      discountType: versionForm.discountType,
      discountValue: versionForm.discountValue,
    });
    const manualAdjustment = roundMoney(Number(versionForm.manualAdjustment || 0));
    const finalAmount = roundMoney(subtotalAmount - discountAmount + manualAdjustment);

    return {
      subtotalAmount,
      discountAmount,
      manualAdjustment,
      finalAmount,
    };
  }, [newCustomerForm.guestCount, packages, selectedEvent?.guest_count, versionForm]);

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
      const [eventsResponse, packagesResponse] = await Promise.all([
        eventsApi.list({ limit: 100 }),
        catalogApi.listPackages({ status: "active", limit: 100 }),
      ]);
      setEvents(eventsResponse.data || []);
      setPackages(packagesResponse.data || []);
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

  const onPackageSelectionChange = (index, key) => (event) => {
    const value = event.target.value;
    setVersionForm((current) => ({
      ...current,
      packageSelections: (current.packageSelections || []).map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addPackageSelection = () => {
    setVersionForm((current) => ({
      ...current,
      packageSelections: [...(current.packageSelections || []), { ...emptyPackageSelection }],
    }));
  };

  const removePackageSelection = (index) => {
    setVersionForm((current) => {
      const nextRows = (current.packageSelections || []).filter((_, itemIndex) => itemIndex !== index);
      return {
        ...current,
        packageSelections: nextRows.length ? nextRows : [{ ...emptyPackageSelection }],
      };
    });
  };

  const onNewCustomerFieldChange = (key) => (event) => {
    setNewCustomerForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const onEditPreviousVersion = async (versionId) => {
    try {
      setBusy(true);
      setError("");
      const response = await quotationsApi.getVersionById(versionId);
      const versionDetail = response.data;

      setVersionForm(buildVersionFormFromDetail(versionDetail));
      setEditingVersionMeta({
        id: versionDetail.id,
        versionNumber: versionDetail.version_number,
      });

      toast({
        variant: "success",
        title: "Version loaded for editing",
        description: `Version ${versionDetail.version_number} is ready to edit and save as the next version.`,
      });
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to load the selected version.";
      setError(message);
      toast({
        variant: "error",
        title: "Version not loaded",
        description: message,
      });
    } finally {
      setBusy(false);
    }
  };

  const onCreateNewQuotationFlow = async (event) => {
    event.preventDefault();

    try {
      setBusy(true);
      setError("");

      const createdEventResponse = await eventsApi.create({
        occasionType: newCustomerForm.occasionType.trim(),
        eventDate: newCustomerForm.eventDate,
        startTime: newCustomerForm.startTime,
        endTime: newCustomerForm.endTime || null,
        guestCount: Number(newCustomerForm.guestCount),
        venue: newCustomerForm.venue.trim() || null,
        notes: newCustomerForm.eventNotes.trim() || null,
        client: {
          name: newCustomerForm.clientName.trim(),
          phone: newCustomerForm.clientPhone.trim() || null,
          email: newCustomerForm.clientEmail.trim() || null,
          companyName: newCustomerForm.companyName.trim() || null,
          notes: newCustomerForm.clientNotes.trim() || null,
        },
      });

      const createdEvent = createdEventResponse.data;
      const quotationResponse = await quotationsApi.init({ eventId: Number(createdEvent.id) });
      const versionPayload = buildVersionPayload(versionForm, Number(newCustomerForm.guestCount));

      await quotationsApi.createVersion(Number(quotationResponse.data.id), versionPayload);

      toast({
        variant: "success",
        title: "Quotation created successfully",
        description: "Customer, booking, quotation, and first version were created together.",
      });
      router.push("/quotations?created=1");
    } catch (err) {
      const message =
        err?.response?.data?.message || "Unable to create the quotation in one flow.";
      setError(message);
      toast({
        variant: "error",
        title: "Quotation not created",
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
      const payload = buildVersionPayload(versionForm, selectedEvent?.guest_count);
      await quotationsApi.createVersion(Number(versionForm.quotationId), payload);
      setEditingVersionMeta(null);
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
        title={isReadOnly ? "Quotation details" : "Quotation workspace"}
        description={
          workspaceMode === "create"
            ? "Create a fresh customer quotation in one clean flow."
            : isReadOnly
              ? "Review the saved quotation, its totals, and version history in read-only mode."
              : "Review and revise one quotation without re-entering everything."
        }
        action={
          <SecondaryButton type="button" onClick={() => router.push("/quotations")}>
            Back to list
          </SecondaryButton>
        }
      />

      {loading ? (
        <LoadingState label="Loading workspace..." className="py-20" />
      ) : (
        <div className="space-y-6">
          {workspaceMode === "create" ? (
            <Panel>
              <SectionHeading
                number="1"
                title="Create new quotation"
                subtitle="Add the customer and booking details once. The quotation workspace will open automatically after that."
              />

              <form className="mt-5 space-y-5" onSubmit={onCreateNewQuotationFlow}>
                <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
                  <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">Customer details</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Customer name">
                      <TextInput value={newCustomerForm.clientName} onChange={onNewCustomerFieldChange("clientName")} required />
                    </Field>
                    <Field label="Phone">
                      <TextInput value={newCustomerForm.clientPhone} onChange={onNewCustomerFieldChange("clientPhone")} />
                    </Field>
                    <Field label="Email (optional)">
                      <TextInput value={newCustomerForm.clientEmail} onChange={onNewCustomerFieldChange("clientEmail")} type="email" />
                    </Field>
                    <Field label="Company name (optional)">
                      <TextInput value={newCustomerForm.companyName} onChange={onNewCustomerFieldChange("companyName")} />
                    </Field>
                  </div>
                  <div className="mt-4">
                    <Field label="Customer notes (optional)">
                      <TextArea
                        value={newCustomerForm.clientNotes}
                        onChange={onNewCustomerFieldChange("clientNotes")}
                        placeholder="Lead source, preferences, follow-up notes"
                      />
                    </Field>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
                  <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">Booking details</p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Field label="Occasion">
                      <TextInput value={newCustomerForm.occasionType} onChange={onNewCustomerFieldChange("occasionType")} required />
                    </Field>
                    <Field label="Event date">
                      <TextInput value={newCustomerForm.eventDate} onChange={onNewCustomerFieldChange("eventDate")} type="date" required />
                    </Field>
                    <Field label="Start time">
                      <TextInput value={newCustomerForm.startTime} onChange={onNewCustomerFieldChange("startTime")} type="time" required />
                    </Field>
                    <Field label="End time">
                      <TextInput value={newCustomerForm.endTime} onChange={onNewCustomerFieldChange("endTime")} type="time" />
                    </Field>
                    <Field label="Guest count">
                      <TextInput value={newCustomerForm.guestCount} onChange={onNewCustomerFieldChange("guestCount")} type="number" min="1" required />
                    </Field>
                    <Field label="Venue (optional)">
                      <TextInput value={newCustomerForm.venue} onChange={onNewCustomerFieldChange("venue")} />
                    </Field>
                  </div>
                  <div className="mt-4">
                    <Field label="Event notes (optional)">
                      <TextArea
                        value={newCustomerForm.eventNotes}
                        onChange={onNewCustomerFieldChange("eventNotes")}
                        placeholder="Special requirements, booking remarks, timeline context"
                      />
                    </Field>
                  </div>
                </div>

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

                <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Packages</p>
                    <SecondaryButton type="button" onClick={addPackageSelection} className="!px-4 !py-2 text-xs">
                      + Add package
                    </SecondaryButton>
                  </div>
                  <div className="space-y-4">
                    {(versionForm.packageSelections || []).map((pkg, index) => (
                      <div key={`create-package-${index}`} className="grid gap-4 sm:grid-cols-[1.3fr_1fr_1fr_auto]">
                        <Field label="Package">
                          <Select value={pkg.packageId} onChange={onPackageSelectionChange(index, "packageId")}>
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
                            value={pkg.packageGuestCount}
                            onChange={onPackageSelectionChange(index, "packageGuestCount")}
                            type="number"
                            min="1"
                            placeholder="Event default"
                          />
                        </Field>
                        <Field label="Quantity">
                          <TextInput
                            value={pkg.packageQuantity}
                            onChange={onPackageSelectionChange(index, "packageQuantity")}
                            type="number"
                            min="0.01"
                            step="0.01"
                          />
                        </Field>
                        <div className="flex items-end">
                          <SecondaryButton type="button" onClick={() => removePackageSelection(index)} className="!px-4 !py-3 text-xs">
                            Remove
                          </SecondaryButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
                  <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">Custom Item</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Name (optional)">
                      <TextInput value={versionForm.customName} onChange={onVersionFieldChange("customName")} placeholder="Decoration" />
                    </Field>
                    <Field label="Price (optional)">
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
                    <Field label="Description (optional)">
                      <TextArea
                        value={versionForm.customDescription}
                        onChange={onVersionFieldChange("customDescription")}
                        placeholder="Stage and floral decoration"
                      />
                    </Field>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
                  <Field label="Terms and conditions (optional)">
                    <TextArea
                      value={versionForm.termsAndConditions}
                      onChange={onVersionFieldChange("termsAndConditions")}
                      placeholder="50% advance required before production begins."
                    />
                  </Field>
                  <Field label="Customer notes for quotation (optional)">
                    <TextArea
                      value={versionForm.customerNotes}
                      onChange={onVersionFieldChange("customerNotes")}
                      placeholder="Best package for the selected venue and guest count."
                    />
                  </Field>
                </div>

                <div className="rounded-2xl border border-green-100 bg-gradient-to-r from-green-50 to-white p-5">
                  <p className="mb-4 text-xs font-bold uppercase tracking-widest text-green-700">Quotation Summary</p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Subtotal</p>
                      <p className="mt-2 text-xl font-semibold text-gray-800">{formatMoney(quotationTotals.subtotalAmount)}</p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Discount</p>
                      <p className="mt-2 text-xl font-semibold text-rose-600">- {formatMoney(quotationTotals.discountAmount)}</p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Manual Adj.</p>
                      <p className="mt-2 text-xl font-semibold text-gray-800">{formatMoney(quotationTotals.manualAdjustment)}</p>
                    </div>
                    <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-widest text-green-700">Final Total</p>
                      <p className="mt-2 text-2xl font-bold text-green-800">{formatMoney(quotationTotals.finalAmount)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <PrimaryButton type="submit" disabled={busy}>
                    {busy ? <LoadingInline label="Creating..." /> : "Create full quotation"}
                  </PrimaryButton>
                </div>
                <MessageBanner tone="danger" message={error} />
              </form>
            </Panel>
          ) : (
            <Panel>
              <SectionHeading
                number="1"
                title="Quotation overview"
                subtitle="This workspace is focused on one quotation. Edit from any previous version and save it as the next version."
              />

              <div className="mt-5 space-y-5">
                {selectedEvent ? (
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
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-10 text-center">
                    <p className="text-sm text-gray-500">Quotation details are not available yet.</p>
                  </div>
                )}

                <MessageBanner tone="danger" message={error} />
              </div>
            </Panel>
          )}

          {/* Section 2: Create Version Form */}
          {workspaceMode === "existing" && !isReadOnly ? (
          <Panel>
            <SectionHeading number="2" title="Create version" subtitle="Fill in the details to generate a new quotation version." />

            <form className="mt-5 space-y-6" onSubmit={onCreateVersion}>
              {editingVersionMeta ? (
                <MessageBanner
                  tone="success"
                  message={`Editing from version ${editingVersionMeta.versionNumber}. Saving will create the next version for this quotation.`}
                />
              ) : null}

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
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Packages</p>
                  <SecondaryButton type="button" onClick={addPackageSelection} className="!px-4 !py-2 text-xs">
                    + Add package
                  </SecondaryButton>
                </div>
                <div className="space-y-4">
                  {(versionForm.packageSelections || []).map((pkg, index) => (
                    <div key={`existing-package-${index}`} className="grid gap-4 sm:grid-cols-[1.3fr_1fr_1fr_auto]">
                      <Field label="Package">
                        <Select value={pkg.packageId} onChange={onPackageSelectionChange(index, "packageId")}>
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
                          value={pkg.packageGuestCount}
                          onChange={onPackageSelectionChange(index, "packageGuestCount")}
                          type="number"
                          min="1"
                          placeholder="Event default"
                        />
                      </Field>
                      <Field label="Quantity">
                        <TextInput
                          value={pkg.packageQuantity}
                          onChange={onPackageSelectionChange(index, "packageQuantity")}
                          type="number"
                          min="0.01"
                          step="0.01"
                        />
                      </Field>
                      <div className="flex items-end">
                        <SecondaryButton type="button" onClick={() => removePackageSelection(index)} className="!px-4 !py-3 text-xs">
                          Remove
                        </SecondaryButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom item row */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">Custom Item</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name (optional)">
                    <TextInput value={versionForm.customName} onChange={onVersionFieldChange("customName")} placeholder="Decoration" />
                  </Field>
                  <Field label="Price (optional)">
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
                  <Field label="Description (optional)">
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
                <Field label="Terms and conditions (optional)">
                  <TextArea
                    value={versionForm.termsAndConditions}
                    onChange={onVersionFieldChange("termsAndConditions")}
                    placeholder="50% advance required before production begins."
                  />
                </Field>
                <Field label="Customer notes (optional)">
                  <TextArea
                    value={versionForm.customerNotes}
                    onChange={onVersionFieldChange("customerNotes")}
                    placeholder="Best package for the selected venue and guest count."
                  />
                </Field>
              </div>

              <div className="rounded-2xl border border-green-100 bg-gradient-to-r from-green-50 to-white p-5">
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-green-700">Quotation Summary</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Subtotal</p>
                    <p className="mt-2 text-xl font-semibold text-gray-800">{formatMoney(quotationTotals.subtotalAmount)}</p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Discount</p>
                    <p className="mt-2 text-xl font-semibold text-rose-600">- {formatMoney(quotationTotals.discountAmount)}</p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Manual Adj.</p>
                    <p className="mt-2 text-xl font-semibold text-gray-800">{formatMoney(quotationTotals.manualAdjustment)}</p>
                  </div>
                  <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-widest text-green-700">Final Total</p>
                    <p className="mt-2 text-2xl font-bold text-green-800">{formatMoney(quotationTotals.finalAmount)}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-gray-100 pt-5">
                <PrimaryButton type="submit" disabled={busy || !versionForm.quotationId}>
                  {busy ? <LoadingInline label="Saving..." /> : "Save quotation version"}
                </PrimaryButton>
              </div>
            </form>
          </Panel>
          ) : null}

          {/* Section 3: Quotation Details & Versions */}
          {workspaceMode === "existing" ? (
          <Panel>
            <SectionHeading
              number={isReadOnly ? "2" : "3"}
              title="Quotation details"
              subtitle={
                isReadOnly
                  ? "Review the saved quotation and version history."
                  : "Review saved versions and accept the final one."
              }
            />

            <div className="mt-5">
              {selectedQuotation ? (
                <div className="space-y-5">
                  {isReadOnly ? (
                    <MessageBanner
                      tone="success"
                      message="Read-only view. Use the edit icon from the quotation list if you want to create the next version."
                    />
                  ) : null}
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
                            {!isReadOnly ? (
                              <>
                                <SecondaryButton
                                  type="button"
                                  onClick={() => onEditPreviousVersion(version.id)}
                                  disabled={busy}
                                  className="!px-4 !py-2 text-xs"
                                >
                                  Edit as next version
                                </SecondaryButton>
                                <SecondaryButton
                                  type="button"
                                  onClick={() => onAcceptVersion(version.id)}
                                  disabled={busy || version.status === "accepted"}
                                  className="!px-4 !py-2 text-xs"
                                >
                                  {version.status === "accepted" ? "Accepted" : "Accept"}
                                </SecondaryButton>
                              </>
                            ) : null}
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
          ) : null}
        </div>
      )}
    </div>
  );
}
