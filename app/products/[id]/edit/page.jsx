"use client";

import { useParams, useSearchParams } from "next/navigation";
import ProductForm from "@/components/forms/ProductForm";

export default function EditProductPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  return <ProductForm productId={params.id} returnPage={searchParams.get("page")} />;
}
