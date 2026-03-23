"use client";

import { useEffect, useState } from "react";
import {
  DataTable,
  Field,
  MessageBanner,
  PageIntro,
  Panel,
  PrimaryButton,
  Select,
  TextArea,
  TextInput,
} from "@/components/AdminUI";
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

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsResponse, clientsResponse] = await Promise.all([eventsApi.list(), clientsApi.list({ limit: 100 })]);
      setEvents(eventsResponse.data || []);
      setClients(clientsResponse.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onChange = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      setSubmitting(true);
      await eventsApi.create({
        ...form,
        clientId: Number(form.clientId),
        guestCount: Number(form.guestCount),
        endTime: form.endTime || null,
        notes: form.notes.trim() || null,
      });
      setForm(initialForm);
      setMessage("Event created successfully.");
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to create event.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageIntro
        eyebrow="Operations"
        title="Event operations"
        description="Create events against saved clients and track their enquiry-to-confirmation progression."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.25fr]">
        <Panel title="New event" subtitle="Maps to `POST /operations/events`.">
          <form className="space-y-4" onSubmit={onSubmit}>
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

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Occasion type">
                <TextInput value={form.occasionType} onChange={onChange("occasionType")} placeholder="Wedding" required />
              </Field>
              <Field label="Guest count">
                <TextInput value={form.guestCount} onChange={onChange("guestCount")} type="number" min="1" placeholder="200" required />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Event date">
                <TextInput value={form.eventDate} onChange={onChange("eventDate")} type="date" required />
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

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Start time">
                <TextInput value={form.startTime} onChange={onChange("startTime")} type="time" required />
              </Field>
              <Field label="End time">
                <TextInput value={form.endTime} onChange={onChange("endTime")} type="time" />
              </Field>
            </div>

            <Field label="Venue">
              <TextInput value={form.venue} onChange={onChange("venue")} placeholder="City View Banquet" required />
            </Field>

            <Field label="Notes">
              <TextArea value={form.notes} onChange={onChange("notes")} placeholder="Timeline notes, staffing notes, or client preferences." />
            </Field>

            <MessageBanner tone="success" message={message} />
            <MessageBanner tone="danger" message={error} />

            <PrimaryButton type="submit" disabled={submitting}>
              {submitting ? "Creating event..." : "Create event"}
            </PrimaryButton>
          </form>
        </Panel>

        <Panel title="Event list" subtitle="Latest events joined with client details.">
          {loading ? (
            <p className="text-sm text-[var(--ink-soft)]">Loading events...</p>
          ) : (
            <DataTable
              columns={[
                { key: "client_name", label: "Client" },
                { key: "occasion_type", label: "Occasion" },
                { key: "event_date", label: "Date" },
                { key: "venue", label: "Venue" },
                { key: "guest_count", label: "Guests" },
                {
                  key: "event_status",
                  label: "Status",
                  render: (row) => <span className="capitalize text-[var(--foreground)]">{row.event_status}</span>,
                },
              ]}
              rows={events}
              emptyTitle="No events yet"
              emptyDescription="Create an event after adding a client."
            />
          )}
        </Panel>
      </div>
    </div>
  );
}
