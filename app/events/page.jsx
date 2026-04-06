"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  DataTable,
  Field,
  LoadingInline,
  LoadingState,
  MessageBanner,
  PageIntro,
  Panel,
  PrimaryButton,
  SecondaryButton,
  Select,
  TextArea,
  TextInput,
} from "@/components/AdminUI";
import { useToast } from "@/components/ToastProvider";
import { clientsApi, eventsApi } from "@/services/modules";

const initialForm = {
  clientId: "",
  occasionType: "",
  eventDate: "",
  startTime: "",
  endTime: "",
  guestCount: "",
  venue: "",
  notes: "",
  eventStatus: "enquiry",
};

const itemsPerPage = 8;

export default function EventsPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const deferredSearchTerm = useDeferredValue(searchTerm);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [eventsResponse, clientsResponse] = await Promise.all([
        eventsApi.list(),
        clientsApi.list({ limit: 100 }),
      ]);
      setEvents(eventsResponse.data || []);
      setClients(clientsResponse.data || []);
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to load events.";
      setError(message);
      toast({
        variant: "error",
        title: "Events not loaded",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!showDrawer) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowDrawer(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [showDrawer]);

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearchTerm, statusFilter]);

  const onChange = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const openDrawer = () => {
    setError("");
    setShowDrawer(true);
  };

  const resetDrawer = () => {
    setForm(initialForm);
    setError("");
    setShowDrawer(false);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      setSubmitting(true);
      const selectedClient = clients.find((client) => String(client.id) === String(form.clientId));

      await eventsApi.create({
        ...form,
        clientId: Number(form.clientId),
        guestCount: Number(form.guestCount),
        endTime: form.endTime || null,
        notes: form.notes.trim() || null,
      });

      setMessage("Event created successfully.");
      toast({
        variant: "success",
        title: "Event saved successfully",
        description: `${selectedClient?.name || "Event"} has been added to operations.`,
      });
      resetDrawer();
      await loadData();
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to create event.";
      setError(message);
      toast({
        variant: "error",
        title: "Event not saved",
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEvents = useMemo(() => {
    const term = deferredSearchTerm.trim().toLowerCase();

    return events.filter((item) => {
      const matchesSearch =
        !term ||
        item.client_name?.toLowerCase().includes(term) ||
        item.occasion_type?.toLowerCase().includes(term) ||
        item.venue?.toLowerCase().includes(term) ||
        item.event_date?.toLowerCase().includes(term) ||
        String(item.guest_count || "").toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" || (item.event_status || "").toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, deferredSearchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / itemsPerPage));
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageIntro
        eyebrow="Operations"
        title="Events"
        description="A focused operations board for search, review, and fast event creation."
        action={<PrimaryButton onClick={openDrawer}>+ Add event</PrimaryButton>}
      />

      <Panel
        title="All events"
        subtitle="Minimal view, faster scanning, and ready for future actions."
        aside={
          <div className="flex flex-col gap-3 md:flex-row">
            <TextInput
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search client, occasion, venue, date, guests"
              className="w-full min-w-[260px] bg-gray-50"
            />
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All status</option>
              <option value="enquiry">Enquiry</option>
              <option value="quoted">Quoted</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>
        }
      >
        <MessageBanner tone="success" message={message} />
        <MessageBanner tone="danger" message={error} />

        {loading ? (
          <LoadingState label="Loading events..." />
        ) : (
          <div className="space-y-5">
            <DataTable
              columns={[
                {
                  key: "client_name",
                  label: "Client",
                  render: (row) => (
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-800">{row.client_name || "-"}</p>
                      <p className="text-xs text-gray-500">{row.occasion_type || "No occasion set"}</p>
                    </div>
                  ),
                },
                {
                  key: "event_date",
                  label: "Schedule",
                  render: (row) => (
                    <div className="space-y-1">
                      <p className="font-medium text-gray-700">{row.event_date || "-"}</p>
                      <p className="text-xs text-gray-500">
                        {row.start_time || "--:--"} {row.end_time ? `to ${row.end_time}` : ""}
                      </p>
                    </div>
                  ),
                },
                { key: "venue", label: "Venue" },
                {
                  key: "guest_count",
                  label: "Guests",
                  render: (row) => <span>{row.guest_count || "-"}</span>,
                },
                {
                  key: "event_status",
                  label: "Status",
                  render: (row) => (
                    <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold capitalize text-green-700">
                      {row.event_status || "enquiry"}
                    </span>
                  ),
                },
              ]}
              rows={paginatedEvents}
              emptyTitle="No events found"
              emptyDescription="Try a different search, switch the filter, or create a new event."
            />

            {filteredEvents.length > itemsPerPage ? (
              <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </p>

                <div className="flex items-center gap-2">
                  <SecondaryButton
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2"
                  >
                    Prev
                  </SecondaryButton>

                  <div className="flex items-center gap-1 rounded-full bg-gray-100 p-1">
                    {Array.from({ length: totalPages }, (_, index) => {
                      const page = index + 1;

                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`h-9 min-w-9 rounded-full px-3 text-sm font-semibold transition ${
                            currentPage === page
                              ? "bg-green-700 text-white"
                              : "text-gray-600 hover:bg-white"
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
                    className="px-4 py-2"
                  >
                    Next
                  </SecondaryButton>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </Panel>

      <div className="pointer-events-none fixed inset-0 z-[9999]">
        <div
          onClick={resetDrawer}
          className={`absolute inset-0 bg-black/35 backdrop-blur-sm transition-opacity duration-300 ${
            showDrawer ? "pointer-events-auto opacity-100" : "opacity-0"
          }`}
        />

        <aside
          className={`absolute right-0 top-0 h-full w-full max-w-xl transform bg-white shadow-2xl transition-transform duration-300 ease-out ${
            showDrawer ? "pointer-events-auto translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-gray-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-green-600">New event</p>
                  <h2 className="mt-2 text-2xl font-semibold text-gray-800">Add event</h2>
                  <p className="mt-2 text-sm text-gray-500">Capture the event details without leaving the list view.</p>
                </div>
                <button
                  type="button"
                  onClick={resetDrawer}
                  className="rounded-full border border-gray-200 px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-50 hover:text-gray-800"
                >
                  Close
                </button>
              </div>
            </div>

            <form className="flex flex-1 flex-col overflow-y-auto px-6 py-6" onSubmit={onSubmit}>
              <div className="space-y-4">
                <Field label="Client">
                  <Select value={form.clientId} onChange={onChange("clientId")} required>
                    <option value="">Select client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.company_name ? `- ${client.company_name}` : ""}
                      </option>
                    ))}
                  </Select>
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Occasion type">
                    <TextInput
                      value={form.occasionType}
                      onChange={onChange("occasionType")}
                      placeholder="Wedding"
                      required
                    />
                  </Field>
                  <Field label="Guest count">
                    <TextInput
                      value={form.guestCount}
                      onChange={onChange("guestCount")}
                      type="number"
                      min="1"
                      placeholder="200"
                      required
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Event date">
                    <TextInput
                      value={form.eventDate}
                      onChange={onChange("eventDate")}
                      type="date"
                      required
                    />
                  </Field>
                  <Field label="Status">
                    <Select value={form.eventStatus} onChange={onChange("eventStatus")}>
                      <option value="enquiry">Enquiry</option>
                      <option value="quoted">Quoted</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </Select>
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Start time">
                    <TextInput
                      value={form.startTime}
                      onChange={onChange("startTime")}
                      type="time"
                      required
                    />
                  </Field>
                  <Field label="End time">
                    <TextInput value={form.endTime} onChange={onChange("endTime")} type="time" />
                  </Field>
                </div>

                <Field label="Venue">
                  <TextInput
                    value={form.venue}
                    onChange={onChange("venue")}
                    placeholder="City View Banquet"
                    required
                  />
                </Field>

                <Field label="Notes">
                  <TextArea
                    value={form.notes}
                    onChange={onChange("notes")}
                    placeholder="Timeline, staffing, preferences, or service notes"
                  />
                </Field>

                <MessageBanner tone="danger" message={error} />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
                <SecondaryButton type="button" onClick={resetDrawer}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={submitting}>
                  {submitting ? <LoadingInline label="Saving..." /> : "Save event"}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
