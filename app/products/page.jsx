"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DataTable, PageIntro, Panel, PrimaryButton, TextInput } from "@/components/AdminUI";
import { productsApi } from "@/services/products";
import { formatCurrency, titleize, unwrapListResponse } from "@/services/normalizers";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    productsApi.list().then((response) => setProducts(unwrapListResponse(response))).catch(() => setProducts([]));
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

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageIntro
        eyebrow="Products"
        title="Product Registry"
        description="Each product is a flat catalog record with base price, category, food type, and status."
        action={
          <Link href="/products/new">
            <PrimaryButton>Add Product</PrimaryButton>
          </Link>
        }
      />

      <Panel
        title="All Products"
        aside={<TextInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" className="min-w-[280px]" />}
      >
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            {
              key: "image_url",
              label: "Image",
              render: (row) => (
                row.image_url || row.imageUrl ? <span className="text-[#7b6540]">Available</span> : <span className="text-[#5f6662]">None</span>
              ),
            },
            { key: "category_name", label: "Category", render: (row) => row.category_name || titleize(row.category_slug) },
            { key: "food_type", label: "Food Type", render: (row) => titleize(row.food_type) },
            { key: "base_price", label: "Base Price", align: "right", render: (row) => formatCurrency(row.base_price ?? row.basePrice) },
            { key: "status", label: "Status", render: (row) => titleize(row.status) },
            {
              key: "actions",
              label: "Edit",
              render: (row) => <Link href={`/products/${row.id}/edit`} className="text-[#7b6540]">Open</Link>,
            },
          ]}
          rows={rows}
          emptyTitle="No products found"
          emptyDescription="Create the first product record to start building packages and quotations."
        />
      </Panel>
    </div>
  );
}
