"use client";

import { useParams } from "next/navigation";
import QuotationBuilder from "@/components/quotations/QuotationBuilder";

export default function EventQuotationPage() {
  const params = useParams();
  return <QuotationBuilder eventId={params.id} />;
}
