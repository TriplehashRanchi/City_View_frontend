"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageIntro, Panel } from "@/components/AdminUI";
import { quotationsApi } from "@/services/quotations";
import { formatCurrency, formatDate, titleize, unwrapEntityResponse } from "@/services/normalizers";
import { useParams } from "next/navigation";

export default function QuotationDetailPage() {
  const params = useParams();
  const [quotation, setQuotation] = useState(null);

  useEffect(() => {
    quotationsApi.getQuotation(params.id).then((response) => setQuotation(unwrapEntityResponse(response))).catch(() => setQuotation(null));
  }, [params.id]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageIntro
        eyebrow="Quotations"
        title={quotation?.quote_code || "Quotation"}
        description="Quotation summary with linked versions."
        action={quotation?.event_id ? <Link href={`/events/${quotation.event_id}/quotation`} className="editorial-button-secondary px-5 py-3 text-sm font-semibold uppercase tracking-[0.12rem]">Open Builder</Link> : null}
      />

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
              <Link key={version.id} href={`/quotation-versions/${version.id}`} className="editorial-muted block p-4">
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
              </Link>
            )) : <div className="editorial-muted px-4 py-10 text-center text-sm text-[#5f6662]">No versions created yet.</div>}
          </div>
        </Panel>
      </div>
    </div>
  );
}
