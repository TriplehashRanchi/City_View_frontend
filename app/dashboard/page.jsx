"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoadingState, PageIntro, Panel } from "@/components/AdminUI";
import { categoriesApi } from "@/services/categories";
import { clientsApi } from "@/services/clients";
import { eventsApi } from "@/services/events";
import { packagesApi } from "@/services/packages";
import { productsApi } from "@/services/products";
import { quotationsApi } from "@/services/quotations";
import {
  formatCurrency,
  formatDate,
  titleize,
  unwrapListResponse,
} from "@/services/normalizers";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  LayoutGrid,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";

const statusStyles = {
  enquiry: "bg-[#eee7d7] text-[#6f5d33]",
  quotation_created: "bg-[#e5edf4] text-[#35546b]",
  confirmed: "bg-[#e4ece6] text-[#34523f]",
  cancelled: "bg-[#f6e8e5] text-[#8b3733]",
};

const statCards = [
  {
    key: "categories",
    label: "Categories",
    icon: LayoutGrid,
    accent: "bg-[#efe4ca] text-[#7b6540]",
  },
  {
    key: "products",
    label: "Products",
    icon: ShoppingBag,
    accent: "bg-[#ece9e2] text-[#5d5e61]",
  },
  {
    key: "packages",
    label: "Packages",
    icon: Package,
    accent: "bg-[#f2ece0] text-[#7b6540]",
  },
  {
    key: "clients",
    label: "Clients",
    icon: Users,
    accent: "bg-[#ece9e2] text-[#5d5e61]",
  },
  {
    key: "events",
    label: "Events",
    icon: CalendarDays,
    accent: "bg-[#f1ead9] text-[#7b6540]",
  },
  {
    key: "quotations",
    label: "Quotations",
    icon: FileText,
    accent: "bg-[#e5edf4] text-[#35546b]",
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    packages: 0,
    clients: 0,
    events: 0,
    quotations: 0,
    pendingRevenue: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [
        categoriesResponse,
        productsResponse,
        packagesResponse,
        clientsResponse,
        eventsResponse,
      ] = await Promise.all([
        categoriesApi.list().catch(() => []),
        productsApi.list().catch(() => []),
        packagesApi.list().catch(() => []),
        clientsApi.list().catch(() => []),
        eventsApi.list().catch(() => []),
      ]);

      const events = unwrapListResponse(eventsResponse);
      let quotationCount = 0;
      let pendingRevenue = 0;

      await Promise.all(
        events.slice(0, 20).map(async (event) => {
          try {
            const quotations = unwrapListResponse(
              await quotationsApi.listQuotationsByEvent(event.id),
            );
            quotationCount += quotations.length;
            if (quotations[0]?.final_amount) {
              pendingRevenue += Number(quotations[0].final_amount);
            }
          } catch {}
        }),
      );

      setStats({
        categories: unwrapListResponse(categoriesResponse).length,
        products: unwrapListResponse(productsResponse).length,
        packages: unwrapListResponse(packagesResponse).length,
        clients: unwrapListResponse(clientsResponse).length,
        events: events.length,
        quotations: quotationCount,
        pendingRevenue,
      });
      setUpcomingEvents(events.slice(0, 6));
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageIntro
        eyebrow=""
        title="Operational Overview"
        description="A clearer snapshot of your catalog, client activity, and current event pipeline across the new core model."
      />

      {loading ? (
        <LoadingState label="Loading dashboard..." className="py-16" />
      ) : null}

      {!loading ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {statCards.map((card) => {
              const Icon = card.icon;
              const value = stats[card.key];

              return (
                <article key={card.key} className="editorial-panel p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#7b6540]">
                        {card.label}
                      </p>
                      <p className="display-font mt-3 text-4xl leading-none text-[#2f3331]">
                        {value}
                      </p>
                    </div>
                    <div className={`rounded-full p-3 ${card.accent}`}>
                      <Icon size={20} />
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <Panel
            title="Upcoming Events"
            subtitle="Recent event records from the events domain, with quick visibility into client, venue, and current status."
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {upcomingEvents.length ? (
                upcomingEvents.map((event) => {
                  const tone =
                    statusStyles[(event.event_status || "").toLowerCase()] ||
                    "bg-[#ece9e2] text-[#5d5e61]";

                  return (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="group rounded-md border border-[#cdb78c]  bg-[#fbfaf7] p-5    "
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-semibold text-[#2f3331]">
                              {event.client_name || event.client?.name || "-"}
                            </p>
                            <p className="mt-1 text-sm uppercase tracking-[0.12rem] text-[#7b6540]">
                              {event.occasion_type || "-"}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-sm px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14rem] ${tone}`}
                          >
                            {titleize(event.event_status || "-")}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm text-[#5f6662]">
                          <div className="flex items-center gap-2">
                            <CalendarDays
                              size={15}
                              className="text-[#7b6540]"
                            />
                            <span>{formatDate(event.event_date)}</span>
                          </div>
                          <p className="line-clamp-2">{event.venue || "-"}</p>
                        </div>

                        <div className="flex items-center justify-between border-t border-[var(--outline-ghost)] pt-4">
                          <span className="text-sm font-medium text-[#2f3331]">
                            Open event
                          </span>
                          <ArrowUpRight
                            size={16}
                            className="text-[#7b6540] transition group-hover:translate-x-0.5"
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="editorial-muted px-4 py-10 text-center text-sm text-[#5f6662] md:col-span-2 xl:col-span-3">
                  No events available yet.
                </div>
              )}
            </div>
          </Panel>
        </>
      ) : null}
    </div>
  );
}
