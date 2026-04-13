"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DataTable, PageIntro, Panel, PrimaryButton, TextInput } from "@/components/AdminUI";
import { packagesApi } from "@/services/packages";
import { formatCurrency, titleize, unwrapListResponse } from "@/services/normalizers";

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    packagesApi.list().then((response) => setPackages(unwrapListResponse(response))).catch(() => setPackages([]));
  }, []);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return packages.filter((pkg) => {
      if (!term) return true;
      return pkg.name?.toLowerCase().includes(term) || pkg.description?.toLowerCase().includes(term);
    });
  }, [packages, search]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageIntro
        eyebrow="Packages"
        title="Package Registry"
        description="Packages are curated product shortcuts. They only matter as reusable item-fillers for quotation versions."
        action={
          <Link href="/packages/new">
            <PrimaryButton>Add Package</PrimaryButton>
          </Link>
        }
      />

      <Panel
        title="All Packages"
        aside={<TextInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search packages" className="min-w-[280px]" />}
      >
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            { key: "per_person_price", label: "Per Person", align: "right", render: (row) => formatCurrency(row.per_person_price ?? row.perPersonPrice) },
            { key: "products", label: "Product Count", align: "right", render: (row) => row.products?.length || 0 },
            { key: "status", label: "Status", render: (row) => titleize(row.status) },
            {
              key: "actions",
              label: "Edit",
              render: (row) => <Link href={`/packages/${row.id}/edit`} className="text-[#7b6540]">Open</Link>,
            },
          ]}
          rows={rows}
          emptyTitle="No packages found"
          emptyDescription="Create a package to speed up quotation item selection."
        />
      </Panel>
    </div>
  );
}
