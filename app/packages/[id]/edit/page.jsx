"use client";

import { useParams } from "next/navigation";
import PackageForm from "@/components/forms/PackageForm";

export default function EditPackagePage() {
  const params = useParams();
  return <PackageForm packageId={params.id} />;
}
