"use client";

import { useParams } from "next/navigation";
import ProductForm from "@/components/forms/ProductForm";

export default function EditProductPage() {
  const params = useParams();
  return <ProductForm productId={params.id} />;
}
