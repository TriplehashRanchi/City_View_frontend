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
import { clientsApi } from "@/services/clients";
import { titleize, unwrapListResponse } from "@/services/normalizers";
import {
  Building2,
  Eye,
  Mail,
  Phone,
  Plus,
  Search,
  SquarePen,
} from "lucide-react";

const statusStyles = {
  active: "bg-[#e4ece6] text-[#34523f]",
  inactive: "bg-[#ece9e2] text-[#5d5e61]",
  blocked: "bg-[#f6e8e5] text-[#8b3733]",
};
const PAGE_SIZE = 8;

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    clientsApi
      .list()
      .then((response) => setClients(unwrapListResponse(response)))
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return clients.filter((client) => {
      if (!term) return true;
      return (
        client.name?.toLowerCase().includes(term) ||
        client.phone?.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term) ||
        client.company_name?.toLowerCase().includes(term)
      );
    });
  }, [clients, search]);

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
        title="Client Registry"
        description="Manage client records in one place and move into profile or edit actions without leaving the table."
        action={
          <Link href="/clients/new">
            <PrimaryButton className="flex justify-center items-center gap-2">
              <Plus size={18} />
              Add Client
            </PrimaryButton>
          </Link>
        }
      />

      <Panel
        title="All Clients"
        subtitle="Search by name, phone, email, or company. Use the table to review records and open the right client action quickly."
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
              placeholder="Search clients"
              className="pl-11"
            />
          </div>
        }
      >
        {loading ? (
          <LoadingState label="Loading clients..." className="py-10" />
        ) : rows.length ? (
          <>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse table-fixed">
              <thead className="editorial-table-head">
                <tr>
                  <th className="w-[20%] px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                    Client
                  </th>
                  <th className="w-[18%] px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                    Phone
                  </th>
                  <th className="w-[22%] px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                    Email
                  </th>
                  <th className="w-[20%] px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                    Company
                  </th>
                  <th className="w-[10%] pr-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
                    Status
                  </th>
                  <th className="w-[10%] px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61]">
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
                        <div>
                          <Link
                            href={`/clients/${row.id}`}
                            className="font-semibold text-[#2f3331] transition hover:text-[#7b6540]"
                          >
                            {row.name || "-"}
                          </Link>
                        </div>
                      </td>

                      <td className=" py-5 align-center">
                        <div className="flex items-center gap-2 text-sm text-[#2f3331]">
                          <Phone size={15} className="text-[#7b6540]" />
                          <span>{row.phone || "-"}</span>
                        </div>
                      </td>

                      <td className=" py-5 align-center">
                        <div className="flex items-center gap-2 text-sm text-[#3c413e]">
                          <Mail size={15} className="shrink-0 text-[#7b6540]" />
                          <span>{row.email || "-"}</span>
                        </div>
                      </td>

                      <td className="pl-6 py-5 align-center">
                        <div className="flex items-center gap-2 text-sm text-[#3c413e]">
                          <Building2
                            size={15}
                            className="shrink-0 text-[#7b6540]"
                          />
                          <span>{row.company_name || "-"}</span>
                        </div>
                      </td>

                      <td className="py-5 align-center">
                        <span
                          className={`inline-flex items-center rounded-sm px-3 py-1 text-[12px] font-semibold uppercase ${tone}`}
                        >
                          {titleize(row.status || "active")}
                        </span>
                      </td>

                      <td className="px-6 py-5 align-center">
                        <div className="flex items-center gap-4">
                          <Link
                            href={`/clients/${row.id}`}
                            className="inline-flex items-center gap-2 text-[#2f3331] transition hover:text-[#7b6540]"
                            aria-label={`View ${row.name || "client"}`}
                          >
                            <Eye size={20} />
                          </Link>
                          <Link
                            href={`/clients/${row.id}/edit`}
                            className="inline-flex items-center gap-2 font-semibold text-[#7b6540] transition hover:text-[#5d4a28]"
                            aria-label={`Edit ${row.name || "client"}`}
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
            No clients found. Create a client before opening event records.
          </div>
        )}
      </Panel>
    </div>
  );
}
