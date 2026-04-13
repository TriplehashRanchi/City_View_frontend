"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DataTable, PageIntro, Panel, PrimaryButton, TextInput } from "@/components/AdminUI";
import { eventsApi } from "@/services/events";
import { formatDate, titleize, unwrapListResponse } from "@/services/normalizers";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    eventsApi.list().then((response) => setEvents(unwrapListResponse(response))).catch(() => setEvents([]));
  }, []);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return events.filter((item) => {
      if (!term) return true;
      return (
        item.client_name?.toLowerCase().includes(term) ||
        item.occasion_type?.toLowerCase().includes(term) ||
        item.venue?.toLowerCase().includes(term)
      );
    });
  }, [events, search]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageIntro
        eyebrow="Events"
        title="Event Registry"
        description="Events hold client context and quotation lifecycle. `quotation_created` replaces the old quoted status."
        action={
          <Link href="/events/new">
            <PrimaryButton>Add Event</PrimaryButton>
          </Link>
        }
      />

      <Panel
        title="All Events"
        aside={<TextInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search events" className="min-w-[280px]" />}
      >
        <DataTable
          columns={[
            { key: "client_name", label: "Client", render: (row) => <Link href={`/events/${row.id}`} className="text-[#2f3331]">{row.client_name || "-"}</Link> },
            { key: "occasion_type", label: "Occasion" },
            { key: "event_date", label: "Date", render: (row) => formatDate(row.event_date) },
            { key: "guest_count", label: "Guests", align: "right" },
            { key: "venue", label: "Venue" },
            { key: "event_status", label: "Status", render: (row) => titleize(row.event_status) },
            { key: "quotation", label: "Quotation", render: (row) => <Link href={`/events/${row.id}/quotation`} className="text-[#7b6540]">Workspace</Link> },
          ]}
          rows={rows}
          emptyTitle="No events found"
          emptyDescription="Create an event to begin a quotation workflow."
        />
      </Panel>
    </div>
  );
}
