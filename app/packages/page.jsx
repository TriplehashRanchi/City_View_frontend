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
import { packagesApi } from "@/services/packages";
import {
  formatCurrency,
  titleize,
  unwrapListResponse,
} from "@/services/normalizers";
import {
  Box,
  Eye,
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

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    packagesApi
      .list()
      .then((response) => setPackages(unwrapListResponse(response)))
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return packages.filter((pkg) => {
      if (!term) return true;
      return (
        pkg.name?.toLowerCase().includes(term) ||
        pkg.description?.toLowerCase().includes(term)
      );
    });
  }, [packages, search]);

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
        title="Package Registry"
        description="Manage reusable package templates and open the right record quickly for review or editing."
        action={
          <Link href="/packages/new">
            <PrimaryButton className="flex justify-center items-center gap-2">
              <Plus size={18} />
              Add Package
            </PrimaryButton>
          </Link>
        }
      />

      <Panel
        title="All Packages"
        subtitle="Search by package name or description. Use the table to review pricing, included products, and open package actions."
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
              placeholder="Search packages"
              className="pl-11"
            />
          </div>
        }
      >
        {loading ? (
          <LoadingState label="Loading packages..." className="py-10" />
        ) : rows.length ? (
          <>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse table-fixed">
              <thead className="editorial-table-head">
                <tr>
                  <th className="w-[26%] px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                    Package
                  </th>
                  <th className="w-[20%]  py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                    Per Person
                  </th>
                  <th className="w-[20%]  py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                    Product Count
                  </th>
                  <th className="w-[18%]  py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                    Status
                  </th>
                  <th className="w-[18%] px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
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
                        <div className="space-y-1">
                          <p className="font-semibold text-[#2f3331]">
                            {row.name || "-"}
                          </p>
                          
                        </div>
                      </td>

                      <td className="py-5 align-center">
                        <div className="flex items-center gap-2 text-sm text-[#2f3331]">
                          <Tag size={15} className="text-[#7b6540]" />
                          <span>
                            {formatCurrency(
                              row.per_person_price ?? row.perPersonPrice,
                            )}
                          </span>
                        </div>
                      </td>

                      <td className="py-5 pl-8 align-center">
                        <div className="flex items-center gap-2 text-sm text-[#3c413e]">
                          <Box size={15} className="shrink-0 text-[#7b6540]" />
                          <span>{row.products?.length || 0}</span>
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
                            href={`/packages/${row.id}/edit`}
                            className="inline-flex items-center gap-2 font-semibold text-[#7b6540] transition hover:text-[#5d4a28]"
                            aria-label={`Edit ${row.name || "package"}`}
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
            No packages found. Create a package to speed up quotation item selection.
          </div>
        )}
      </Panel>
    </div>
  );
}
