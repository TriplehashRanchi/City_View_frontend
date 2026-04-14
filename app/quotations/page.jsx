"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  LoadingState,
  MessageBanner,
  PaginationControls,
  PageIntro,
  Panel,
  PrimaryButton,
  Select,
} from "@/components/AdminUI";
import { eventsApi } from "@/services/events";
import { quotationsApi } from "@/services/quotations";
import {
  formatCurrency,
  formatDate,
  titleize,
  unwrapListResponse,
} from "@/services/normalizers";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  MessageCircle,
  Plus,
  Search,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

const statusStyles = {
  draft: "bg-[#eee7d7] text-[#6f5d33]",
  sent: "bg-[#e5edf4] text-[#35546b]",
  approved: "bg-[#e4ece6] text-[#34523f]",
  accepted: "bg-[#e4ece6] text-[#34523f]",
  rejected: "bg-[#f6e8e5] text-[#8b3733]",
  cancelled: "bg-[#f6e8e5] text-[#8b3733]",
};

export default function QuotationsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadId, setDownloadId] = useState(null);
  const [downloadError, setDownloadError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const events = unwrapListResponse(await eventsApi.list().catch(() => []));
      const allRows = [];

      for (const event of events) {
        try {
          const quotations = unwrapListResponse(
            await quotationsApi.listQuotationsByEvent(event.id),
          );

          for (const quotation of quotations) {
            const detail = await quotationsApi
              .getQuotation(quotation.id)
              .catch(() => quotation);
            const entity = detail?.data || detail;
            const latestVersion =
              entity?.versions?.[0] || entity?.latestVersion || null;

            allRows.push({
              id: quotation.id,
              quoteCode:
                entity?.quote_code ||
                quotation.quote_code ||
                `Q-${quotation.id}`,
              clientName: entity?.client_name || event.client_name || "-",
              occasionType: entity?.occasion_type || event.occasion_type || "-",
              eventDate: entity?.event_date || event.event_date || "-",
              status:
                latestVersion?.status ||
                entity?.current_status ||
                quotation?.status ||
                "draft",
              latestVersionId:
                latestVersion?.id ||
                entity?.latest_version_id ||
                quotation?.latest_version_id ||
                null,
              totalVersions:
                entity?.versions?.length || quotation?.total_versions || 0,
              finalAmount:
                latestVersion?.final_amount || quotation?.final_amount || 0,
            });
          }
        } catch {}
      }

      allRows.sort((a, b) => {
        const left = a.eventDate ? new Date(a.eventDate).getTime() : 0;
        const right = b.eventDate ? new Date(b.eventDate).getTime() : 0;
        return right - left;
      });

      setRows(allRows);
      setLoading(false);
    };

    load();
  }, []);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        const status = (row.status || "").toLowerCase();
        acc.total += 1;
        acc.value += Number(row.finalAmount || 0);
        if (status === "draft") acc.draft += 1;
        if (status === "approved" || status === "accepted") acc.approved += 1;
        return acc;
      },
      { total: 0, draft: 0, approved: 0, value: 0 },
    );
  }, [rows]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows.filter((row) => {
      const status = (row.status || "").toLowerCase();
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const matchesSearch =
        !query ||
        row.quoteCode.toLowerCase().includes(query) ||
        row.clientName.toLowerCase().includes(query) ||
        row.occasionType.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [rows, search, statusFilter]);

  const getQuotationFile = async (row) => {
    const response = await quotationsApi.downloadQuotation(
      row.id,
      row.latestVersionId || undefined,
    );

    const blob = new Blob([response.data], {
      type: response.headers["content-type"] || "application/pdf",
    });
    const disposition = response.headers["content-disposition"] || "";
    const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^\";]+)/i);
    const fallbackName = `${row.quoteCode || `quotation-${row.id}`}.pdf`;
    const filename = decodeURIComponent(
      (match?.[1] || fallbackName).replace(/"/g, ""),
    );

    return { blob, filename };
  };

  const handleDownload = async (row) => {
    try {
      setDownloadError("");
      setDownloadId(row.id);

      const { blob, filename } = await getQuotationFile(row);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setDownloadError(
        error?.response?.data?.message || "Unable to download quotation.",
      );
    } finally {
      setDownloadId(null);
    }
  };

  const handleWhatsAppShare = async (row) => {
    try {
      setDownloadError("");
      setDownloadId(row.id);

      const { blob, filename } = await getQuotationFile(row);
      const file = new File([blob], filename, {
        type: blob.type || "application/pdf",
      });

      if (
        typeof navigator === "undefined" ||
        !navigator.share ||
        !navigator.canShare?.({ files: [file] })
      ) {
        setDownloadError(
          "PDF sharing works only in supported mobile apps/browsers with WhatsApp installed.",
        );
        return;
      }

      await navigator.share({
        title: row.quoteCode,
        text: `Quotation ${row.quoteCode}`,
        files: [file],
      });
    } catch (error) {
      if (error?.name === "AbortError") return;
      setDownloadError(
        error?.response?.data?.message ||
          "Unable to share PDF to WhatsApp on this device.",
      );
    } finally {
      setDownloadId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, safePage, PAGE_SIZE]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 pt-2">
      <PageIntro
        eyebrow=""
        title="Quotation Registry"
        description="Review current quotation activity, check value at a glance, and open the right record quickly."
        action={
          <Link href="/quotations/new">
            <PrimaryButton className="flex items-center justify-center gap-2">
              <Plus size={18} />
              Create Quotation
            </PrimaryButton>
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="editorial-panel p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#7b6540]">
                Total Quotations
              </p>
              <p className="display-font mt-3 text-4xl leading-none text-[#2f3331]">
                {totals.total}
              </p>
            </div>
            <div className="rounded-full bg-[#ece9e2] p-3 text-[#7b6540]">
              <FileText size={20} />
            </div>
          </div>
        </article>

        <article className="editorial-panel p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#7b6540]">
                Draft Quotations
              </p>
              <p className="display-font mt-3 text-4xl leading-none text-[#2f3331]">
                {totals.draft}
              </p>
            </div>
            <div className="rounded-full bg-[#f1ead9] p-3 text-[#7b6540]">
              <Clock3 size={20} />
            </div>
          </div>
        </article>

        <article className="editorial-panel p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#7b6540]">
                Approved
              </p>
              <p className="display-font mt-3 text-4xl leading-none text-[#2f3331]">
                {totals.approved}
              </p>
            </div>
            <div className="rounded-full bg-[#e4ece6] p-3 text-[#34523f]">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </article>

        <article className="editorial-panel p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#7b6540]">
                Quoted Value
              </p>
              <p className="display-font mt-3 text-3xl leading-none text-[#2f3331]">
                {formatCurrency(totals.value)}
              </p>
            </div>
            <div className="rounded-full bg-[#ece9e2] p-3 text-[#5d5e61]">
              <CalendarDays size={20} />
            </div>
          </div>
        </article>
      </section>

      <Panel
        title="All Quotations"
        subtitle="Search by quotation code, client, or occasion. Filter by status when you need a narrower list."
      >
        <MessageBanner tone="danger" message={downloadError} />

        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_220px]">
          <label className="editorial-muted flex items-center gap-3 px-4 py-3 ">
            <Search size={18} className="text-[#7b6540]" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search quotation, client, or occasion"
              className="w-200 bg-transparent text-sm text-[#2f3331] outline-none placeholder:text-[#7d817d]"
            />
          </label>

          <div>
            <Select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-full bg-transparent font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="approved">Approved</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>
        </div>

        {loading ? (
          <LoadingState label="Loading quotations..." className="py-10" />
        ) : filteredRows.length ? (
          <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginatedRows.map((row) => {
              const tone =
                statusStyles[(row.status || "").toLowerCase()] ||
                "bg-[#ece9e2] text-[#5d5e61]";

              return (
                <article
                  key={row.id}
                  className="group flex min-h-[190px] flex-col justify-between rounded-md border border-[rgba(93,94,97,0.12)] bg-[#fbfaf7] p-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="display-font truncate text-[1.45rem] leading-tight text-[#2f3331]">
                          {row.quoteCode}
                        </p>
                        <p className="mt-1 truncate text-sm text-[#5f6662]">
                          {row.clientName}
                        </p>
                        <p className="mt-0.5 text-sm text-[#7a7f7b]">
                          {row.occasionType}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownload(row)}
                          disabled={downloadId === row.id}
                          className="inline-flex h-9 w-9 items-center justify-center cursor-pointer rounded-sm border border-[#d7d9d4] bg-[#f2f3ef] text-[#5d5e61] transition hover:bg-[#e8ebe4] disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Download ${row.quoteCode}`}
                          title="Download quotation"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleWhatsAppShare(row)}
                          className="inline-flex h-9 w-9 items-center justify-center cursor-pointer rounded-sm border border-[#b7dcc0] bg-[#e8f6ec] text-[#1f8f46] transition hover:bg-[#daf0e1] disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Share ${row.quoteCode} on WhatsApp`}
                          title="Share on WhatsApp"
                        >
                          <SiWhatsapp size={16} color="#25D366" />
                        </button>
                       
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className=" flex items-center gap-2 rounded-sm border border-[#ddcfb2] bg-[#f5ede0] px-3 py-1 text-xs font-medium text-[#7b6540]">
                        <CalendarDays size={14} className="text-[#7b6540]" />
                        Event: {formatDate(row.eventDate)}
                      </span>
                      <span className="rounded-sm border border-[#d7d9d4] bg-[#f2f3ef] px-3 py-1 text-xs font-medium text-[#5d5e61]">
                        Version {row.totalVersions}
                      </span>
                    </div>

                  </div>

                  <div className="mt-3 flex items-center justify-between gap-4 border-t border-[rgba(93,94,97,0.08)] pt-3">
                    <p className="text-sm font-semibold text-[#2f3331]">
                      Quoted Amount: {formatCurrency(row.finalAmount)}
                    </p>

                    <Link
                      href={`/quotations/${row.id}`}
                      className="editorial-button inline-flex items-center gap-2 rounded-sm px-3.5 py-2 text-sm font-semibold"
                    >
                      <span>Open Quote</span>
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
          <PaginationControls
            currentPage={safePage}
            totalPages={totalPages}
            totalItems={filteredRows.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
          </>
        ) : (
          <div className="editorial-muted px-4 py-12 text-center text-sm leading-7 text-[#5f6662]">
            No quotations match your current search or filter.
          </div>
        )}
      </Panel>
    </div>
  );
}
