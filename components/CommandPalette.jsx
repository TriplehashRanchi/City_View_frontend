"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Command,
  FileBadge,
  HandPlatter,
  Package,
  Search,
  Users2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/AdminUI";
import { useToast } from "@/components/ToastProvider";
import { searchApi } from "@/services/modules";

const entityConfig = {
  client: { label: "Client", icon: Users2 },
  event: { label: "Event", icon: CalendarDays },
  product: { label: "Product", icon: UtensilsCrossed },
  service: { label: "Service", icon: HandPlatter },
  package: { label: "Package", icon: Package },
  quotation: { label: "Quotation", icon: FileBadge },
};

const getResultHref = (result) => {
  const query = encodeURIComponent(result.title || "");

  if (result.type === "quotation") {
    return `/quotations/new?eventId=${result.eventId}&quotationId=${result.entityId}`;
  }

  const map = {
    client: "/clients",
    event: "/events",
    product: "/products",
    service: "/services",
    package: "/packages",
  };

  return `${map[result.type] || "/dashboard"}?search=${query}`;
};

function ResultRow({ result, onSelect }) {
  const config = entityConfig[result.type] || entityConfig.client;
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(result)}
      className="flex w-full items-start gap-3 rounded-2xl border border-transparent px-3 py-3 text-left transition hover:border-green-100 hover:bg-green-50/60"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-gray-800">{result.title}</p>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
            {config.label}
          </span>
        </div>
        {result.subtitle ? <p className="mt-1 truncate text-xs text-gray-500">{result.subtitle}</p> : null}
      </div>
    </button>
  );
}

export default function CommandPalette({ open, onClose }) {
  const router = useRouter();
  const { toast } = useToast();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!open) return undefined;

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 40);

    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(timeout);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setLoading(false);
      return;
    }

    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setLoading(true);
        const response = await searchApi.global(query.trim(), 5);
        setResults(response.data?.results || []);
      } catch (error) {
        toast({
          variant: "error",
          title: "Search failed",
          description: error?.response?.data?.message || "Unable to search right now.",
        });
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [open, query, toast]);

  const groupedResults = useMemo(() => {
    return results.reduce((accumulator, item) => {
      if (!accumulator[item.type]) {
        accumulator[item.type] = [];
      }
      accumulator[item.type].push(item);
      return accumulator;
    }, {});
  }, [results]);

  const onSelect = (result) => {
    onClose();
    router.push(getResultHref(result));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000]">
      <div className="absolute inset-0 bg-black/35 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute left-1/2 top-[12vh] w-[min(760px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-[2rem] border border-green-100 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.18)]">
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
          <Search size={18} className="text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search clients, events, products, services, packages, quotations..."
            className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
          />
          <div className="hidden items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 md:flex">
            <Command size={12} />
            K
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-50 hover:text-gray-700"
            aria-label="Close search"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-4">
          {!query.trim() ? (
            <div className="rounded-2xl border border-dashed border-green-200 bg-green-50/40 px-5 py-10 text-center">
              <p className="text-sm font-semibold text-gray-700">Start typing to search everything</p>
              <p className="mt-2 text-sm text-gray-500">
                Use <span className="font-semibold text-gray-700">Cmd + K</span> on Mac or <span className="font-semibold text-gray-700">Ctrl + K</span> on Windows.
              </p>
            </div>
          ) : loading ? (
            <LoadingState label="Searching..." className="py-10" />
          ) : results.length ? (
            <div className="space-y-5">
              {Object.entries(groupedResults).map(([type, items]) => (
                <div key={type}>
                  <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.24em] text-gray-400">
                    {entityConfig[type]?.label || type}
                  </p>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <ResultRow key={item.id} result={item} onSelect={onSelect} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-5 py-10 text-center">
              <p className="text-sm font-semibold text-gray-700">No matches found</p>
              <p className="mt-2 text-sm text-gray-500">Try a client name, quotation code, venue, service, or package name.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
