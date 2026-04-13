"use client";

import { useParams } from "next/navigation";
import CategoryForm from "@/components/forms/CategoryForm";

export default function EditCategoryPage() {
  const params = useParams();
  return <CategoryForm categoryId={params.id} />;
}
