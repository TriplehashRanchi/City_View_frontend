"use client";

import { useParams } from "next/navigation";
import ClientForm from "@/components/forms/ClientForm";

export default function EditClientPage() {
  const params = useParams();
  return <ClientForm clientId={params.id} />;
}
