"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageIntro, Panel } from "@/components/AdminUI";
import { expensesApi } from "@/services/expenses";
import {
  formatCurrency,
  formatDate,
  getExpenseAmounts,
  titleize,
  unwrapEntityResponse,
} from "@/services/normalizers";

const statusStyles = {
  paid: "bg-[#e4ece6] text-[#34523f]",
  pending: "bg-[#eee7d7] text-[#6f5d33]",
  cancelled: "bg-[#f6e8e5] text-[#8b3733]",
};

const DetailRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-6 border-b border-[var(--outline-ghost)] py-1 text-sm leading-7 text-[#2f3331] last:border-b-0">
    <span className="text-[#5d5e61]">{label}</span>
    <span className="text-right">{value || "-"}</span>
  </div>
);

export default function ExpenseDetailPage() {
  const params = useParams();
  const [expense, setExpense] = useState(null);

  useEffect(() => {
    const load = async () => {
      const response = await expensesApi.get(params.id).catch(() => null);
      setExpense(unwrapEntityResponse(response));
    };
    load();
  }, [params.id]);

  const tone = statusStyles[(expense?.status || "").toLowerCase()] || "bg-[#ece9e2] text-[#5d5e61]";
  const { baseAmount, taxAmount, totalAmount } = getExpenseAmounts(expense);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageIntro
        eyebrow=""
        title={expense?.category_name || expense?.categoryName || "Expense Detail"}
        description="Single expense record with vendor, tax, payment, and audit context."
        action={
          <Link
            href={`/expenses/${params.id}/edit`}
            className="editorial-button-secondary px-5 py-3 text-sm font-semibold uppercase tracking-[0.12rem]"
          >
            Edit Expense
          </Link>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <Panel title="Expense Snapshot">
          <div className="grid gap-4">
            <DetailRow label="Date" value={formatDate(expense?.expense_date || expense?.expenseDate)} />
            <DetailRow label="Vendor" value={expense?.vendor_name || expense?.vendorName || "-"} />
            <DetailRow label="Base Amount" value={formatCurrency(baseAmount)} />
            <DetailRow label="GST Amount" value={expense?.gst ? formatCurrency(taxAmount) : "-"} />
            <DetailRow label="Total Amount" value={formatCurrency(totalAmount)} />
            <DetailRow label="Invoice Number" value={expense?.invoice_number || expense?.invoiceNumber || "-"} />
            <DetailRow label="Payment Mode" value={titleize(expense?.payment_mode || expense?.paymentMode)} />
            <div className="flex items-center justify-between gap-6 border-b border-[var(--outline-ghost)] py-3 text-sm leading-7 text-[#2f3331]">
              <span className="text-[#5d5e61]">Status</span>
              <span className={`inline-flex items-center rounded-sm px-3  text-[11px] font-semibold uppercase ${tone}`}>
                {titleize(expense?.status)}
              </span>
            </div>
           </div>
        </Panel>

        <Panel title="Tax And Notes">
          <div className="grid gap-4">
            <DetailRow label="GST Applied" value={expense?.gst ? "Yes" : "No"} />
            <DetailRow label="GSTIN" value={expense?.gstin || "-"} />
            <DetailRow label="Tax Percentage" value={expense?.gst ? `${expense?.tax_percentage || expense?.taxPercentage || 0}%` : "-"} />
            <DetailRow label="Amount Type" value={titleize(expense?.amount_is || expense?.amountIs)} />
            <DetailRow label="Receipt URL" value={expense?.receipt_url || expense?.receiptUrl || "-"} />
            <div className="pt-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">Notes</p>
              <div className="editorial-muted mt-2 px-4 py-4 text-sm leading-7 text-[#2f3331]">
                {expense?.notes || "No notes added for this expense."}
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
