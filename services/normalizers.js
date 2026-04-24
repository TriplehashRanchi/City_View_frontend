export function unwrapListResponse(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.rows)) return response.rows;
  if (Array.isArray(response?.items)) return response.items;
  return [];
}

export function unwrapEntityResponse(response) {
  if (!response) return null;
  if (response.data && !Array.isArray(response.data)) return response.data;
  return response;
}

export function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function titleize(value) {
  if (!value) return "-";
  return String(value)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getExpenseAmounts(expense) {
  const amount = toNumber(expense?.amount);
  const gstEnabled = Boolean(expense?.gst);
  const taxPercentage = toNumber(
    expense?.tax_percentage ?? expense?.taxPercentage,
  );
  const amountIs = expense?.amount_is || expense?.amountIs || null;

  if (!gstEnabled || taxPercentage <= 0 || !amountIs) {
    return {
      baseAmount: amount,
      taxAmount: 0,
      totalAmount: amount,
    };
  }

  if (amountIs === "exclusive") {
    const taxAmount = (amount * taxPercentage) / 100;
    return {
      baseAmount: amount,
      taxAmount,
      totalAmount: amount + taxAmount,
    };
  }

  const divisor = 1 + taxPercentage / 100;
  const baseAmount = divisor > 0 ? amount / divisor : amount;
  const taxAmount = amount - baseAmount;

  return {
    baseAmount,
    taxAmount,
    totalAmount: amount,
  };
}
