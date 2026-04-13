"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  LoadingState,
  PaginationControls,
  PageIntro,
  Panel,
  PrimaryButton,
  TextInput,
} from "@/components/AdminUI";
import { eventsApi } from "@/services/events";
import {
  formatDate,
  titleize,
  unwrapListResponse,
} from "@/services/normalizers";
import {
  CalendarDays,
  Eye,
  MapPin,
  Plus,
  Search,
  SquarePen,
  Users,
} from "lucide-react";

const statusStyles = {
  enquiry: "bg-[#eee7d7] text-[#6f5d33]",
  quotation_created: "bg-[#e5edf4] text-[#35546b]",
  confirmed: "bg-[#e4ece6] text-[#34523f]",
  cancelled: "bg-[#f6e8e5] text-[#8b3733]",
};
const PAGE_SIZE = 8;

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    eventsApi
      .list()
      .then((response) => setEvents(unwrapListResponse(response)))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
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

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, safePage]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageIntro
        eyebrow=" "
        title="Event Registry"
        description="Track client events, monitor quotation progress, and move into the right workspace from one clean table."
        action={
          <Link href="/events/new">
            <PrimaryButton className="flex justify-center items-center gap-2">
              <Plus size={18} />
              Add Event
            </PrimaryButton>
          </Link>
        }
      />

      <Panel
        title="All Events"
        subtitle="Search by client, occasion, or venue. Use the table to jump directly into event records and quotation workspaces."
        aside={
          <div className="relative min-w-[320px]">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7b6540]"
            />
            <TextInput
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search events"
              className="pl-11"
            />
          </div>
        }
      >
        {loading ? (
          <LoadingState label="Loading events..." className="py-10" />
        ) : rows.length ? (
          <>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse table-fixed">
              <thead className="editorial-table-head">
                <tr>
                  <th className="w-[18%] px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                    Client
                  </th>
                  <th className="w-[22%] px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                    Schedule
                  </th>
                  <th className="w-[12%] px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                    Guests
                  </th>
                  <th className="w-[18%] px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                    Venue
                  </th>
                  <th className="w-[16%] px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                    Status
                  </th>
                  <th className="w-[14%] px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row) => {
                  const tone =
                    statusStyles[(row.event_status || "").toLowerCase()] ||
                    "bg-[#ece9e2] text-[#5d5e61]";

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-[var(--outline-ghost)] last:border-b-0"
                    >
                      <td className="px-6 py-5 align-center">
                        <div className="">
                          <p className="font-semibold text-[#2f3331]    ">
                            {row.client_name || "-"}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-5 align-center">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-[#2f3331]">
                            <CalendarDays
                              size={15}
                              className="text-[#7b6540]"
                            />
                            <span>{formatDate(row.event_date)}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-5 align-center">
                        <div className="inline-flex items-center gap-2    px-3 py-2 text-sm text-[#2f3331]">
                          <Users size={15} className="text-[#7b6540]" />
                          <span>{row.guest_count || 0}</span>
                        </div>
                      </td>

                      <td className="px-4 py-5 align-center">
                        <div className="flex items-start gap-2 text-sm text-[#3c413e]">
                          <MapPin
                            size={15}
                            className="mt-0.5 shrink-0 text-[#7b6540]"
                          />
                          <span>{row.venue || "-"}</span>
                        </div>
                      </td>

                      <td className=" py-5 align-center">
                        <span
                          className={`inline-flex items-center rounded-sm  py-1 text-[12px] font-semibold uppercase  `}
                        >
                          {titleize(row.event_status || "enquiry")}
                        </span>
                      </td>

                      <td className="px-6 py-5 align-center ">
                        <div className="flex items-center gap-4">
                          <Link
                            href={`/events/${row.id}`}
                            className="inline-flex items-center gap-2 text-[#2f3331] transition hover:text-[#7b6540]"
                            aria-label={`View ${row.client_name || "event"}`}
                          >
                            <Eye size={20} />
                          </Link>
                          <Link
                            href={`/events/${row.id}/quotation`}
                            className="inline-flex items-center gap-2 font-semibold text-[#7b6540] transition hover:text-[#5d4a28]"
                          >
                            <SquarePen size={18} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <PaginationControls
            currentPage={safePage}
            totalPages={totalPages}
            totalItems={rows.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
          </>
        ) : (
          <div className="editorial-muted px-4 py-12 text-center text-sm leading-7 text-[#5f6662]">
            No events found. Create an event to begin a quotation workflow.
          </div>
        )}
      </Panel>
    </div>
  );
}
