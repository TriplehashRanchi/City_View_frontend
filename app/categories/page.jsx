"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  LoadingState,
  PaginationControls,
  PageIntro,
  Panel,
  PrimaryButton,
  TextInput,
} from "@/components/AdminUI";
import { categoriesApi } from "@/services/categories";
import { titleize, unwrapListResponse } from "@/services/normalizers";
import {
  Eye,
  Hash,
  ListOrdered,
  Plus,
  Search,
  SquarePen,
  Tag,
} from "lucide-react";

const statusStyles = {
  active: "bg-[#e4ece6] text-[#34523f]",
  inactive: "bg-[#ece9e2] text-[#5d5e61]",
  draft: "bg-[#eee7d7] text-[#6f5d33]",
};
const PAGE_SIZE = 8;

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    categoriesApi
      .list()
      .then((response) => setCategories(unwrapListResponse(response)))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
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

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, safePage]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageIntro
        eyebrow=" "
        title="Category Registry"
        description="Manage category taxonomy in a cleaner table and open the right record quickly for review or editing."
        action={
          <Link href="/categories/new">
            <PrimaryButton className="flex justify-center items-center gap-2">
              <Plus size={18} />
              Add Category
            </PrimaryButton>
          </Link>
        }
      />

      <Panel
        title="All Categories"
        subtitle="Search by category name or slug. Use the table to review structure, ordering, and category actions."
        aside={
          <div className="relative min-w-[320px]">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7b6540]"
            />
            <TextInput
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search categories"
              className="pl-11"
            />
          </div>
        }
      >
        {loading ? (
          <LoadingState label="Loading categories..." className="py-10" />
        ) : rows.length ? (
          <>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse table-fixed">
              <thead className="editorial-table-head">
                <tr>
                  <th className="w-[28%] px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                    Category
                  </th>
                  <th className="w-[22%] py-4 pl-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                    Slug
                  </th>
                  <th className="w-[16%] py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                    Sort Order
                  </th>
                  <th className="w-[18%] py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                    Status
                  </th>
                  <th className="w-[16%] px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row) => {
                  const tone =
                    statusStyles[(row.status || "").toLowerCase()] ||
                    "bg-[#ece9e2] text-[#5d5e61]";

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-[var(--outline-ghost)] last:border-b-0"
                    >
                      <td className="px-6 py-5 align-center">
                        <div className="flex items-center gap-2 text-[#2f3331]">
                          <Tag size={16} className="shrink-0 text-[#7b6540]" />
                          <span className="font-semibold">{row.name || "-"}</span>
                        </div>
                      </td>

                      <td className="py-5  align-center">
                        <div className="flex items-center gap-2 text-sm text-[#3c413e]">
                          <Hash size={15} className="shrink-0 text-[#7b6540]" />
                          <span>{row.slug || "-"}</span>
                        </div>
                      </td>

                      <td className="py-5 pl-6 align-center">
                        <div className="flex items-center gap-2 text-sm text-[#2f3331]">
                          <ListOrdered
                            size={15}
                            className="shrink-0 text-[#7b6540]"
                          />
                          <span>{row.sort_order ?? 0}</span>
                        </div>
                      </td>

                      <td className="py-5 align-center">
                        <span
                          className={`inline-flex items-center rounded-sm px-3 py-1 text-[12px] font-semibold uppercase ${tone}`}
                        >
                          {titleize(row.status || "active")}
                        </span>
                      </td>

                      <td className="pl-10 py-5 align-center">
                        <div className="flex items-center gap-4">
                          
                          <Link
                            href={`/categories/${row.id}/edit`}
                            className="inline-flex items-center gap-2 font-semibold text-[#7b6540] transition hover:text-[#5d4a28]"
                            aria-label={`Edit ${row.name || "category"}`}
                          >
                            <SquarePen size={18} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <PaginationControls
            currentPage={safePage}
            totalPages={totalPages}
            totalItems={rows.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
          </>
        ) : (
          <div className="editorial-muted px-4 py-12 text-center text-sm leading-7 text-[#5f6662]">
            No categories found. Create categories before building products.
          </div>
        )}
      </Panel>
    </div>
  );
}
