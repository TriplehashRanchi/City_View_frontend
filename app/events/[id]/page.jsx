"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageIntro, Panel } from "@/components/AdminUI";
import { eventsApi } from "@/services/events";
import { quotationsApi } from "@/services/quotations";
import { formatDate, titleize, unwrapEntityResponse, unwrapListResponse } from "@/services/normalizers";
import { useParams } from "next/navigation";

export default function EventDetailPage() {
  const params = useParams();
  const [event, setEvent] = useState(null);
  const [quotations, setQuotations] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [eventResponse, quotationResponse] = await Promise.all([
        eventsApi.get(params.id).catch(() => null),
        quotationsApi.listQuotationsByEvent(params.id).catch(() => []),
      ]);
      setEvent(unwrapEntityResponse(eventResponse));
      setQuotations(unwrapListResponse(quotationResponse));
    };
    load();
  }, [params.id]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageIntro
        eyebrow="Events"
        title={event?.occasion_type || "Event"}
        description="Event details with linked quotation record."
        action={<Link href={`/events/${params.id}/edit`} className="editorial-button-secondary px-5 py-3 text-sm font-semibold uppercase tracking-[0.12rem]">Edit Event</Link>}
      />

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Event Summary">
          <div className="grid gap-4 text-sm leading-7 text-[#2f3331]">
            <p><span className="text-[#5d5e61]">Client:</span> {event?.client_name || "-"}</p>
            <p><span className="text-[#5d5e61]">Date:</span> {formatDate(event?.event_date)}</p>
            <p><span className="text-[#5d5e61]">Guests:</span> {event?.guest_count || "-"}</p>
            <p><span className="text-[#5d5e61]">Venue:</span> {event?.venue || "-"}</p>
            <p><span className="text-[#5d5e61]">Status:</span> {titleize(event?.event_status)}</p>
            <p><span className="text-[#5d5e61]">Notes:</span> {event?.notes || "-"}</p>
          </div>
        </Panel>

        <Panel title="Quotation">
          <div className="grid gap-3">
            <Link href={`/events/${params.id}/quotation`} className="editorial-button px-5 py-3 text-sm font-semibold uppercase tracking-[0.12rem] text-center">
              Open Workspace
            </Link>
            {quotations.length ? quotations.map((quotation) => (
              <Link key={quotation.id} href={`/quotations/${quotation.id}`} className="editorial-muted block p-4">
                <p className="font-semibold text-[#2f3331]">{quotation.quote_code || `Quotation ${quotation.id}`}</p>
                <p className="text-sm text-[#5f6662]">Current status: {titleize(quotation.status || quotation.current_status)}</p>
              </Link>
            )) : <div className="editorial-muted px-4 py-10 text-center text-sm text-[#5f6662]">No quotation initialized yet.</div>}
          </div>
        </Panel>
      </div>
    </div>
  );
}
