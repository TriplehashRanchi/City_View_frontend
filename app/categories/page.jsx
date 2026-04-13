"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  DataTable,
  PageIntro,
  Panel,
  PrimaryButton,
  TextInput,
} from "@/components/AdminUI";
import { categoriesApi } from "@/services/categories";
import { titleize, unwrapListResponse } from "@/services/normalizers";
import { Plus } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    categoriesApi
      .list()
      .then((response) => setCategories(unwrapListResponse(response)))
      .catch(() => setCategories([]));
  }, []);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return categories.filter((category) => {
      if (!term) return true;
      return (
        category.name?.toLowerCase().includes(term) ||
        category.slug?.toLowerCase().includes(term)
      );
    });
  }, [categories, search]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageIntro
        eyebrow=" "
        title="Category Registry"
        description="Category records define the product taxonomy and ordering used across products and package composition."
        action={
          <Link href="/categories/new">
            <PrimaryButton className="flex justify-center items-center gap-2">
              {" "}
                           {" "}
              <Plus />
              Add Category
            </PrimaryButton>
          </Link>
        }
      />

      <Panel
        title="All Categories"
        aside={
          <TextInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search categories"
            className="min-w-[280px]"
          />
        }
      >
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            { key: "slug", label: "Slug" },
            { key: "sort_order", label: "Sort Order", align: "right" },
            {
              key: "status",
              label: "Status",
              render: (row) => titleize(row.status),
            },
            {
              key: "actions",
              label: "Edit",
              render: (row) => (
                <Link
                  href={`/categories/${row.id}/edit`}
                  className="text-[#7b6540]"
                >
                  Open
                </Link>
              ),
            },
          ]}
          rows={rows}
          emptyTitle="No categories found"
          emptyDescription="Create categories before building products."
        />
      </Panel>
    </div>
  );
}
