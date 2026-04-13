"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Field,
  LoadingInline,
  MessageBanner,
  PageIntro,
  Panel,
  PrimaryButton,
  SecondaryButton,
  Select,
  TextArea,
  TextInput,
} from "@/components/AdminUI";
import { clientsApi } from "@/services/clients";
import { eventsApi } from "@/services/events";
import { unwrapEntityResponse, unwrapListResponse } from "@/services/normalizers";

const defaultForm = {
  clientId: "",
  occasionType: "",
  eventDate: "",
  startTime: "",
  endTime: "",
  guestCount: 1,
  venue: "",
  notes: "",
  eventStatus: "enquiry",
};

export default function EventForm({ eventId = null }) {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [clientsResponse, eventResponse] = await Promise.all([
          clientsApi.list({ limit: 200 }),
          eventId ? eventsApi.get(eventId) : Promise.resolve(null),
        ]);

        setClients(unwrapListResponse(clientsResponse));

        if (eventResponse) {
          const item = unwrapEntityResponse(eventResponse);
          setForm({
            clientId: String(item?.client_id ?? item?.clientId ?? ""),
            occasionType: item?.occasion_type || item?.occasionType || "",
            eventDate: item?.event_date || item?.eventDate || "",
            startTime: item?.start_time || item?.startTime || "",
            endTime: item?.end_time || item?.endTime || "",
            guestCount: item?.guest_count ?? item?.guestCount ?? 1,
            venue: item?.venue || "",
            notes: item?.notes || "",
            eventStatus: item?.event_status || item?.eventStatus || "enquiry",
          });
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load event form.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [eventId]);

  const onChange = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.clientId || !form.occasionType.trim() || !form.eventDate || Number(form.guestCount) < 1) {
      setError("Client, occasion, date, and guest count are required.");
      return;
    }

    const payload = {
      clientId: Number(form.clientId),
      occasionType: form.occasionType.trim(),
      eventDate: form.eventDate,
      startTime: form.startTime || null,
      endTime: form.endTime || null,
      guestCount: Number(form.guestCount),
      venue: form.venue.trim() || null,
      notes: form.notes.trim() || null,
      eventStatus: form.eventStatus,
    };

    try {
      setSaving(true);
      if (eventId) {
        await eventsApi.update(eventId, payload);
      } else {
        await eventsApi.create(payload);
      }
      router.push("/events");
      router.refresh();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save event.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageIntro
        eyebrow=" "
        title={eventId ? "Edit Event" : "New Event"}
        description=" "
      />

      <Panel>
        {loading ? (
          <div className="py-10 text-sm uppercase tracking-[0.16rem] text-[#5d5e61]">Loading event</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Client" required>
                <Select value={form.clientId} onChange={onChange("clientId")}>
                  <option value="">Select client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Occasion Type" required>
                <TextInput value={form.occasionType} onChange={onChange("occasionType")} placeholder="Wedding" />
              </Field>
              <Field label="Event Date" required>
                <TextInput type="date" value={form.eventDate} onChange={onChange("eventDate")} />
              </Field>
              <Field label="Guest Count" required>
                <TextInput type="number" min="1" value={form.guestCount} onChange={onChange("guestCount")} />
              </Field>
              <Field label="Start Time">
                <TextInput type="time" value={form.startTime} onChange={onChange("startTime")} />
              </Field>
              <Field label="End Time">
                <TextInput type="time" value={form.endTime} onChange={onChange("endTime")} />
              </Field>
              <Field label="Venue">
                <TextInput value={form.venue} onChange={onChange("venue")} placeholder="City View Ballroom" />
              </Field>
              <Field label="Status">
                <Select value={form.eventStatus} onChange={onChange("eventStatus")}>
                  <option value="enquiry">Enquiry</option>
                  <option value="quotation_created">Quotation Created</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </Field>
            </div>

            <Field label="Notes">
              <TextArea value={form.notes} onChange={onChange("notes")} placeholder="Event notes" />
            </Field>

            <MessageBanner tone="danger" message={error} />

            <div className="flex gap-3">
              <PrimaryButton type="submit">{saving ? <LoadingInline label="Saving..." /> : "Save Event"}</PrimaryButton>
              <SecondaryButton type="button" onClick={() => router.push("/events")}>
                Cancel
              </SecondaryButton>
            </div>
          </form>
        )}
      </Panel>
    </div>
  );
}
