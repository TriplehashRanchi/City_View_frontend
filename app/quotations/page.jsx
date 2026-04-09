"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, Pencil, Plus, Search } from "lucide-react";
import {
  LoadingState,
  MessageBanner,
  PageIntro,
  Panel,
  PrimaryButton,
  SecondaryButton,
} from "@/components/AdminUI";
import { useToast } from "@/components/ToastProvider";
import { eventsApi, quotationsApi } from "@/services/modules";

const itemsPerPage = 8;

const statusStyles = {
  all: "bg-blue-600 text-white shadow-sm",
  draft: "bg-amber-50 text-amber-700",
  sent: "bg-blue-50 text-blue-700",
  accepted: "bg-emerald-50 text-emerald-700",
  rejected: "bg-rose-50 text-rose-700",
};

const statusBadgeStyles = {
  draft: "border-amber-200 bg-amber-50 text-amber-700",
  sent: "border-blue-200 bg-blue-50 text-blue-700",
  accepted: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

const formatMoney = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

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
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
        statusBadgeStyles[key] || statusBadgeStyles.draft
      }`}
    >
      {key}
    </span>
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
    <div className="mx-auto max-w-7xl space-y-6">
      <PageIntro
        eyebrow="Quotations"
        title="Quotation Desk"
        description="Search, browse, view, and edit every quotation from one clean operations table."
        action={
          <PrimaryButton
            onClick={() => router.push("/quotations/new")}
            className="rounded-xl !px-5 !py-4 !text-sm"
          >
            <span className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Quotation
            </span>
          </PrimaryButton>
        }
      />

      <div className="space-y-2">
        <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-slate-50/80 p-4  xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2 xl:flex-nowrap">
            {[
              { key: "all", label: "All" },
              { key: "draft", label: "Draft" },
              { key: "sent", label: "Sent" },
              { key: "accepted", label: "Accepted" },
              { key: "rejected", label: "Rejected" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setStatusFilter(item.key)}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium cursor-pointer transition ${
                  statusFilter === item.key
                    ? statusStyles[item.key] || statusStyles.all
                    : "text-gray-600 hover:bg-white"
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    statusFilter === item.key ? "bg-white/20 text-current" : "bg-white text-gray-600"
                  }`}
                >
                  {statusCounts[item.key]}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full xl:max-w-xl xl:min-w-[420px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by quote code, client, occasion, date, or venue..."
              className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-sm text-gray-800 outline-none transition focus:border-green-300 focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>
      </div>

      <MessageBanner tone="danger" message={error} />

      <Panel title="All Quotations" subtitle={`${filteredQuotations.length} quotation${filteredQuotations.length !== 1 ? "s" : ""} found`}>
        {loading ? (
          <LoadingState label="Loading quotations..." className="py-16" />
        ) : paginatedQuotations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-green-300 bg-green-50/50 py-16 text-center">
            <p className="text-sm font-semibold text-gray-700">No quotations found</p>
            <p className="mt-1 text-sm text-gray-500">Create a new quotation or adjust your search and status filters.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-green-100">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Quote</th>
                    <th className="px-6 py-4">Event Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Versions</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Occasion</th>
                    <th className="px-6 py-4">Final Amount</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedQuotations.map((quotation) => (
                    <tr key={quotation.id} className="border-t border-green-100 bg-white">
                      <td className="px-4 py-3 align-top">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{quotation.quote_code || "—"}</p>
                          <p className="mt-1 text-xs text-gray-500">{quotation.venue || "Venue not added"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-sm text-gray-600">{formatDate(quotation.event_date)}</td>
                      <td className="px-4 py-3 align-top">
                        <QuotationStatusBadge status={quotation.current_status || quotation.status} />
                      </td>
                      <td className="px-4 py-3 align-top text-sm font-semibold text-gray-700">{quotation.total_versions || quotation.current_version_number || 0}</td>
                      <td className="px-6 py-5 align-top text-sm text-gray-700">{quotation.client_name || "—"}</td>
                      <td className="px-6 py-5 align-top text-sm text-gray-700">{quotation.occasion_type || "—"}</td>
                      <td className="px-6 py-5 align-top text-sm font-semibold text-gray-800">{formatMoney(quotation.latest_final_amount)}</td>
                      <td className="px-6 py-5 align-top">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/quotations/new?eventId=${quotation.event_id}&quotationId=${quotation.id}&mode=view`
                              )
                            }
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                            aria-label={`View ${quotation.quote_code || "quotation"}`}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push(`/quotations/new?eventId=${quotation.event_id}&quotationId=${quotation.id}`)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-green-200 bg-green-50 text-green-700 transition hover:bg-green-100"
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

            {filteredQuotations.length > itemsPerPage && (
              <div className="flex flex-col gap-3 border-t border-green-100 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredQuotations.length)} of{" "}
                  {filteredQuotations.length}
                </p>

                <div className="flex items-center gap-2">
                  <SecondaryButton
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                    disabled={currentPage === 1}
                    className="!px-4 !py-2"
                  >
                    Prev
                  </SecondaryButton>

                  <div className="flex items-center gap-1 rounded-full bg-slate-50 p-1">
                    {Array.from({ length: totalPages }, (_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`h-9 min-w-9 rounded-full px-3 text-sm font-semibold transition ${
                            currentPage === page ? "bg-green-700 text-white" : "text-gray-500 hover:bg-white hover:text-gray-800"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <SecondaryButton
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="!px-4 !py-2"
                  >
                    Next
                  </SecondaryButton>
                </div>
              </div>
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}
