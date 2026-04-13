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
import { clientsApi } from "@/services/clients";
import { titleize, unwrapListResponse } from "@/services/normalizers";
import { Plus } from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    clientsApi
      .list()
      .then((response) => setClients(unwrapListResponse(response)))
      .catch(() => setClients([]));
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

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageIntro
        eyebrow=" "
        title="Client Registry"
        description="Clients remain their own domain. Events reference clients; quotations reference events."
        action={
          <Link href="/clients/new">
            <PrimaryButton className="flex justify-center items-center gap-2">
              {" "}
              <Plus />
              Add Client
            </PrimaryButton>
          </Link>
        }
      />

      <Panel
        title="All Clients"
        aside={
          <TextInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search clients"
            className="min-w-[280px]"
          />
        }
      >
        <DataTable
          columns={[
            {
              key: "name",
              label: "Name",
              render: (row) => (
                <Link href={`/clients/${row.id}`} className="text-[#2f3331]">
                  {row.name}
                </Link>
              ),
            },
            { key: "phone", label: "Phone" },
            { key: "email", label: "Email" },
            { key: "company_name", label: "Company" },
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
                  href={`/clients/${row.id}/edit`}
                  className="text-[#7b6540]"
                >
                  Open
                </Link>
              ),
            },
          ]}
          rows={rows}
          emptyTitle="No clients found"
          emptyDescription="Create a client before opening event records."
        />
      </Panel>
    </div>
  );
}
