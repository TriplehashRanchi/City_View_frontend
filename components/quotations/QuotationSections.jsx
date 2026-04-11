"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Gift,
  IndianRupee,
  Package,
  Plus,
  Receipt,
  StickyNote,
  Trash2,
  User,
  X,
} from "lucide-react";
import {
  Field,
  PrimaryButton,
  Select,
  TextArea,
  TextInput,
} from "@/components/AdminUI";
import {
  formatLabel,
  formatMoney,
  groupProductsByCategory,
  resolvePackageProducts,
  roundMoney,
} from "@/components/quotations/quotationUtils";

export function SectionHeading({ icon: Icon, number, title, subtitle }) {
  return (
    <div className="flex items-start gap-4 pb-1">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-emerald-200/70 shadow-sm">
        {Icon ? <Icon className="h-5 w-5 text-green-700" /> : <span className="text-sm font-bold text-green-700">{number}</span>}
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-sm text-gray-400">{subtitle}</p> : null}
      </div>
    </div>
  );
}

export function FormSection({ icon: Icon, label, children, collapsible = false }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-200 hover:border-gray-200/80">
      <button
        type="button"
        onClick={() => collapsible && setOpen(!open)}
        className={`flex w-full items-center justify-between px-6 py-4 ${collapsible ? "cursor-pointer" : "cursor-default"}`}
      >
        <div className="flex items-center gap-3">
          {Icon ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
              <Icon className="h-4 w-4 text-gray-500" />
            </div>
          ) : null}
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">{label}</p>
        </div>
        {collapsible ? <div className="text-gray-400">{open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</div> : null}
      </button>
      {open ? <div className="border-t border-gray-50 px-6 pb-6 pt-5">{children}</div> : null}
    </div>
  );
}

function SummaryItem({ label, value, variant = "default" }) {
  const styles = {
    default: "bg-white border-gray-100",
    discount: "bg-white border-gray-100",
    total: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/60",
  };
  const valueStyles = {
    default: "text-gray-800",
    discount: "text-rose-600",
    total: "text-green-800",
  };

  return (
    <div className={`rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md ${styles[variant]}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{label}</p>
      <p className={`mt-2 text-xl font-bold ${valueStyles[variant]} ${variant === "total" ? "text-2xl" : ""}`}>{value}</p>
    </div>
  );
}

export function CustomerDetailsSection({ form, onFieldChange }) {
  return (
    <FormSection icon={User} label="Customer Details">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Customer name">
          <TextInput value={form.clientName} onChange={onFieldChange("clientName")} required placeholder="John Doe" />
        </Field>
        <Field label="Phone">
          <TextInput value={form.clientPhone} onChange={onFieldChange("clientPhone")} placeholder="+91 98765 43210" />
        </Field>
        <Field label="Email (optional)">
          <TextInput value={form.clientEmail} onChange={onFieldChange("clientEmail")} type="email" placeholder="john@example.com" />
        </Field>
        <Field label="Company name (optional)">
          <TextInput value={form.companyName} onChange={onFieldChange("companyName")} placeholder="Acme Corp" />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Customer notes (optional)">
          <TextArea value={form.clientNotes} onChange={onFieldChange("clientNotes")} placeholder="Lead source, preferences, follow-up notes..." />
        </Field>
      </div>
    </FormSection>
  );
}

export function BookingDetailsSection({ form, onFieldChange }) {
  return (
    <FormSection icon={CalendarDays} label="Booking Details">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Occasion">
          <TextInput value={form.occasionType} onChange={onFieldChange("occasionType")} required placeholder="Wedding, Birthday..." />
        </Field>
        <Field label="Event date">
          <TextInput value={form.eventDate} onChange={onFieldChange("eventDate")} type="date" required />
        </Field>
        <Field label="Guest count">
          <TextInput value={form.guestCount} onChange={onFieldChange("guestCount")} type="number" min="1" required placeholder="150" />
        </Field>
        <Field label="Start time">
          <TextInput value={form.startTime} onChange={onFieldChange("startTime")} type="time" required />
        </Field>
        <Field label="End time (optional)">
          <TextInput value={form.endTime} onChange={onFieldChange("endTime")} type="time" />
        </Field>
        <Field label="Venue (optional)">
          <TextInput value={form.venue} onChange={onFieldChange("venue")} placeholder="Grand Ballroom" />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Event notes (optional)">
          <TextArea value={form.eventNotes} onChange={onFieldChange("eventNotes")} placeholder="Special requirements, timeline context..." />
        </Field>
      </div>
    </FormSection>
  );
}

export function PricingDiscountSection({ form, onFieldChange }) {
  return (
    <FormSection icon={IndianRupee} label="Pricing & Discount">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Valid until">
          <TextInput value={form.validUntil} onChange={onFieldChange("validUntil")} type="date" />
        </Field>
        <Field label="Discount type">
          <Select value={form.discountType} onChange={onFieldChange("discountType")}>
            <option value="none">None</option>
            <option value="flat">Flat</option>
            <option value="percentage">Percentage</option>
          </Select>
        </Field>
        <Field label="Discount value">
          <TextInput value={form.discountValue} onChange={onFieldChange("discountValue")} type="number" step="0.01" min="0" />
        </Field>
        <Field label="Manual adjustment">
          <TextInput value={form.manualAdjustment} onChange={onFieldChange("manualAdjustment")} type="number" step="0.01" />
        </Field>
      </div>
    </FormSection>
  );
}

function PackageSelectionCard({
  keyPrefix,
  index,
  pkg,
  packages,
  selectedPackage,
  selectedEventGuestCount,
  customerGuestCount,
  versionSelections,
  onPackageSelectionChange,
  onRemove,
  onToggleProduct,
  getPackagePerPlatePrice,
}) {
  const includedProducts = resolvePackageProducts(selectedPackage, pkg);
  const excludedIdSet = useMemo(
    () => new Set((pkg.excludedProductIds || []).map((id) => String(id))),
    [pkg.excludedProductIds]
  );
  const excludedProducts = (selectedPackage?.products || []).filter((item) => excludedIdSet.has(String(item.product_id)));
  const selectedPackageIds = new Set(
    (versionSelections || [])
      .map((item, itemIndex) => (itemIndex === index ? null : String(item.packageId || "")))
      .filter(Boolean)
  );
  const availablePackages = packages.filter(
    (item) => !selectedPackageIds.has(String(item.id)) || String(item.id) === String(pkg.packageId)
  );
  const groupedIncludedProducts = Object.entries(groupProductsByCategory(includedProducts));
  const guestCount = Math.max(Number(pkg.packageGuestCount || selectedEventGuestCount || customerGuestCount || 1), 1);
  const quantity = Math.max(Number(pkg.packageQuantity || 1), 1);
  const perPlatePrice = getPackagePerPlatePrice(selectedPackage, pkg);
  const packageTotal = roundMoney(perPlatePrice * guestCount * quantity);

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-emerald-100/70 bg-[linear-gradient(180deg,rgba(247,253,250,0.95),rgba(255,255,255,1))] shadow-[0_18px_50px_-32px_rgba(22,101,52,0.35)] transition-all duration-300 hover:border-emerald-200">
      <div className="border-b border-emerald-100/80 bg-white/80 px-5 py-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 via-green-50 to-white shadow-inner">
              <Package className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-600">Menu Selection {index + 1}</p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Pick one package, review dishes category-wise, and remove any dish the client does not want.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(220px,1.3fr)_130px_130px_auto]">
            <Field label="Package">
              <Select value={pkg.packageId} onChange={onPackageSelectionChange(index, "packageId")}>
                <option value="">Select package</option>
                {availablePackages.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Guests">
              <TextInput value={pkg.packageGuestCount} onChange={onPackageSelectionChange(index, "packageGuestCount")} type="number" min="1" placeholder="Default" />
            </Field>
            <Field label="Qty">
              <TextInput value={pkg.packageQuantity} onChange={onPackageSelectionChange(index, "packageQuantity")} type="number" min="0.01" step="0.01" />
            </Field>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-200/80 bg-gradient-to-b from-rose-50 to-white text-rose-500 transition-all duration-200 hover:border-rose-300 hover:shadow-md hover:shadow-rose-200/40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedPackage ? (
        <div className="grid gap-5 px-5 py-5 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {groupedIncludedProducts.length ? (
                groupedIncludedProducts.map(([category, items]) => (
                  <div
                    key={`${keyPrefix}-${index}-group-${category}`}
                    className="rounded-[1.5rem] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">{formatLabel(category)}</p>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{items.length}</span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {items.map((product) => (
                        <button
                          key={`${keyPrefix}-${index}-include-${product.product_id}`}
                          type="button"
                          onClick={() => onToggleProduct(index, product.product_id)}
                          className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-50 to-lime-50 px-3.5 py-2 text-sm font-medium text-emerald-900 transition hover:border-rose-200 hover:from-rose-50 hover:to-white hover:text-rose-700"
                        >
                          <span>{product.name}</span>
                          <X className="h-3.5 w-3.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-rose-200 bg-rose-50/60 px-4 py-8 text-center md:col-span-2 xl:col-span-3">
                  <p className="text-sm font-medium text-rose-600">No dishes left in this package. Add back at least one dish.</p>
                </div>
              )}
            </div>

            {excludedProducts.length ? (
              <div className="rounded-[1.5rem] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Removed dishes</p>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{excludedProducts.length}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {excludedProducts.map((product) => (
                    <button
                      key={`${keyPrefix}-${index}-exclude-${product.product_id}`}
                      type="button"
                      onClick={() => onToggleProduct(index, product.product_id)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>{product.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-emerald-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(220,252,231,0.95),_rgba(236,253,245,1))] p-5 shadow-[0_18px_38px_-28px_rgba(5,150,105,0.5)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-700">Package Pricing</p>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-white/80 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Per plate</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{formatMoney(perPlatePrice)}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/80 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Guests</p>
                    <p className="mt-1 text-xl font-bold text-slate-900">{guestCount}</p>
                  </div>
                  <div className="rounded-2xl bg-white/80 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Quantity</p>
                    <p className="mt-1 text-xl font-bold text-slate-900">{quantity}</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-900 px-4 py-4 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-200">Estimated total</p>
                  <p className="mt-1 text-2xl font-bold">{formatMoney(packageTotal)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">Quick view</p>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>{includedProducts.length} dishes currently included.</p>
                <p>{excludedProducts.length} dishes removed for this client.</p>
                <p>Total updates automatically from the selected menu.</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function PackagesSection(props) {
  const {
    packageSelections,
    packages,
    selectedEventGuestCount,
    customerGuestCount,
    addPackageSelection,
    removePackageSelection,
    onPackageSelectionChange,
    togglePackageProduct,
    getPackagePerPlatePrice,
  } = props;

  return (
    <FormSection icon={Package} label="Packages">
      <div className="mb-4 flex justify-end">
        <PrimaryButton type="button" onClick={addPackageSelection} className="rounded-xl px-4 py-2.5 text-xs font-semibold">
          <span className="inline-flex items-center gap-2">
            <Plus className="h-3.5 w-3.5" />
            Add Package
          </span>
        </PrimaryButton>
      </div>
      <div className="space-y-5">
        {(packageSelections || []).map((pkg, index) => (
          <PackageSelectionCard
            key={`package-selection-${index}`}
            keyPrefix="package-selection"
            index={index}
            pkg={pkg}
            packages={packages}
            selectedPackage={packages.find((item) => String(item.id) === String(pkg.packageId))}
            selectedEventGuestCount={selectedEventGuestCount}
            customerGuestCount={customerGuestCount}
            versionSelections={packageSelections}
            onPackageSelectionChange={onPackageSelectionChange}
            onRemove={removePackageSelection}
            onToggleProduct={togglePackageProduct}
            getPackagePerPlatePrice={getPackagePerPlatePrice}
          />
        ))}
      </div>
    </FormSection>
  );
}

export function CustomItemSection({ form, onFieldChange }) {
  return (
    <FormSection icon={Gift} label="Custom Item" collapsible>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name (optional)">
          <TextInput value={form.customName} onChange={onFieldChange("customName")} placeholder="Decoration" />
        </Field>
        <Field label="Price (optional)">
          <TextInput value={form.customPrice} onChange={onFieldChange("customPrice")} type="number" min="0" step="0.01" placeholder="12000" />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Description (optional)">
          <TextArea value={form.customDescription} onChange={onFieldChange("customDescription")} placeholder="Stage and floral decoration" />
        </Field>
      </div>
    </FormSection>
  );
}

export function TermsNotesSection({ form, onFieldChange }) {
  return (
    <FormSection icon={StickyNote} label="Terms & Notes" collapsible>
      <div className="space-y-4">
        <Field label="Terms and conditions (optional)">
          <TextArea
            value={form.termsAndConditions}
            onChange={onFieldChange("termsAndConditions")}
            placeholder="50% advance required before production begins."
          />
        </Field>
        <Field label="Customer notes (optional)">
          <TextArea
            value={form.customerNotes}
            onChange={onFieldChange("customerNotes")}
            placeholder="Best package for the selected venue and guest count."
          />
        </Field>
      </div>
    </FormSection>
  );
}

export function PricingSummaryCard({ totals }) {
  return (
    <div className="rounded-2xl border border-green-200/50 bg-gradient-to-br from-green-50/80 via-emerald-50/40 to-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-100 to-emerald-200">
          <Receipt className="h-4 w-4 text-green-700" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-700">Quotation Summary</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryItem label="Subtotal" value={formatMoney(totals.subtotalAmount)} />
        <SummaryItem label="Discount" value={`- ${formatMoney(totals.discountAmount)}`} variant="discount" />
        <SummaryItem label="Manual Adj." value={formatMoney(totals.manualAdjustment)} />
        <SummaryItem label="Final Total" value={formatMoney(totals.finalAmount)} variant="total" />
      </div>
    </div>
  );
}
