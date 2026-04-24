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
import { expensesApi } from "@/services/expenses";
import { unwrapEntityResponse } from "@/services/normalizers";

const defaultForm = {
  expenseDate: "",
  categoryName: "",
  vendorName: "",
  amount: "",
  gst: "false",
  gstin: "",
  taxPercentage: "",
  amountIs: "inclusive",
  invoiceNumber: "",
  paymentMode: "",
  status: "paid",
  receiptUrl: "",
  notes: "",
};

const GST_TAX_OPTIONS = [
  { value: "0", label: "IGST0 [0%]" },
  { value: "5", label: "IGST5 [5%]" },
  { value: "12", label: "IGST12 [12%]" },
  { value: "40", label: "IGST40 [40%]" },
  { value: "18", label: "IGST18 [18%]" },
  { value: "28", label: "IGST28 [28%]" },
];

const amountPattern = /^\d*\.?\d{0,2}$/;
const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const CATEGORY_OPTIONS = [
  "Raw Material",
  "Packaging",
  "Kitchen Operations",
  "Maintenance",
  "Marketing",
  "Delivery Charges",
  "Miscellaneous",
];
const CUSTOM_CATEGORY_VALUE = "__custom__";

const normalizeDateInput = (value) => {
  if (!value) return "";
  const isoDate = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(isoDate) ? isoDate : "";
};

const getStoredAmountPayload = (form) => {
  const rawAmount = Number(form.amount);

  if (form.gst !== "true") {
    return {
      amount: rawAmount,
      amountIs: null,
    };
  }

  const taxPercentage = Number(form.taxPercentage);

  if (form.amountIs === "exclusive") {
    const totalAmount = rawAmount + (rawAmount * taxPercentage) / 100;
    return {
      amount: Number(totalAmount.toFixed(2)),
      amountIs: "inclusive",
    };
  }

  return {
    amount: rawAmount,
    amountIs: "inclusive",
  };
};

export default function ExpenseForm({ expenseId = null }) {
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [categoryInputMode, setCategoryInputMode] = useState("select");
  const [loading, setLoading] = useState(Boolean(expenseId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!expenseId) return;

    const load = async () => {
      try {
        setLoading(true);
        const response = await expensesApi.get(expenseId);
        const expense = unwrapEntityResponse(response);
        const categoryName = expense?.category_name || expense?.categoryName || "";
        setCategoryInputMode(
          categoryName && !CATEGORY_OPTIONS.includes(categoryName)
            ? "custom"
            : "select",
        );
        setForm({
          expenseDate: normalizeDateInput(expense?.expense_date || expense?.expenseDate),
          categoryName,
          vendorName: expense?.vendor_name || expense?.vendorName || "",
          amount: expense?.amount ?? "",
          gst: expense?.gst ? "true" : "false",
          gstin: expense?.gstin || "",
          taxPercentage: expense?.tax_percentage ?? expense?.taxPercentage ?? "",
          amountIs: expense?.amount_is || expense?.amountIs || "inclusive",
          invoiceNumber: expense?.invoice_number || expense?.invoiceNumber || "",
          paymentMode: expense?.payment_mode || expense?.paymentMode || "",
          status: expense?.status || "paid",
          receiptUrl: expense?.receipt_url || expense?.receiptUrl || "",
          notes: expense?.notes || "",
        });
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load expense.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [expenseId]);

  const onChange = (key) => (event) => {
    let nextValue = event.target.value;

    if (key === "amount") {
      if (!amountPattern.test(nextValue)) {
        return;
      }
    }

    if (key === "gstin") {
      nextValue = nextValue.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 15);
    }

    setForm((current) => {
      if (key === "gst" && nextValue === "false") {
        return {
          ...current,
          gst: "false",
          gstin: "",
          taxPercentage: "",
          amountIs: "inclusive",
        };
      }
      return { ...current, [key]: nextValue };
    });
  };

  const onCategoryChange = (event) => {
    const nextValue = event.target.value;

    if (nextValue === CUSTOM_CATEGORY_VALUE) {
      setCategoryInputMode("custom");
      setForm((current) => ({ ...current, categoryName: "" }));
      return;
    }

    setCategoryInputMode("select");
    setForm((current) => ({ ...current, categoryName: nextValue }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.expenseDate) {
      setError("Expense date is required.");
      return;
    }
    if (!form.categoryName.trim()) {
      setError("Category name is required.");
      return;
    }
    if (form.amount === "" || Number(form.amount) < 0) {
      setError("Amount must be a non-negative number.");
      return;
    }
    if (!amountPattern.test(form.amount)) {
      setError("Amount must contain numbers only.");
      return;
    }
    if (form.gst === "true" && form.taxPercentage === "") {
      setError("Tax percentage is required when GST is enabled.");
      return;
    }
    if (form.gst === "true" && !form.amountIs) {
      setError("Amount type is required when GST is enabled.");
      return;
    }
    if (form.gst === "true" && form.gstin.trim() && !gstinPattern.test(form.gstin.trim())) {
      setError("GSTIN must be a valid 15-character GST number.");
      return;
    }

    const storedAmount = getStoredAmountPayload(form);

    const payload = {
      expenseDate: form.expenseDate,
      categoryName: form.categoryName.trim(),
      vendorName: form.vendorName.trim() || null,
      amount: storedAmount.amount,
      gst: form.gst === "true",
      gstin: form.gst === "true" ? form.gstin.trim() || null : null,
      taxPercentage: form.gst === "true" ? Number(form.taxPercentage) : null,
      amountIs: form.gst === "true" ? storedAmount.amountIs : null,
      invoiceNumber: form.invoiceNumber.trim() || null,
      paymentMode: form.paymentMode || null,
      status: form.status,
      receiptUrl: form.receiptUrl.trim() || null,
      notes: form.notes.trim() || null,
    };

    try {
      setSaving(true);
      if (expenseId) {
        await expensesApi.update(expenseId, payload);
      } else {
        await expensesApi.create(payload);
      }
      router.push("/expenses");
      router.refresh();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save expense.");
    } finally {
      setSaving(false);
    }
  };

  const gstEnabled = form.gst === "true";
  const taxAmount =
    gstEnabled && form.taxPercentage !== "" && form.amount !== ""
      ? (Number(form.amount) * Number(form.taxPercentage)) / 100
      : 0;
  const storedAmountPreview =
    gstEnabled && form.amountIs === "exclusive"
      ? Number(form.amount || 0) + taxAmount
      : Number(form.amount || 0);

  return (
    <div className="mx-auto  space-y-8">
      <PageIntro
        eyebrow=""
        title={expenseId ? "Edit Expense" : "New Expense"}
        description="Capture operating expenses with vendor, tax, payment, and status details in the same editorial admin flow."
      />

      <Panel>
        {loading ? (
          <div className="py-10 text-sm uppercase tracking-[0.16rem] text-[#5d5e61]">Loading expense</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Expense Date" required>
                <TextInput type="date" value={form.expenseDate} onChange={onChange("expenseDate")} />
              </Field>
              <Field label="Category Name" required>
                <div className="space-y-3">
                  {categoryInputMode === "select" ? (
                    <Select
                      value={form.categoryName || ""}
                      onChange={onCategoryChange}
                    >
                      <option value="">Select category name</option>
                      {CATEGORY_OPTIONS.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                      <option value={CUSTOM_CATEGORY_VALUE}>
                        Other / Write manually
                      </option>
                    </Select>
                  ) : (
                    <div className="relative">
                      <TextInput
                        value={form.categoryName}
                        onChange={onChange("categoryName")}
                        placeholder="Write manual category name"
                        className="pr-32"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCategoryInputMode("select");
                          setForm((current) => ({ ...current, categoryName: "" }));
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-semibold cursor-pointer text-[#7b6540] transition hover:text-[#5d4a28]"
                      >
                        Use List
                      </button>
                    </div>
                  )}
                </div>
              </Field>
              <Field label="Vendor Name">
                <TextInput value={form.vendorName} onChange={onChange("vendorName")} placeholder="ABC Suppliers" />
              </Field>
              <Field label="Amount" required>
                <TextInput
                  type="text"
                  inputMode="decimal"
                  value={form.amount}
                  onChange={onChange("amount")}
                  placeholder="2500"
                />
              </Field>
              <Field label="GST Applied">
                <Select value={form.gst} onChange={onChange("gst")}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </Select>
              </Field>
              <Field label="Payment Mode">
                <Select value={form.paymentMode} onChange={onChange("paymentMode")}>
                  <option value="">Select payment mode</option>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="bank">Bank</option>
                  <option value="credit">Credit</option>
                </Select>
              </Field>
              <Field label="Status">
                <Select value={form.status} onChange={onChange("status")}>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </Field>
              <Field label="Invoice Number">
                <TextInput value={form.invoiceNumber} onChange={onChange("invoiceNumber")} placeholder="INV-2404-18" />
              </Field>
            </div>

            {gstEnabled ? (
              <div className="grid gap-6 border-t border-[var(--outline-ghost)] pt-6 md:grid-cols-3">
                <Field label="GSTIN">
                  <TextInput
                    value={form.gstin}
                    onChange={onChange("gstin")}
                    placeholder="27ABCDE1234F1Z5"
                    maxLength={15}
                  />
                </Field>
                <Field label="Tax Percentage" required>
                  <Select value={form.taxPercentage} onChange={onChange("taxPercentage")}>
                     {GST_TAX_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Amount Type" required>
                  <Select value={form.amountIs} onChange={onChange("amountIs")}>
                    <option value="inclusive">Inclusive</option>
                    <option value="exclusive">Exclusive</option>
                  </Select>
                </Field>
              </div>
            ) : null}

            {gstEnabled ? (
              <div className="editorial-muted px-4 py-4 text-sm leading-7 text-[#2f3331]">
                Stored expense amount: {storedAmountPreview > 0 ? storedAmountPreview.toFixed(2) : "0.00"}
                {form.amountIs === "exclusive" && taxAmount > 0
                  ? ` (includes GST ${taxAmount.toFixed(2)})`
                  : ""}
              </div>
            ) : null}
{/* 
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Receipt URL">
                <TextInput value={form.receiptUrl} onChange={onChange("receiptUrl")} placeholder="https://example.com/receipt.pdf" />
              </Field>
            </div> */}

            <Field label="Notes">
              <TextArea value={form.notes} onChange={onChange("notes")} placeholder="Add context for approvers, vendor follow-up, or tax treatment." />
            </Field>

            <MessageBanner tone="danger" message={error} />

            <div className="flex gap-3">
              <PrimaryButton type="submit">
                {saving ? <LoadingInline label="Saving..." /> : expenseId ? "Update Expense" : "Save Expense"}
              </PrimaryButton>
              <SecondaryButton type="button" onClick={() => router.push("/expenses")}>
                Cancel
              </SecondaryButton>
            </div>
          </form>
        )}
      </Panel>
    </div>
  );
}
