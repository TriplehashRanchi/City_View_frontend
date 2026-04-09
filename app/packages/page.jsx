"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import {
  DataTable,
  LoadingState,
  MessageBanner,
  PageIntro,
  Panel,
  PrimaryButton,
} from "@/components/AdminUI";
import { catalogApi } from "@/services/modules";

export default function PackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await catalogApi.listPackages();
      setPackages(response.data || []);
    } catch {
      setError("Unable to load package data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPackages = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return packages.filter((pkg) =>
      pkg.name?.toLowerCase().includes(term) ||
      pkg.description?.toLowerCase().includes(term) ||
      pkg.pricing_type?.toLowerCase().includes(term) ||
      pkg.status?.toLowerCase().includes(term)
    );
  }, [packages, searchTerm]);

  const dataToUse = searchTerm ? filteredPackages : packages;
  const totalPages = Math.ceil(dataToUse.length / itemsPerPage);
  const paginatedPackages = dataToUse.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageIntro
        eyebrow="Packages"
        title="Package builder"
        description="Review reusable packages and open the dedicated builder for new package creation."
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center border border-green-200 rounded-full px-4 py-2 w-72 bg-gray-50">
          <input
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>

        <PrimaryButton onClick={() => router.push("/packages/new")}>
          + Add Package
        </PrimaryButton>
      </div>

      <MessageBanner tone="danger" message={error} />

      <Panel title="Packages">
        {loading ? (
          <LoadingState label="Loading..." />
        ) : (
          <>
            <DataTable
              columns={[
                { key: "name", label: "Name" },
                { key: "pricing_type", label: "Pricing" },
                { key: "base_price", label: "Base price" },
                { key: "minimum_guest_count", label: "Min guests" },
                {
                  key: "actions",
                  label: "Actions",
                  render: (pkg) => (
                    <button
                      type="button"
                      onClick={() => router.push(`/packages/${pkg.id}/edit`)}
                      className="inline-flex items-center justify-center rounded-full border border-green-300 p-2 text-green-700 transition hover:bg-green-50"
                      aria-label={`Edit ${pkg.name || "package"}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  ),
                },
              ]}
              rows={paginatedPackages}
              emptyTitle="No packages yet"
              emptyDescription="Create your first package"
            />

            {totalPages > 1 && (
              <div className="mt-5 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} –
                  {Math.min(currentPage * itemsPerPage, dataToUse.length)} of {dataToUse.length}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-1.5 text-sm rounded-full border border-green-200 bg-white hover:bg-green-50 hover:border-green-400 text-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    ← Prev
                  </button>

                  <div className="flex items-center gap-1 bg-green-50 p-1 rounded-full">
                    {Array.from({ length: totalPages }, (_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-3 py-1 text-sm rounded-full transition ${
                          currentPage === index + 1
                            ? "bg-green-600 text-white shadow-sm"
                            : "text-green-700 hover:bg-white"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-1.5 text-sm rounded-full border border-green-200 bg-white hover:bg-green-50 hover:border-green-400 text-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Panel>
    </div>
  );
}
