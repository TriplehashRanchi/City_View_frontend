"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageIntro, Panel } from "@/components/AdminUI";
import { clientsApi } from "@/services/clients";
import { eventsApi } from "@/services/events";
import { formatDate, titleize, unwrapEntityResponse, unwrapListResponse } from "@/services/normalizers";
import { useParams } from "next/navigation";

export default function ClientDetailPage() {
  const params = useParams();
  const [client, setClient] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [clientResponse, eventsResponse] = await Promise.all([
        clientsApi.get(params.id).catch(() => null),
        eventsApi.list({ clientId: params.id }).catch(() => []),
      ]);
      setClient(unwrapEntityResponse(clientResponse));
      setEvents(unwrapListResponse(eventsResponse));
    };
    load();
  }, [params.id]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageIntro
        eyebrow="Clients"
        title={client?.name || "Client"}
        description="Client record with linked event history."
        action={<Link href={`/clients/${params.id}/edit`} className="editorial-button-secondary px-5 py-3 text-sm font-semibold uppercase tracking-[0.12rem]">Edit Client</Link>}
      />

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Profile">
          <div className="grid gap-4 text-sm leading-7 text-[#2f3331]">
            <p><span className="text-[#5d5e61]">Phone:</span> {client?.phone || "-"}</p>
            <p><span className="text-[#5d5e61]">Email:</span> {client?.email || "-"}</p>
            <p><span className="text-[#5d5e61]">Company:</span> {client?.company_name || "-"}</p>
            <p><span className="text-[#5d5e61]">Status:</span> {titleize(client?.status)}</p>
            <p><span className="text-[#5d5e61]">Notes:</span> {client?.notes || "-"}</p>
          </div>
        </Panel>

        <Panel title="Events">
          <div className="grid gap-3">
            {events.length ? events.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="editorial-muted block p-4">
                <p className="font-semibold text-[#2f3331]">{event.occasion_type || "-"}</p>
                <p className="text-sm text-[#5f6662]">{formatDate(event.event_date)} / {event.venue || "-"}</p>
              </Link>
            )) : <div className="editorial-muted px-4 py-10 text-center text-sm text-[#5f6662]">No events for this client yet.</div>}
          </div>
        </Panel>
      </div>
    </div>
  );
}
