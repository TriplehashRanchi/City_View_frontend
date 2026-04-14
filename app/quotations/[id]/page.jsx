"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageBanner, PageIntro, Panel } from "@/components/AdminUI";
import { quotationsApi } from "@/services/quotations";
import { formatCurrency, formatDate, titleize, unwrapEntityResponse } from "@/services/normalizers";
import { useParams } from "next/navigation";
import { ArrowUpRight, Download, MessageCircle } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

export default function QuotationDetailPage() {
  const params = useParams();
  const [quotation, setQuotation] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    quotationsApi.getQuotation(params.id).then((response) => setQuotation(unwrapEntityResponse(response))).catch(() => setQuotation(null));
  }, [params.id]);

  const getVersionFile = async (version) => {
    const response = await quotationsApi.downloadQuotation(params.id, version.id);
    const blob = new Blob([response.data], {
      type: response.headers["content-type"] || "application/pdf",
    });
    const disposition = response.headers["content-disposition"] || "";
    const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^\";]+)/i);
    const fallbackName = `${quotation?.quote_code || `quotation-${params.id}`}-v${version.version_number}.pdf`;
    const filename = decodeURIComponent(
      (match?.[1] || fallbackName).replace(/"/g, ""),
    );

    return { blob, filename };
  };

  const handleDownload = async (version) => {
    try {
      setError("");
      setActionId(version.id);

      const { blob, filename } = await getVersionFile(version);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to download quotation version.");
    } finally {
      setActionId(null);
    }
  };

  const handleWhatsAppShare = async (version) => {
    try {
      setError("");
      setActionId(version.id);

      const { blob, filename } = await getVersionFile(version);
      const file = new File([blob], filename, {
        type: blob.type || "application/pdf",
      });

      if (
        typeof navigator === "undefined" ||
        !navigator.share ||
        !navigator.canShare?.({ files: [file] })
      ) {
        setError(
          "PDF sharing works only in supported mobile apps/browsers with WhatsApp installed.",
        );
        return;
      }

      await navigator.share({
        title: `${quotation?.quote_code || "Quotation"} / V${version.version_number}`,
        text: `Quotation version ${version.version_number}`,
        files: [file],
      });
    } catch (err) {
      if (err?.name === "AbortError") return;
      setError(
        err?.response?.data?.message ||
          "Unable to share PDF to WhatsApp on this device.",
      );
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageIntro
        eyebrow=" "
        title={quotation?.quote_code || "Quotation"}
        description="Quotation summary with linked versions."
        action={quotation?.event_id ? <Link href={`/events/${quotation.event_id}/quotation`} className="editorial-button-secondary px-5 py-3 text-sm font-semibold uppercase tracking-[0.12rem]">Edit quotations </Link> : null}
      />

      <MessageBanner tone="danger" message={error} />

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Summary">
          <div className="grid gap-4 text-sm leading-7 text-[#2f3331]">
            <p><span className="text-[#5d5e61]">Client:</span> {quotation?.client_name || "-"}</p>
            <p><span className="text-[#5d5e61]">Occasion:</span> {quotation?.occasion_type || "-"}</p>
            <p><span className="text-[#5d5e61]">Event Date:</span> {formatDate(quotation?.event_date)}</p>
            <p><span className="text-[#5d5e61]">Venue:</span> {quotation?.venue || "-"}</p>
          </div>
        </Panel>

        <Panel title="Versions">
          <div className="grid gap-3">
            {(quotation?.versions || []).length ? quotation.versions.map((version) => (
              <article key={version.id} className="editorial-muted p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#2f3331]">Version {version.version_number}</p>
                    <p className="text-sm text-[#5f6662]">{formatDate(version.valid_until)} / {titleize(version.status)}</p>
                  </div>
                  <div className="text-right text-sm text-[#2f3331]">
                    <p>{formatCurrency(version.final_amount)}</p>
                    <p className="text-[#5f6662]">{version.guest_count} guests</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 border-t border-[rgba(93,94,97,0.08)] pt-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownload(version)}
                      disabled={actionId === version.id}
                      className="inline-flex h-9 w-9 items-center justify-center cursor-pointer rounded-sm border border-[#d7d9d4] bg-[#f2f3ef] text-[#5d5e61] transition hover:bg-[#e8ebe4] disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`Download version ${version.version_number}`}
                      title="Download version"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleWhatsAppShare(version)}
                      disabled={actionId === version.id}
                      className="inline-flex h-9 w-9 items-center cursor-pointer justify-center rounded-sm border border-[#b7dcc0] bg-[#e8f6ec] text-[#1f8f46] transition hover:bg-[#daf0e1] disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`Share version ${version.version_number} on WhatsApp`}
                      title="Share on WhatsApp"
                    >
                      <SiWhatsapp size={16} color="#25D366" />
                    </button>
                  </div>

                  <Link
                    href={`/quotation-versions/${version.id}`}
                    className="editorial-button inline-flex items-center gap-2 rounded-sm px-3.5 py-2 text-sm font-semibold"
                  >
                    <span>Open Version</span>
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </article>
            )) : <div className="editorial-muted px-4 py-10 text-center text-sm text-[#5f6662]">No versions created yet.</div>}
          </div>
        </Panel>
      </div>
    </div>
  );
}
