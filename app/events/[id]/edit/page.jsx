"use client";

import { useParams } from "next/navigation";
import EventForm from "@/components/forms/EventForm";

export default function EditEventPage() {
  const params = useParams();
  return <EventForm eventId={params.id} />;
}
