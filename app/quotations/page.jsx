"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageIntro, Panel, PrimaryButton } from "@/components/AdminUI";
import { eventsApi } from "@/services/events";
import { quotationsApi } from "@/services/quotations";
import { formatCurrency, formatDate, titleize, unwrapListResponse } from "@/services/normalizers";

export default function QuotationsPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const load = async () => {
      const events = unwrapListResponse(await eventsApi.list().catch(() => []));
      const allRows = [];

      for (const event of events) {
        try {
          const quotations = unwrapListResponse(await quotationsApi.listQuotationsByEvent(event.id));
          for (const quotation of quotations) {
            const detail = await quotationsApi.getQuotation(quotation.id).catch(() => quotation);
            const entity = detail?.data || detail;
            const latestVersion = entity?.versions?.[0] || entity?.latestVersion || null;

            allRows.push({
              id: quotation.id,
              quoteCode: entity?.quote_code || quotation.quote_code || `Q-${quotation.id}`,
              clientName: entity?.client_name || event.client_name || "-",
              occasionType: entity?.occasion_type || event.occasion_type || "-",
              eventDate: entity?.event_date || event.event_date || "-",
              status: latestVersion?.status || entity?.current_status || quotation?.status || "draft",
              totalVersions: entity?.versions?.length || quotation?.total_versions || 0,
              finalAmount: latestVersion?.final_amount || quotation?.final_amount || 0,
            });
          }
        } catch {}
      }

      setRows(allRows);
    };

    load();
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageIntro
        eyebrow="Quotations"
        title="Quotation Registry"
        description="This view is a registry over quotation records. The authoring workspace still lives under each event."
        action={
          <Link href="/quotations/new">
            <PrimaryButton>Create Quotation</PrimaryButton>
          </Link>
        }
      />

      <Panel title="All Quotations">
        <div className="grid gap-3">
          {rows.length ? rows.map((row) => (
            <Link key={row.id} href={`/quotations/${row.id}`} className="editorial-panel grid gap-3 p-5 md:grid-cols-[1.2fr_1fr_160px_140px] md:items-center">
              <div>
                <p className="display-font text-2xl text-[#2f3331]">{row.quoteCode}</p>
                <p className="mt-1 text-sm text-[#5f6662]">{row.clientName} / {row.occasionType}</p>
              </div>
              <div className="text-sm text-[#2f3331]">{formatDate(row.eventDate)}</div>
              <div className="text-sm uppercase tracking-[0.12rem] text-[#7b6540]">{titleize(row.status)}</div>
              <div className="text-right">
                <p className="text-sm text-[#5d5e61]">v{row.totalVersions}</p>
                <p className="font-semibold text-[#2f3331]">{formatCurrency(row.finalAmount)}</p>
              </div>
            </Link>
          )) : <div className="editorial-muted px-4 py-10 text-center text-sm text-[#5f6662]">No quotations available yet.</div>}
        </div>
      </Panel>
    </div>
  );
}
