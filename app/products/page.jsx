"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LoadingState,
  PaginationControls,
  PageIntro,
  Panel,
  PrimaryButton,
  TextInput,
} from "@/components/AdminUI";
import { productsApi } from "@/services/products";
import {
  formatCurrency,
  titleize,
  unwrapListResponse,
} from "@/services/normalizers";
import {
  Eye,
  Image as ImageIcon,
  Plus,
  Salad,
  Search,
  SquarePen,
  Tag,
  UtensilsCrossed,
} from "lucide-react";

const statusStyles = {
  active: "bg-[#e4ece6] text-[#34523f]",
  inactive: "bg-[#ece9e2] text-[#5d5e61]",
  draft: "bg-[#eee7d7] text-[#6f5d33]",
};
const PAGE_SIZE = 8;

export default function ProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const currentPage = (() => {
    const page = Number(searchParams.get("page"));
    return Number.isInteger(page) && page > 0 ? page : 1;
  })();

  useEffect(() => {
    productsApi
      .list()
      .then((response) => setProducts(unwrapListResponse(response)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      if (!term) return true;
      return (
        product.name?.toLowerCase().includes(term) ||
        product.category_name?.toLowerCase().includes(term) ||
        product.category_slug?.toLowerCase().includes(term) ||
        product.food_type?.toLowerCase().includes(term)
      );
    });
  }, [products, search]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, safePage]);

  useEffect(() => {
    if (loading) return;

    const params = new URLSearchParams(searchParams.toString());

    if (safePage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(safePage));
    }

    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();
    if (nextQuery !== currentQuery) {
      const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      router.replace(nextUrl, { scroll: false });
    }
  }, [loading, pathname, router, safePage, searchParams]);

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const nextQuery = params.toString();
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageIntro
        eyebrow=" "
        title="Product Registry"
        description="Manage the product catalog in a cleaner table and open the right record quickly for review or editing."
        action={
          <Link href="/products/new">
            <PrimaryButton className="flex justify-center items-center gap-2">
              <Plus size={18} />
              Add Product
            </PrimaryButton>
          </Link>
        }
      />

      <Panel
        title="All Products"
        subtitle="Search by name, category, or food type. Use the table to review product metadata and open product actions."
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
                handlePageChange(1);
              }}
              placeholder="Search products"
              className="pl-11"
            />
          </div>
        }
      >
        {loading ? (
          <LoadingState label="Loading products..." className="py-10" />
        ) : rows.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse table-fixed">
                <thead className="editorial-table-head">
                  <tr>
                    <th className="w-[24%] px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                      Product
                    </th>
                    <th className="w-[14%] py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                      Status
                    </th>
                    <th className="w-[18%] py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                      Category
                    </th>
                    <th className="w-[16%] py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                      Food Type
                    </th>
                    <th className="w-[14%] py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                      Base Price
                    </th>
                    <th className="w-[14%] px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
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
                          <span
                            className={`inline-flex items-center rounded-sm px-3 py-1 text-[11px] font-semibold uppercase ${tone}`}
                          >
                            {titleize(row.status || "active")}
                          </span>
                        </td>

                        <td className="py-5 align-center">
                          <div className="flex items-center gap-2 text-sm text-[#3c413e]">
                            <Tag
                              size={15}
                              className="shrink-0 text-[#7b6540]"
                            />
                            <span>
                              {row.category_name || titleize(row.category_slug)}
                            </span>
                          </div>
                        </td>

                        <td className="py-5 pl-4 align-center">
                          <div className="flex items-center gap-2 text-sm text-[#3c413e]">
                            {row.food_type === "veg" ? (
                              <Salad
                                size={15}
                                className="shrink-0 text-[#7b6540]"
                              />
                            ) : row.food_type === "non_veg" ? (
                              <UtensilsCrossed
                                size={15}
                                className="shrink-0 text-[#7b6540]"
                              />
                            ) : null}

                            <span>{titleize(row.food_type)}</span>
                          </div>
                        </td>

                        <td className="py-5 pl-4 align-center">
                          <div className="text-sm font-medium text-[#2f3331]">
                            {formatCurrency(row.base_price ?? row.basePrice)}
                          </div>
                        </td>

                        <td className="pl-10 py-5 align-center">
                          <div className="flex items-center gap-4">
                            <Link
                              href={`/products/${row.id}/edit?page=${safePage}`}
                              className="inline-flex items-center gap-2 font-semibold text-[#7b6540] transition hover:text-[#5d4a28]"
                              aria-label={`Edit ${row.name || "product"}`}
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
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="editorial-muted px-4 py-12 text-center text-sm leading-7 text-[#5f6662]">
            No products found. Create the first product record to start building
            packages and quotations.
          </div>
        )}
      </Panel>
    </div>
  );
}
