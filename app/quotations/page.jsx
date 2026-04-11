"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  Pencil,
  Plus,
  Search,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  CalendarDays,
  MapPin,
  IndianRupee,
  Layers,
  Filter,
} from "lucide-react";
import {
  LoadingState,
  MessageBanner,
  PrimaryButton,
} from "@/components/AdminUI";
import { useToast } from "@/components/ToastProvider";
import { eventsApi, quotationsApi } from "@/services/modules";

const itemsPerPage = 8;

const statusConfig = {
  all: {
    bg: "bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg shadow-slate-300/30",
    icon: Filter,
    badge: "bg-white/20 text-white",
  },
  draft: {
    bg: "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-300/30",
    icon: Clock,
    badge: "bg-white/20 text-white",
    dot: "bg-amber-400",
    card: "border-amber-200/60 bg-gradient-to-br from-amber-50 to-amber-100/40 text-amber-700",
  },
  sent: {
    bg: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-300/30",
    icon: Send,
    badge: "bg-white/20 text-white",
    dot: "bg-blue-400",
    card: "border-blue-200/60 bg-gradient-to-br from-blue-50 to-blue-100/40 text-blue-700",
  },
  accepted: {
    bg: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-300/30",
    icon: CheckCircle2,
    badge: "bg-white/20 text-white",
    dot: "bg-emerald-400",
    card: "border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-emerald-100/40 text-emerald-700",
  },
  rejected: {
    bg: "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-300/30",
    icon: XCircle,
    badge: "bg-white/20 text-white",
    dot: "bg-rose-400",
    card: "border-rose-200/60 bg-gradient-to-br from-rose-50 to-rose-100/40 text-rose-700",
  },
};

const inactiveFilter =
  "bg-white border border-gray-200/80 text-gray-600 hover:border-gray-300 hover:shadow-sm";

const formatMoney = (value) => {
  const num = Number(value || 0);
  if (num >= 100000) return `Rs. ${(num / 100000).toFixed(2)}L`;
  if (num >= 1000) return `Rs. ${(num / 1000).toFixed(1)}K`;
  return `Rs. ${num.toFixed(2)}`;
};

const formatMoneyFull = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function QuotationStatusBadge({ status }) {
  const key = (status || "draft").toLowerCase();
  const config = statusConfig[key] || statusConfig.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${config.card}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {key}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, color, trend }) {
  const colorStyles = {
    slate: "from-slate-50 to-slate-100/50 border-slate-200/60",
    amber: "from-amber-50 to-amber-100/50 border-amber-200/60",
    blue: "from-blue-50 to-blue-100/50 border-blue-200/60",
    emerald: "from-emerald-50 to-emerald-100/50 border-emerald-200/60",
    rose: "from-rose-50 to-rose-100/50 border-rose-200/60",
  };
  const iconColors = {
    slate: "text-slate-600 bg-slate-100",
    amber: "text-amber-600 bg-amber-100",
    blue: "text-blue-600 bg-blue-100",
    emerald: "text-emerald-600 bg-emerald-100",
    rose: "text-rose-600 bg-rose-100",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${colorStyles[color]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`rounded-xl p-2.5 ${iconColors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-600">
          <TrendingUp className="h-3 w-3" />
          {trend}
        </div>
      )}
    </div>
  );
}

export default function QuotationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const deferredSearchTerm = useDeferredValue(searchTerm);

  const loadQuotations = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const eventsResponse = await eventsApi.list({ limit: 100 });
      const events = eventsResponse.data || [];

      const grouped = await Promise.all(
        events.map(async (event) => {
          const response = await quotationsApi.listByEvent(event.id);
          const items = response.data || [];

          const enriched = await Promise.all(
            items.map(async (quotation) => {
              const detail = await quotationsApi.getById(quotation.id);
              const versions = detail.data?.versions || [];
              const latestVersion = versions[0] || null;

              return {
                ...quotation,
                event_id: event.id,
                client_name: detail.data?.client_name || event.client_name,
                occasion_type: detail.data?.occasion_type || event.occasion_type,
                event_date: detail.data?.event_date || event.event_date,
                venue: detail.data?.venue || event.venue,
                latest_final_amount: latestVersion?.final_amount || 0,
                total_versions: versions.length,
              };
            })
          );

          return enriched;
        })
      );

      setQuotations(grouped.flat());
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to load quotations.";
      setError(message);
      toast({
        variant: "error",
        title: "Quotations not loaded",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadQuotations();
  }, [loadQuotations]);

  useEffect(() => {
    const created = searchParams.get("created");

    if (!created) return;

    toast({
      variant: "success",
      title: "Quotation saved successfully",
      description: "The quotation version has been saved and added to the list.",
    });
    router.replace("/quotations");
  }, [router, searchParams, toast]);

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearchTerm, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = { all: quotations.length, draft: 0, sent: 0, accepted: 0, rejected: 0 };
    quotations.forEach((quotation) => {
      const key = (quotation.current_status || quotation.status || "draft").toLowerCase();
      if (counts[key] !== undefined) counts[key] += 1;
    });
    return counts;
  }, [quotations]);

  const totalRevenue = useMemo(() => {
    return quotations.reduce((sum, q) => sum + Number(q.latest_final_amount || 0), 0);
  }, [quotations]);

  const filteredQuotations = useMemo(() => {
    const term = deferredSearchTerm.trim().toLowerCase();

    return quotations.filter((quotation) => {
      const matchesSearch =
        !term ||
        quotation.quote_code?.toLowerCase().includes(term) ||
        quotation.client_name?.toLowerCase().includes(term) ||
        quotation.occasion_type?.toLowerCase().includes(term) ||
        quotation.event_date?.toLowerCase().includes(term) ||
        quotation.venue?.toLowerCase().includes(term);

      const status = (quotation.current_status || quotation.status || "draft").toLowerCase();
      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [deferredSearchTerm, quotations, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredQuotations.length / itemsPerPage));
  const paginatedQuotations = filteredQuotations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-emerald-200 shadow-sm">
              <FileText className="h-5 w-5 text-green-700" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-green-600">
              Quotations
            </p>
          </div>
          <h1 className="font-[var(--font-fraunces)] text-3xl font-semibold text-gray-800 md:text-4xl">
            Quotation Desk
          </h1>
          <p className="max-w-xl text-sm leading-6 text-gray-400">
            Manage, track, and convert your quotations. View version history, update statuses, and create new proposals.
          </p>
        </div>
        <PrimaryButton
          onClick={() => router.push("/quotations/new")}
          className="rounded-2xl !px-6 !py-4 !text-sm shadow-md hover:shadow-lg transition-shadow"
        >
          <span className="inline-flex items-center gap-2.5">
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            New Quotation
          </span>
        </PrimaryButton>
      </div>
      {/* Filters & Search */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "all", label: "All", icon: SlidersHorizontal },
              { key: "draft", label: "Draft", icon: Clock },
              { key: "accepted", label: "Accepted", icon: CheckCircle2 },
            ].map((item) => {
              const isActive = statusFilter === item.key;
              const config = statusConfig[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setStatusFilter(item.key)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer transition-all duration-200 ${
                    isActive ? config.bg : inactiveFilter
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                  <span
                    className={`rounded-lg px-2 py-0.5 text-xs font-bold ${
                      isActive ? config.badge : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {statusCounts[item.key]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative w-full xl:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search quotes, clients, venues..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition-all duration-200 focus:border-green-300 focus:bg-white focus:ring-4 focus:ring-green-50 placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      <MessageBanner tone="danger" message={error} />

      {/* Quotation Table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <LoadingState label="Loading quotations..." className="py-20" />
        ) : paginatedQuotations.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100">
              <FileText className="h-7 w-7 text-gray-300" />
            </div>
            <p className="text-base font-semibold text-gray-700">No quotations found</p>
            <p className="mt-1.5 text-sm text-gray-400">
              Create a new quotation or adjust your filters.
            </p>
            <PrimaryButton
              onClick={() => router.push("/quotations/new")}
              className="mt-5 rounded-xl !px-5 !py-3 !text-sm"
            >
              <span className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create First Quotation
              </span>
            </PrimaryButton>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-gray-50/40">
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">
                      Quote
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">
                      Event
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 text-center">
                      Ver.
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">
                      Client
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 text-right">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedQuotations.map((quotation) => (
                    <tr
                      key={quotation.id}
                      className="group border-b border-gray-50 transition-colors duration-150 hover:bg-gradient-to-r hover:from-green-50/30 hover:to-transparent last:border-b-0"
                    >
                      {/* Quote Code & Venue */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-50 to-green-100 text-green-700">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">
                              {quotation.quote_code || "—"}
                            </p>
                            <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                              <MapPin className="h-3 w-3" />
                              {quotation.venue || "Venue TBD"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Event Date & Occasion */}
                      <td className="px-6 py-5">
                        <div>
                          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                            <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                            {formatDate(quotation.event_date)}
                          </div>
                          <p className="mt-0.5 text-xs text-gray-400">{quotation.occasion_type || "—"}</p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <QuotationStatusBadge status={quotation.current_status || quotation.status} />
                      </td>

                      {/* Versions */}
                      <td className="px-6 py-5 text-center">
                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1.5">
                          <Layers className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-sm font-bold text-gray-700">
                            {quotation.total_versions || quotation.current_version_number || 0}
                          </span>
                        </div>
                      </td>

                      {/* Client */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-purple-100 text-xs font-bold text-violet-600">
                            {(quotation.client_name || "?")[0].toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-gray-700">
                            {quotation.client_name || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-5 text-right">
                        <p className="text-sm font-bold text-gray-800">
                          {formatMoneyFull(quotation.latest_final_amount)}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/quotations/new?eventId=${quotation.event_id}&quotationId=${quotation.id}&mode=view`
                              )
                            }
                            className="group/btn relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-200/80 bg-gradient-to-b from-blue-50 to-blue-100/50 text-blue-600 transition-all duration-200 hover:shadow-md hover:shadow-blue-200/40 hover:-translate-y-0.5 hover:border-blue-300"
                            aria-label={`View ${quotation.quote_code || "quotation"}`}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/quotations/new?eventId=${quotation.event_id}&quotationId=${quotation.id}&prefill=latest`
                              )
                            }
                            className="group/btn relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-green-200/80 bg-gradient-to-b from-green-50 to-green-100/50 text-green-600 transition-all duration-200 hover:shadow-md hover:shadow-green-200/40 hover:-translate-y-0.5 hover:border-green-300"
                            aria-label={`Edit ${quotation.quote_code || "quotation"}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredQuotations.length > itemsPerPage && (
              <div className="flex flex-col gap-3 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-transparent px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-400">
                  Showing{" "}
                  <span className="font-semibold text-gray-600">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>
                  –
                  <span className="font-semibold text-gray-600">
                    {Math.min(currentPage * itemsPerPage, filteredQuotations.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-600">{filteredQuotations.length}</span>{" "}
                  quotations
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                    disabled={currentPage === 1}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-all hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`h-9 min-w-9 rounded-xl px-3 text-sm font-semibold transition-all duration-200 ${
                          currentPage === page
                            ? "bg-gradient-to-b from-green-600 to-green-700 text-white shadow-md shadow-green-300/30"
                            : "text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-all hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
