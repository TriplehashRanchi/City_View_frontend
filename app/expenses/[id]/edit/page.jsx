"use client";

import { useParams } from "next/navigation";
import ExpenseForm from "@/components/forms/ExpenseForm";

export default function EditExpensePage() {
  const params = useParams();
  return <ExpenseForm expenseId={params.id} />;
}
