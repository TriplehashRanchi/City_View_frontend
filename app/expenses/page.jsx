"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  LoadingState,
  PageIntro,
  Panel,
  PrimaryButton,
  SecondaryButton,
  Select,
  StatCard,
  TextInput,
} from "@/components/AdminUI";
import { expensesApi } from "@/services/expenses";
import {
  formatCurrency,
  formatDate,
  getExpenseAmounts,
  formatPercentage,
  titleize,
  unwrapListResponse,
} from "@/services/normalizers";
import {
  CalendarRange,
  CircleDollarSign,
  Eye,
  Plus,
  ReceiptText,
  Search,
  SquarePen,
  Tags,
  Trash2,
} from "lucide-react";

const PAGE_SIZE = 8;

const statusStyles = {
  paid: "bg-[#e4ece6] text-[#34523f]",
  pending: "bg-[#eee7d7] text-[#6f5d33]",
  cancelled: "bg-[#f6e8e5] text-[#8b3733]",
};

const defaultFilters = {
  search: "",
  paymentMode: "",
  status: "",
  dateFrom: "",
  dateTo: "",
};

export default function ExpensesPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    metrics: {
      total_expenses: 0,
      gross_amount: 0,
      paid_amount: 0,
      pending_amount: 0,
      cancelled_amount: 0,
    },
    categoryBreakdown: [],
    statusBreakdown: [],
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
  });
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await expensesApi.list({
          ...appliedFilters,
          page: pagination.page,
          limit: PAGE_SIZE,
        });
        setExpenses(unwrapListResponse(response));
        setPagination((current) => ({
          ...current,
          total: response?.pagination?.total || 0,
          limit: response?.pagination?.limit || PAGE_SIZE,
        }));
      } catch {
        setExpenses([]);
        setPagination((current) => ({ ...current, total: 0 }));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [appliedFilters, pagination.page]);

  useEffect(() => {
    const loadSummary = async () => {
      setSummaryLoading(true);
      try {
        const response = await expensesApi.summary({
          dateFrom: appliedFilters.dateFrom || undefined,
          dateTo: appliedFilters.dateTo || undefined,
        });
        setSummary(
          response?.data || {
            metrics: {},
            categoryBreakdown: [],
            statusBreakdown: [],
          },
        );
      } catch {
        setSummary({
          metrics: {
            total_expenses: 0,
            gross_amount: 0,
            paid_amount: 0,
            pending_amount: 0,
            cancelled_amount: 0,
          },
          categoryBreakdown: [],
          statusBreakdown: [],
        });
      } finally {
        setSummaryLoading(false);
      }
    };

    loadSummary();
  }, [appliedFilters.dateFrom, appliedFilters.dateTo]);

  const totalPages = Math.max(
    1,
    Math.ceil((pagination.total || 0) / PAGE_SIZE),
  );

  const summaryCards = useMemo(
    () => [
      {
        label: "Total Entries",
        value: summary?.metrics?.total_expenses ?? 0,
      },
      {
        label: "Gross Spend",
        value: formatCurrency(summary?.metrics?.gross_amount),
      },
      {
        label: "Paid",
        value: formatCurrency(summary?.metrics?.paid_amount),
      },
      {
        label: "Pending",
        value: formatCurrency(summary?.metrics?.pending_amount),
      },
    ],
    [summary],
  );

  const setFilter = (key) => (event) => {
    setFilters((current) => ({ ...current, [key]: event.target.value }));
  };

  const applyFilters = () => {
    setPagination((current) => ({ ...current, page: 1 }));
    setAppliedFilters(filters);
  };

  const deleteExpense = async (expenseId) => {
    const confirmed = window.confirm(
      "Delete this expense record? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      setDeletingId(expenseId);
      await expensesApi.remove(expenseId);
      setExpenses((current) => current.filter((item) => item.id !== expenseId));
      setPagination((current) => ({
        ...current,
        total: Math.max(0, current.total - 1),
      }));

      const summaryResponse = await expensesApi.summary({
        dateFrom: appliedFilters.dateFrom || undefined,
        dateTo: appliedFilters.dateTo || undefined,
      });
      setSummary(
        summaryResponse?.data || {
          metrics: {},
          categoryBreakdown: [],
          statusBreakdown: [],
        },
      );
    } catch {
      window.alert("Unable to delete expense.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageIntro
        eyebrow=""
        title="Expense Ledger"
        description="Review outgoing spend, apply payment and status filters, and keep tax-linked expense records in one operational table."
        action={
          <Link href="/expenses/new">
            <PrimaryButton className="flex items-center justify-center gap-2">
              <Plus size={18} />
              Add Expense
            </PrimaryButton>
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryLoading
          ? summaryCards.map((card) => (
              <StatCard key={card.label} label={card.label} value="..." />
            ))
          : summaryCards.map((card) => (
              <StatCard
                key={card.label}
                label={card.label}
                value={card.value}
              />
            ))}
      </section>

      <Panel
        title="Filter Expenses"
        subtitle="Refine by text, payment mode, status, or date range. Summary cards and the ledger update against the selected filters."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="relative xl:col-span-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7b6540]"
            />
            <TextInput
              value={filters.search}
              onChange={setFilter("search")}
              placeholder="Search by vendor, invoice, notes, or category"
              className="pl-11"
            />
          </div>
          <Select
            value={filters.paymentMode}
            onChange={setFilter("paymentMode")}
          >
            <option value="">All payment modes</option>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="bank">Bank</option>
            <option value="credit">Credit</option>
          </Select>
          <Select value={filters.status} onChange={setFilter("status")}>
            <option value="">All statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <TextInput
            type="date"
            value={filters.dateFrom}
            onChange={setFilter("dateFrom")}
          />
          <TextInput
            type="date"
            value={filters.dateTo}
            onChange={setFilter("dateTo")}
          />
          <PrimaryButton type="button" onClick={applyFilters}>
            Apply Filters
          </PrimaryButton>
        </div>
      </Panel>

      <Panel
        title="All Expenses"
        subtitle="Paginated directly from the backend expense ledger so search and filters stay aligned with the API."
      >
        {loading ? (
          <LoadingState label="Loading expenses..." className="py-10" />
        ) : expenses.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse table-fixed">
                <thead className="editorial-table-head">
                  <tr>
                    <th className="w-[14%] px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                      Date
                    </th>
                    <th className="w-[19%] py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                      Category
                    </th>
                    <th className="w-[18%] py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                      Vendor
                    </th>
                    <th className="w-[14%] py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                      Amount
                    </th>
                    <th className="w-[12%] py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                      GST
                    </th>
                    <th className="w-[11%] py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                      Status
                    </th>
                    <th className="w-[14%] px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((row) => {
                    const tone =
                      statusStyles[(row.status || "").toLowerCase()] ||
                      "bg-[#ece9e2] text-[#5d5e61]";
                    const { totalAmount } = getExpenseAmounts(row);

                    return (
                      <tr
                        key={row.id}
                        className="border-b border-[var(--outline-ghost)] last:border-b-0"
                      >
                        <td className="px-6 py-5 align-top">
                          <div className="flex items-center gap-2 text-sm text-[#2f3331]">
                            <CalendarRange
                              size={15}
                              className="shrink-0 text-[#7b6540]"
                            />
                            <span>
                              {formatDate(row.expense_date || row.expenseDate)}
                            </span>
                          </div>
                        </td>
                        <td className="py-5 align-top">
                          <div className="flex items-center gap-2 text-[#2f3331]">
                            <Tags
                              size={15}
                              className="shrink-0 text-[#7b6540]"
                            />
                            <div>
                              <p className="font-semibold">
                                {row.category_name || row.categoryName || "-"}
                              </p>
                              
                            </div>
                          </div>
                        </td>
                        <td className="py-5 align-top">
                          <div className="space-y-1 text-sm text-[#3c413e]">
                            <p>{row.vendor_name || row.vendorName || "-"}</p>
                           
                          </div>
                        </td>
                        <td className="py-5 align-top">
                          <div className="flex items-center gap-2 text-sm font-medium text-[#2f3331]">
                            <CircleDollarSign
                              size={15}
                              className="shrink-0 text-[#7b6540]"
                            />
                            <div>
                              <p>{formatCurrency(totalAmount)}</p>
                               
                            </div>
                          </div>
                        </td>
                        <td className="py-5 align-top">
                          <p className="text-sm text-[#3c413e]">
                            {row.gst
                              ? `${formatPercentage(row.tax_percentage || row.taxPercentage || 0)} ${titleize(row.amount_is || row.amountIs)}`
                              : "No GST"}
                          </p>
                        </td>
                        <td className="py-5 align-top">
                          <span
                            className={`inline-flex items-center rounded-sm px-3 py-1 text-[11px] font-semibold uppercase ${tone}`}
                          >
                            {titleize(row.status || "-")}
                          </span>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <div className="flex items-center gap-4 text-[#7b6540]">
                            <Link
                              href={`/expenses/${row.id}`}
                              className="inline-flex items-center gap-2 font-semibold transition hover:text-[#5d4a28]"
                              aria-label={`Open expense ${row.id}`}
                            >
                              <Eye size={18} />
                            </Link>
                            <Link
                              href={`/expenses/${row.id}/edit`}
                              className="inline-flex items-center gap-2 font-semibold transition hover:text-[#5d4a28]"
                              aria-label={`Edit expense ${row.id}`}
                            >
                              <SquarePen size={18} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => deleteExpense(row.id)}
                              disabled={deletingId === row.id}
                              className="inline-flex cursor-pointer items-center gap-2 font-semibold text-[#9f403d] transition hover:text-[#7f2f2d] disabled:cursor-not-allowed disabled:opacity-50"
                              aria-label={`Delete expense ${row.id}`}
                              title="Delete expense"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pagination.total > PAGE_SIZE ? (
              <div className="mt-6 flex flex-col gap-4 border-t border-[var(--outline-ghost)] pt-5 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-[#5f6662]">
                  Showing {(pagination.page - 1) * PAGE_SIZE + 1}-
                  {Math.min(pagination.page * PAGE_SIZE, pagination.total)} of{" "}
                  {pagination.total}
                </p>
                <div className="flex items-center gap-2">
                  <SecondaryButton
                    type="button"
                    onClick={() =>
                      setPagination((current) => ({
                        ...current,
                        page: current.page - 1,
                      }))
                    }
                    disabled={pagination.page === 1}
                    className="px-4 py-3"
                  >
                    Previous
                  </SecondaryButton>
                  <span className="px-3 text-sm text-[#5f6662]">
                    Page {pagination.page} of {totalPages}
                  </span>
                  <SecondaryButton
                    type="button"
                    onClick={() =>
                      setPagination((current) => ({
                        ...current,
                        page: current.page + 1,
                      }))
                    }
                    disabled={pagination.page >= totalPages}
                    className="px-4 py-3"
                  >
                    Next
                  </SecondaryButton>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="editorial-muted px-4 py-12 text-center text-sm leading-7 text-[#5f6662]">
            No expense records match the current filters.
          </div>
        )}
      </Panel>

      <div className="grid gap-8 lg:grid-cols-2">
        <Panel
          title="Category Breakdown"
          subtitle="Highest spend categories for the selected period."
        >
          <div className="grid gap-3">
            {summary?.categoryBreakdown?.length ? (
              summary.categoryBreakdown.slice(0, 6).map((item) => (
                <div
                  key={item.category_name}
                  className="editorial-muted flex items-center justify-between px-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <ReceiptText size={16} className="text-[#7b6540]" />
                    <div>
                      <p className="font-semibold text-[#2f3331]">
                        {item.category_name}
                      </p>
                      <p className="text-xs uppercase tracking-[0.12rem] text-[#7d817d]">
                        {item.total_expenses} entries
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-[#2f3331]">
                    {formatCurrency(item.total_amount)}
                  </p>
                </div>
              ))
            ) : (
              <div className="editorial-muted px-4 py-10 text-center text-sm text-[#5f6662]">
                No category breakdown available.
              </div>
            )}
          </div>
        </Panel>

        <Panel
          title="Status Breakdown"
          subtitle="Spend distribution across payment status buckets."
        >
          <div className="grid gap-3">
            {summary?.statusBreakdown?.length ? (
              summary.statusBreakdown.map((item) => {
                const tone =
                  statusStyles[(item.status || "").toLowerCase()] ||
                  "bg-[#ece9e2] text-[#5d5e61]";
                return (
                  <div
                    key={item.status}
                    className="editorial-muted flex items-center justify-between px-4 py-4"
                  >
                    <div className="space-y-1">
                      <span
                        className={`inline-flex items-center rounded-sm px-3 py-1 text-[11px] font-semibold uppercase ${tone}`}
                      >
                        {titleize(item.status)}
                      </span>
                      <p className="text-xs uppercase tracking-[0.12rem] text-[#7d817d]">
                        {item.total_expenses} entries
                      </p>
                    </div>
                    <p className="font-semibold text-[#2f3331]">
                      {formatCurrency(item.total_amount)}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="editorial-muted px-4 py-10 text-center text-sm text-[#5f6662]">
                No status breakdown available.
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
