"use client";

export const emptyPackageSelection = {
  packageId: "",
  packageGuestCount: "",
  packageQuantity: "1",
  excludedProductIds: [],
};

export const initialVersionForm = {
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

export const initialNewCustomerForm = {
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

export const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export const parsePricingSummary = (value) => {
  if (!value) return {};
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

export const resolvePackageProducts = (pkg, selection = {}) => {
  const excluded = new Set((selection.excludedProductIds || []).map((id) => String(id)));
  return (pkg?.products || []).filter((item) => !excluded.has(String(item.product_id)));
};

export const formatLabel = (value) =>
  String(value || "")
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const groupProductsByCategory = (products = []) =>
  products.reduce((groups, item) => {
    const key = item.category || "other";
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});

export const resolveLineTotal = ({ pricingType, unitPrice, quantity = 1, guestCount = 0 }) => {
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

export const computeDiscountAmount = ({ subtotalAmount, discountType, discountValue }) => {
  const subtotal = Number(subtotalAmount || 0);
  const value = Number(discountValue || 0);

  if (discountType === "none" || !value) return 0;
  if (discountType === "flat") return roundMoney(Math.min(value, subtotal));
  if (discountType === "percentage") return roundMoney(Math.min((subtotal * value) / 100, subtotal));
  return 0;
};

export const formatMoney = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatDisplayDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const buildVersionFormFromDetail = (versionDetail) => {
  const packageLines = versionDetail.lineItems?.filter((item) => item.source_type === "package") || [];
  const customLine = versionDetail.lineItems?.find((item) => item.catalog_type === "custom");
  const pricingSummary = parsePricingSummary(versionDetail.pricing_summary_json);
  const packageSelectionSnapshots = pricingSummary.packageSelections || [];

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
      ? packageLines.map((item, index) => ({
          packageId: item.catalog_id ? String(item.catalog_id) : "",
          packageGuestCount: item.guest_count ? String(item.guest_count) : "",
          packageQuantity: item.quantity ? String(item.quantity) : "1",
          excludedProductIds: packageSelectionSnapshots[index]?.excludedProductIds || [],
        }))
      : [emptyPackageSelection],
    customName: customLine?.item_name || "",
    customDescription: customLine?.item_description || "",
    customPrice: customLine?.unit_price ? String(customLine.unit_price) : "",
  };
};

export const buildVersionPayload = (form, eventGuestCount) => ({
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
      excludedProductIds: item.excludedProductIds || [],
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
