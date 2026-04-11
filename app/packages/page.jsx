"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Search,
} from "lucide-react";
import {
  LoadingState,
  MessageBanner,
  PageIntro,
  Panel,
  PrimaryButton,
} from "@/components/AdminUI";
import { catalogApi } from "@/services/modules";

function formatLabel(value) {
  if (!value) return "Not set";
  return String(value)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCurrency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getStatusClass(status) {
  return status === "active"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-slate-200 bg-slate-100 text-slate-600";
}

export default function PackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredPackages = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return packages;

    return packages.filter((pkg) => {
      return (
        pkg.name?.toLowerCase().includes(term) ||
        pkg.description?.toLowerCase().includes(term) ||
        pkg.pricing_type?.toLowerCase().includes(term) ||
        pkg.status?.toLowerCase().includes(term) ||
        String(pkg.base_price || "").includes(term)
      );
    });
  }, [packages, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredPackages.length / itemsPerPage));
  const paginatedPackages = filteredPackages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageIntro
        eyebrow="Packages"
        title="Package builder"
        action={
          <PrimaryButton onClick={() => router.push("/packages/new")} className="rounded-xl px-5 py-3 shadow-sm">
            Add Package
          </PrimaryButton>
        }
      />

      <MessageBanner tone="danger" message={error} />

      <div className="grid gap-6">
        <Panel
        >
          <div className="space-y-6">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search package, per plate cost or status"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-11 py-3 text-sm text-slate-700 outline-none transition focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100"
                />
              </div>
              <PrimaryButton onClick={() => router.push("/packages/new")} className="rounded-xl px-5 py-3 lg:hidden">
                Add Package
              </PrimaryButton>
            </div>

            {loading ? (
              <LoadingState label="Loading packages..." />
            ) : filteredPackages.length ? (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-left">
                    <thead className="bg-slate-50">
                      <tr className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        <th className="px-5 py-4 font-semibold">Package</th>
                        <th className="px-5 py-4 font-semibold">Per plate</th>
                        <th className="px-5 py-4 font-semibold">Status</th>
                        <th className="px-5 py-4 text-right font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {paginatedPackages.map((pkg) => (
                        <tr key={pkg.id} className="border-t border-slate-100 align-top">
                          <td className="px-5 py-4">
                            <div className="space-y-1.5">
                              <p className="text-base font-semibold text-slate-900">{pkg.name}</p>
                              {/* <p className="text-sm text-slate-500">
                                {pkg.description || "Reusable package setup for quotations and booking flow."}
                              </p> */}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-slate-900">
                              {formatCurrency(pkg.base_price)}
                            </p>
                            {/* <p className="mt-1 text-sm text-slate-500">
                              Estimated package cost per plate
                            </p> */}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-xl border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusClass(pkg.status)}`}
                            >
                              {formatLabel(pkg.status)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => router.push(`/packages/${pkg.id}/edit`)}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-green-300 hover:bg-green-50 hover:text-green-800"
                              aria-label={`Edit ${pkg.name || "package"}`}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
                <p className="font-semibold text-slate-900">No packages found</p>
                <p className="mt-2 text-sm text-slate-500">
                  Try a different search term or create a new package from the builder.
                </p>
              </div>
            )}

            {filteredPackages.length > 0 && (
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-sm text-slate-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredPackages.length)} of {filteredPackages.length}
                </p>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                      disabled={currentPage === 1}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prev
                    </button>

                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5">
                      {Array.from({ length: totalPages }, (_, index) => {
                        const pageNumber = index + 1;
                        const active = pageNumber === currentPage;

                        return (
                          <button
                            key={pageNumber}
                            type="button"
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`min-w-10 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                              active
                                ? "bg-slate-900 text-white shadow-sm"
                                : "text-slate-600 hover:bg-white"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
