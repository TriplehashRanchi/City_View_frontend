"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LoadingState,
  PageIntro,
  Panel,
  PrimaryButton,
  SecondaryButton,
  Select,
  TextInput,
} from "@/components/AdminUI";
import { useToast } from "@/components/ToastProvider";
import { eventsApi, quotationsApi } from "@/services/modules";

const itemsPerPage = 8;

const statusColors = {
  draft: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-400" },
  sent: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-400" },
  accepted: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400" },
  rejected: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-400" },
};

function StatusBadge({ status }) {
  const key = (status || "draft").toLowerCase();
  const colors = statusColors[key] || statusColors.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${colors.bg} ${colors.text} ${colors.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
      {key}
    </span>
  );
}

function QuotationCard({ quotation, onOpen }) {
  return (
    <div className="group relative rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:border-green-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h3 className="truncate text-base font-bold text-gray-800">{quotation.quote_code || "—"}</h3>
            <StatusBadge status={quotation.current_status || quotation.status} />
          </div>
          <p className="mt-1.5 text-sm text-gray-500">{quotation.client_name || "Unknown client"}</p>
        </div>
        <SecondaryButton type="button" onClick={onOpen} className="shrink-0 !px-4 !py-2 text-xs">
          Edit
        </SecondaryButton>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-gray-50 pt-4">
        {quotation.occasion_type && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            <span>{quotation.occasion_type}</span>
          </div>
        )}
        {quotation.event_date && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{quotation.event_date}</span>
          </div>
        )}
        {quotation.venue && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{quotation.venue}</span>
          </div>
        )}
        {quotation.current_version_number && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>v{quotation.current_version_number}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuotationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const deferredSearchTerm = useDeferredValue(searchTerm);

  const loadQuotations = useCallback(async () => {
    try {
      setLoading(true);
      const eventsResponse = await eventsApi.list({ limit: 100 });
      const events = eventsResponse.data || [];
      const quotationGroups = await Promise.all(
        events.map(async (event) => {
          const response = await quotationsApi.listByEvent(event.id);
          const items = response.data || [];

          return items.map((quotation) => ({
            ...quotation,
            event_id: event.id,
            client_name: quotation.client_name || event.client_name,
            occasion_type: quotation.occasion_type || event.occasion_type,
            event_date: quotation.event_date || event.event_date,
            venue: quotation.venue || event.venue,
          }));
        })
      );

      setQuotations(quotationGroups.flat());
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to load quotations.";
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

  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);

  const filteredQuotations = useMemo(() => {
    const term = deferredSearchTerm.trim().toLowerCase();

    return quotations.filter((item) => {
      const matchesSearch =
        !term ||
        item.quote_code?.toLowerCase().includes(term) ||
        item.client_name?.toLowerCase().includes(term) ||
        item.occasion_type?.toLowerCase().includes(term) ||
        item.event_date?.toLowerCase().includes(term) ||
        item.venue?.toLowerCase().includes(term);

      const status = (item.current_status || item.status || "").toLowerCase();
      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [deferredSearchTerm, quotations, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredQuotations.length / itemsPerPage));
  const paginatedQuotations = filteredQuotations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusCounts = useMemo(() => {
    const counts = { all: quotations.length, draft: 0, sent: 0, accepted: 0, rejected: 0 };
    quotations.forEach((q) => {
      const s = (q.current_status || q.status || "draft").toLowerCase();
      if (counts[s] !== undefined) counts[s]++;
    });
    return counts;
  }, [quotations]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageIntro
        eyebrow="Quotations"
        title="Quotations"
        description="Manage all your quotations in one place — search, filter, and track every proposal."
        action={
          <PrimaryButton onClick={() => router.push("/quotations/new")}>
            + New quotation
          </PrimaryButton>
        }
      />

      {/* Stats strip */}
      {!loading && quotations.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: "Total", key: "all", color: "green" },
            { label: "Draft", key: "draft", color: "amber" },
            { label: "Sent", key: "sent", color: "blue" },
            { label: "Accepted", key: "accepted", color: "emerald" },
            { label: "Rejected", key: "rejected", color: "rose" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setStatusFilter(item.key)}
              className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
                statusFilter === item.key
                  ? "border-green-300 bg-green-50 shadow-sm"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <p className="text-2xl font-bold text-gray-800">{statusCounts[item.key]}</p>
              <p className="mt-1 text-xs font-medium text-gray-500">{item.label}</p>
            </button>
          ))}
        </div>
      )}

      <Panel
        title="All quotations"
        subtitle={`${filteredQuotations.length} quotation${filteredQuotations.length !== 1 ? "s" : ""} found`}
        aside={
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <TextInput
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search quotations..."
                className="!pl-10 min-w-[260px]"
              />
            </div>
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </Select>
          </div>
        }
      >
        {loading ? (
          <LoadingState label="Loading quotations..." className="py-16" />
        ) : paginatedQuotations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-green-300 bg-green-50/50 py-16 text-center">
            <svg className="mx-auto h-10 w-10 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="mt-3 text-sm font-semibold text-gray-700">No quotations found</p>
            <p className="mt-1 text-sm text-gray-500">Create a new quotation or adjust your search filters.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-3">
              {paginatedQuotations.map((quotation) => (
                <QuotationCard
                  key={quotation.id}
                  quotation={quotation}
                  onOpen={() =>
                    router.push(`/quotations/new?eventId=${quotation.event_id}&quotationId=${quotation.id}`)
                  }
                />
              ))}
            </div>

            {filteredQuotations.length > itemsPerPage && (
              <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredQuotations.length)} of {filteredQuotations.length}
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

                  <div className="flex items-center gap-1 rounded-full bg-gray-50 p-1">
                    {Array.from({ length: totalPages }, (_, index) => {
                      const page = index + 1;

                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`h-9 min-w-9 rounded-full px-3 text-sm font-semibold transition-all duration-200 ${
                            currentPage === page
                              ? "bg-green-700 text-white shadow-sm"
                              : "text-gray-500 hover:bg-white hover:text-gray-800"
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
