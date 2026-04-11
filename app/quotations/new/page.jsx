"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Edit3,
  FileText,
  Gift,
  IndianRupee,
  Layers,
  MapPin,
  Package,
  Pencil,
  Plus,
  Send,
  Shield,
  StickyNote,
  User,
} from "lucide-react";
import {
  Field,
  LoadingInline,
  LoadingState,
  MessageBanner,
  PrimaryButton,
  Select,
} from "@/components/AdminUI";
import {
  BookingDetailsSection,
  CustomerDetailsSection,
  CustomItemSection,
  PackagesSection,
  PricingDiscountSection,
  PricingSummaryCard,
  SectionHeading,
  TermsNotesSection,
} from "@/components/quotations/QuotationSections";
import { useToast } from "@/components/ToastProvider";
import {
  buildVersionFormFromDetail,
  buildVersionPayload,
  formatDisplayDate,
  formatMoney,
  initialNewCustomerForm,
  initialVersionForm,
  resolveLineTotal,
  resolvePackageProducts,
  roundMoney,
  computeDiscountAmount,
} from "@/components/quotations/quotationUtils";
import { catalogApi, eventsApi, quotationsApi } from "@/services/modules";

/* ─── Status Badge ─── */
function VersionStatusBadge({ status }) {
  const styles = {
    draft: "border-amber-200/60 bg-gradient-to-br from-amber-50 to-amber-100/40 text-amber-700",
    sent: "border-blue-200/60 bg-gradient-to-br from-blue-50 to-blue-100/40 text-blue-700",
    accepted: "border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-emerald-100/40 text-emerald-700",
    rejected: "border-rose-200/60 bg-gradient-to-br from-rose-50 to-rose-100/40 text-rose-700",
  };
  const dots = {
    draft: "bg-amber-400",
    sent: "bg-blue-400",
    accepted: "bg-emerald-400",
    rejected: "bg-rose-400",
  };
  const key = (status || "draft").toLowerCase();
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider ${styles[key] || styles.draft}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[key] || dots.draft}`} />
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
  const shouldPrefillLatestVersion = searchParams.get("prefill") === "latest";

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
  const [hasPrefilledLatestVersion, setHasPrefilledLatestVersion] = useState(!shouldPrefillLatestVersion);
  const [activeVersionDetail, setActiveVersionDetail] = useState(null);

  const selectedEvent = useMemo(
    () => events.find((item) => String(item.id) === String(selectedEventId)),
    [events, selectedEventId]
  );

  const getPackagePerPlatePrice = useCallback((pkg, selection = {}) => {
    const includedProducts = resolvePackageProducts(pkg, selection);

    return roundMoney(
      includedProducts.reduce((sum, item) => {
        return (
          sum +
          resolveLineTotal({
            pricingType: item.pricing_type,
            unitPrice: item.unit_price,
            quantity: item.quantity || 1,
            guestCount: 1,
          })
        );
      }, 0)
    );
  }, []);

  const quotationTotals = useMemo(() => {
    const defaultGuestCount = Number(
      selectedEvent?.guest_count || newCustomerForm.guestCount || 1
    );

    const packageSubtotal = (versionForm.packageSelections || []).reduce((sum, selection) => {
      const pkg = packages.find((item) => String(item.id) === String(selection.packageId));
      if (!pkg) return sum;

      const perPlatePrice = getPackagePerPlatePrice(pkg, selection);

      return (
        sum +
        roundMoney(
          perPlatePrice *
            Math.max(Number(selection.packageGuestCount || defaultGuestCount || 1), 1) *
            Math.max(Number(selection.packageQuantity || 1), 1)
        )
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
  }, [getPackagePerPlatePrice, newCustomerForm.guestCount, packages, selectedEvent?.guest_count, versionForm]);

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
      const packageRows = packagesResponse.data || [];
      const packageDetails = await Promise.all(
        packageRows.map(async (item) => {
          try {
            const detail = await catalogApi.getPackage(item.id);
            return detail.data || item;
          } catch {
            return item;
          }
        })
      );
      setEvents(eventsResponse.data || []);
      setPackages(packageDetails);
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
    setHasPrefilledLatestVersion(!shouldPrefillLatestVersion);
  }, [initialQuotationId, shouldPrefillLatestVersion]);

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

  useEffect(() => {
    setActiveVersionDetail(null);
  }, [initialQuotationId]);

  const onVersionFieldChange = (key) => (event) => {
    setVersionForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const onPackageSelectionChange = (index, key) => (event) => {
    const value = event.target.value;
    setVersionForm((current) => ({
      ...current,
      packageSelections: (current.packageSelections || []).map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [key]: value,
              ...(key === "packageId" ? { excludedProductIds: [] } : {}),
            }
          : item
      ),
    }));
  };

  const togglePackageProduct = (index, productId) => {
    setVersionForm((current) => ({
      ...current,
      packageSelections: (current.packageSelections || []).map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        const existing = new Set((item.excludedProductIds || []).map((id) => String(id)));
        const nextId = String(productId);

        if (existing.has(nextId)) {
          existing.delete(nextId);
        } else {
          existing.add(nextId);
        }

        return {
          ...item,
          excludedProductIds: Array.from(existing),
        };
      }),
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

  const loadVersionDetail = useCallback(
    async (versionId, options = {}) => {
      const { silent = false, fillForm = false } = options;

      try {
        setBusy(true);
        setError("");
        const response = await quotationsApi.getVersionById(versionId);
        const versionDetail = response.data;
        setActiveVersionDetail(versionDetail);

        if (fillForm) {
          setVersionForm(buildVersionFormFromDetail(versionDetail));
          setEditingVersionMeta({
            id: versionDetail.id,
            versionNumber: versionDetail.version_number,
          });
        }

        if (!silent) {
          toast({
            variant: "success",
            title: fillForm ? "Version loaded for editing" : "Quotation loaded",
            description: fillForm
              ? `Version ${versionDetail.version_number} is ready to edit and save as the next version.`
              : `Version ${versionDetail.version_number} is ready to review.`,
          });
        }
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
    },
    [toast]
  );

  const onEditPreviousVersion = useCallback(
    async (versionId, options = {}) => loadVersionDetail(versionId, { ...options, fillForm: true }),
    [loadVersionDetail]
  );

  useEffect(() => {
    if (workspaceMode !== "existing" || isReadOnly || hasPrefilledLatestVersion) return;
    if (!selectedQuotation?.id) return;

    const latestVersionId = selectedQuotation.latest_version_id || selectedQuotation?.versions?.[0]?.id;

    if (!latestVersionId) {
      setHasPrefilledLatestVersion(true);
      return;
    }

    setHasPrefilledLatestVersion(true);
    onEditPreviousVersion(latestVersionId, { silent: true });
  }, [hasPrefilledLatestVersion, isReadOnly, onEditPreviousVersion, selectedQuotation, workspaceMode]);

  useEffect(() => {
    if (workspaceMode !== "existing" || !isReadOnly) return;
    if (!selectedQuotation?.id || activeVersionDetail?.quotation_id === selectedQuotation.id) return;

    const latestVersionId = selectedQuotation.latest_version_id || selectedQuotation?.versions?.[0]?.id;
    if (!latestVersionId) return;

    loadVersionDetail(latestVersionId, { silent: true, fillForm: false });
  }, [activeVersionDetail?.quotation_id, isReadOnly, loadVersionDetail, selectedQuotation, workspaceMode]);

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
      const response = await quotationsApi.createVersion(Number(versionForm.quotationId), payload);
      const savedVersionNumber = response?.data?.version_number;

      setEditingVersionMeta(savedVersionNumber ? {
        id: response.data.id,
        versionNumber: savedVersionNumber,
      } : null);
      toast({
        variant: "success",
        title: savedVersionNumber ? `Quotation saved as v${savedVersionNumber}` : "Quotation version saved",
        description: savedVersionNumber
          ? `The quotation was saved successfully as version ${savedVersionNumber}.`
          : "The new version has been created successfully.",
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
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => router.push("/quotations")}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-500 transition-all duration-200 hover:bg-white hover:text-gray-700 hover:shadow-sm -ml-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to quotations
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-emerald-200 shadow-sm">
              <FileText className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <h1 className="font-[var(--font-fraunces)] text-2xl font-semibold text-gray-800 md:text-3xl">
                {isReadOnly ? "Quotation Details" : workspaceMode === "create" ? "New Quotation" : "Edit Quotation"}
              </h1>
              <p className="mt-0.5 text-sm text-gray-400">
                {workspaceMode === "create"
                  ? "Create a fresh customer quotation in one clean flow."
                  : isReadOnly
                    ? "Review quotation details, totals, and version history."
                    : "Update the form and save to create the next version."}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isReadOnly && initialQuotationId ? (
            <PrimaryButton
              type="button"
              onClick={() =>
                router.push(`/quotations/new?eventId=${selectedEventId}&quotationId=${initialQuotationId}&prefill=latest`)
              }
              className="rounded-xl !px-5 !py-3"
            >
              <span className="inline-flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                Edit Quotation
              </span>
            </PrimaryButton>
          ) : null}
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading workspace..." className="py-24" />
      ) : (
        <div className="space-y-6">
          {/* ═══════════════════════════════════════════════════════
              CREATE MODE — Full new quotation flow
          ═══════════════════════════════════════════════════════ */}
          {workspaceMode === "create" ? (
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-gray-50 bg-gradient-to-r from-green-50/50 to-transparent px-6 py-5">
                <SectionHeading
                  icon={Plus}
                  title="Create New Quotation"
                  subtitle="Add the customer and booking details. The quotation will be created in one step."
                />
              </div>

              <form className="space-y-0" onSubmit={onCreateNewQuotationFlow}>
                <CustomerDetailsSection form={newCustomerForm} onFieldChange={onNewCustomerFieldChange} />
                <BookingDetailsSection form={newCustomerForm} onFieldChange={onNewCustomerFieldChange} />
                <PricingDiscountSection form={versionForm} onFieldChange={onVersionFieldChange} />
                <PackagesSection
                  packageSelections={versionForm.packageSelections}
                  packages={packages}
                  selectedEventGuestCount={selectedEvent?.guest_count}
                  customerGuestCount={newCustomerForm.guestCount}
                  addPackageSelection={addPackageSelection}
                  removePackageSelection={removePackageSelection}
                  onPackageSelectionChange={onPackageSelectionChange}
                  togglePackageProduct={togglePackageProduct}
                  getPackagePerPlatePrice={getPackagePerPlatePrice}
                />
                <CustomItemSection form={versionForm} onFieldChange={onVersionFieldChange} />
                <TermsNotesSection form={versionForm} onFieldChange={onVersionFieldChange} />
                <div className="px-6 py-6">
                  <PricingSummaryCard totals={quotationTotals} />
                </div>

                {/* Submit */}
                <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-transparent px-6 py-5">
                  <div className="flex items-center justify-between">
                    <MessageBanner tone="danger" message={error} />
                    <PrimaryButton type="submit" disabled={busy} className="rounded-xl !px-6 !py-3.5 shadow-md hover:shadow-lg transition-shadow">
                      {busy ? (
                        <LoadingInline label="Creating..." />
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <Check className="h-4 w-4" strokeWidth={2.5} />
                          Create Full Quotation
                        </span>
                      )}
                    </PrimaryButton>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            /* ═══════════════════════════════════════════════════════
                EXISTING MODE — View / Edit
            ═══════════════════════════════════════════════════════ */
            <>
              {/* ─── Event Overview Card ─── */}
              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-gray-50 bg-gradient-to-r from-green-50/50 to-transparent px-6 py-5">
                  <SectionHeading
                    icon={FileText}
                    title={isReadOnly ? "Quotation Overview" : "Quotation Overview"}
                    subtitle={
                      isReadOnly
                        ? "Review the complete saved quotation here."
                        : "This quotation is loaded and ready to edit."
                    }
                  />
                </div>

                <div className="p-6">
                  {selectedEvent ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        { icon: User, label: "Client", value: selectedEvent.client_name },
                        { icon: Gift, label: "Occasion", value: selectedEvent.occasion_type },
                        { icon: CalendarDays, label: "Event Date", value: formatDisplayDate(selectedEvent.event_date) },
                        { icon: MapPin, label: "Venue", value: selectedEvent.venue || "Pending" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/30 p-4 transition-all duration-200 hover:bg-white hover:shadow-sm">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                            <item.icon className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{item.label}</p>
                            <p className="mt-1 text-sm font-semibold text-gray-800">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-12 text-center">
                      <FileText className="mx-auto h-8 w-8 text-gray-300" />
                      <p className="mt-3 text-sm text-gray-400">Quotation details are not available yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ─── READ-ONLY View ─── */}
              {isReadOnly ? (
                activeVersionDetail ? (
                  <div className="space-y-6">
                    {/* Version Header Card */}
                    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-400">
                              {activeVersionDetail.quote_code}
                            </p>
                            <h3 className="mt-2 text-xl font-bold text-white">
                              {activeVersionDetail.client_name} — {activeVersionDetail.occasion_type}
                            </h3>
                            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {formatDisplayDate(activeVersionDetail.event_date)}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" />
                                {activeVersionDetail.venue || "Venue not added"}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <Layers className="h-3.5 w-3.5" />
                                Version {activeVersionDetail.version_number}
                              </span>
                            </div>
                          </div>
                          <VersionStatusBadge status={activeVersionDetail.status} />
                        </div>
                      </div>
                    </div>

                    {/* Pricing Details */}
                    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                          <IndianRupee className="h-4 w-4 text-gray-500" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Pricing & Discount</p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                          { label: "Valid Until", value: formatDisplayDate(activeVersionDetail.valid_until) },
                          { label: "Discount Type", value: activeVersionDetail.discount_type || "None", capitalize: true },
                          { label: "Discount Value", value: formatMoney(activeVersionDetail.discount_value) },
                          { label: "Manual Adjustment", value: formatMoney(activeVersionDetail.manual_adjustment) },
                        ].map((item) => (
                          <div key={item.label} className="rounded-xl bg-gray-50/50 p-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{item.label}</p>
                            <p className={`mt-2 text-sm font-bold text-gray-800 ${item.capitalize ? "capitalize" : ""}`}>{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Line Items */}
                    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                          <Package className="h-4 w-4 text-gray-500" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Packages & Items</p>
                      </div>
                      {activeVersionDetail.lineItems?.length ? (
                        <div className="space-y-3">
                          {activeVersionDetail.lineItems.map((item) => (
                            <div
                              key={item.id}
                              className="group rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50/30 to-transparent p-5 transition-all duration-200 hover:border-gray-200 hover:shadow-sm"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-50 to-purple-100">
                                    <Package className="h-4 w-4 text-violet-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-gray-800">{item.item_name || "Custom item"}</p>
                                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                      {item.catalog_type} {item.pricing_type ? `/ ${item.pricing_type.replace("_", " ")}` : ""}
                                    </p>
                                    {item.item_description ? (
                                      <p className="mt-2 text-sm text-gray-500">{item.item_description}</p>
                                    ) : null}
                                  </div>
                                </div>
                                <p className="text-base font-bold text-gray-800">{formatMoney(item.line_total)}</p>
                              </div>
                              <div className="mt-4 flex flex-wrap gap-3">
                                {[
                                  { label: "Qty", value: item.quantity ?? "—" },
                                  { label: "Guests", value: item.guest_count ?? "—" },
                                  { label: "Unit Price", value: formatMoney(item.unit_price) },
                                ].map((detail) => (
                                  <span
                                    key={detail.label}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500"
                                  >
                                    <span className="text-gray-400">{detail.label}:</span>
                                    <span className="font-semibold text-gray-700">{detail.value}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-8 text-center">
                          <Package className="mx-auto h-6 w-6 text-gray-300" />
                          <p className="mt-2 text-sm text-gray-400">No packages or custom items were added.</p>
                        </div>
                      )}
                    </div>

                    {/* Terms & Notes */}
                    <div className="grid gap-6 lg:grid-cols-2">
                      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                            <Shield className="h-4 w-4 text-gray-500" />
                          </div>
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Terms & Conditions</p>
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                          {activeVersionDetail.terms_and_conditions || "No terms added."}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                            <StickyNote className="h-4 w-4 text-gray-500" />
                          </div>
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Customer Notes</p>
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                          {activeVersionDetail.customer_notes || "No customer notes added."}
                        </p>
                      </div>
                    </div>

                    {/* Summary */}
                    <PricingSummaryCard totals={{
                      subtotalAmount: activeVersionDetail.subtotal_amount,
                      discountAmount: activeVersionDetail.discount_amount,
                      manualAdjustment: activeVersionDetail.manual_adjustment,
                      finalAmount: activeVersionDetail.final_amount,
                    }} />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-gray-100 bg-white shadow-sm py-20 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100">
                      <FileText className="h-6 w-6 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400">Loading saved quotation details...</p>
                  </div>
                )
              ) : null}

              <MessageBanner tone="danger" message={error} />
            </>
          )}

          {/* ═══════════════════════════════════════════════════════
              EDIT MODE — Version Form
          ═══════════════════════════════════════════════════════ */}
          {workspaceMode === "existing" && !isReadOnly ? (
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-gray-50 bg-gradient-to-r from-green-50/50 to-transparent px-6 py-5">
                <SectionHeading
                  icon={Edit3}
                  title="Edit Quotation"
                  subtitle="All latest quotation details are loaded here for quick editing."
                />
              </div>

              <form className="space-y-0" onSubmit={onCreateVersion}>
                {/* Edit banner */}
                {editingVersionMeta ? (
                  <div className="mx-6 mt-5 flex items-center gap-3 rounded-xl border border-blue-200/60 bg-gradient-to-r from-blue-50 to-blue-100/30 px-4 py-3">
                    <Layers className="h-4 w-4 text-blue-600 shrink-0" />
                    <p className="text-sm font-medium text-blue-700">
                      Editing from version {editingVersionMeta.versionNumber}. Saving will create the next version.
                    </p>
                  </div>
                ) : shouldPrefillLatestVersion ? (
                  <div className="mx-6 mt-5 flex items-center gap-3 rounded-xl border border-emerald-200/60 bg-gradient-to-r from-emerald-50 to-emerald-100/30 px-4 py-3">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <p className="text-sm font-medium text-emerald-700">
                      Latest quotation data loaded automatically. Edit and save to create the next version.
                    </p>
                  </div>
                ) : null}

                {/* Quotation select */}
                <div className="px-6 pt-5">
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
                </div>

                <PricingDiscountSection form={versionForm} onFieldChange={onVersionFieldChange} />
                <PackagesSection
                  packageSelections={versionForm.packageSelections}
                  packages={packages}
                  selectedEventGuestCount={selectedEvent?.guest_count}
                  customerGuestCount={newCustomerForm.guestCount}
                  addPackageSelection={addPackageSelection}
                  removePackageSelection={removePackageSelection}
                  onPackageSelectionChange={onPackageSelectionChange}
                  togglePackageProduct={togglePackageProduct}
                  getPackagePerPlatePrice={getPackagePerPlatePrice}
                />
                <CustomItemSection form={versionForm} onFieldChange={onVersionFieldChange} />
                <TermsNotesSection form={versionForm} onFieldChange={onVersionFieldChange} />
                <div className="px-6 py-6">
                  <PricingSummaryCard totals={quotationTotals} />
                </div>

                {/* Submit */}
                <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-transparent px-6 py-5">
                  <div className="flex items-center justify-between gap-4">
                    <MessageBanner tone="danger" message={error} />
                    <PrimaryButton type="submit" disabled={busy || !versionForm.quotationId} className="rounded-xl !px-6 !py-3.5 shadow-md hover:shadow-lg transition-shadow">
                      {busy ? (
                        <LoadingInline label="Saving..." />
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <Check className="h-4 w-4" strokeWidth={2.5} />
                          Save Quotation Version
                        </span>
                      )}
                    </PrimaryButton>
                  </div>
                </div>
              </form>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
