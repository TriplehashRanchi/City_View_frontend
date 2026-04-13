"use client";

import { useEffect, useState } from "react";
import { PageIntro, Panel, StatCard } from "@/components/AdminUI";
import { categoriesApi } from "@/services/categories";
import { clientsApi } from "@/services/clients";
import { eventsApi } from "@/services/events";
import { packagesApi } from "@/services/packages";
import { productsApi } from "@/services/products";
import { quotationsApi } from "@/services/quotations";
import { formatCurrency, unwrapListResponse } from "@/services/normalizers";

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

  useEffect(() => {
    const load = async () => {
      const [categoriesResponse, productsResponse, packagesResponse, clientsResponse, eventsResponse] = await Promise.all([
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
            const quotations = unwrapListResponse(await quotationsApi.listQuotationsByEvent(event.id));
            quotationCount += quotations.length;
            if (quotations[0]?.final_amount) pendingRevenue += Number(quotations[0].final_amount);
          } catch {}
        })
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
    };

    load();
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageIntro
        eyebrow="Dashboard"
        title="Operational Overview"
        description="The dashboard is thin by design. It shows counts from the new core model and a short view of active event work."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Categories" value={stats.categories} />
        <StatCard label="Products" value={stats.products} />
        <StatCard label="Packages" value={stats.packages} />
        <StatCard label="Clients" value={stats.clients} />
        <StatCard label="Events" value={stats.events} />
        <StatCard label="Quotations" value={stats.quotations} hint={formatCurrency(stats.pendingRevenue)} />
      </div>

      <Panel title="Upcoming Events" subtitle="Recent event records from the new events domain.">
        <div className="grid gap-3">
          {upcomingEvents.length ? (
            upcomingEvents.map((event) => (
              <div key={event.id} className="editorial-muted grid gap-2 p-4 md:grid-cols-[1.2fr_1fr_1fr_120px] md:items-center">
                <div>
                  <p className="font-semibold text-[#2f3331]">{event.client_name || event.client?.name || "-"}</p>
                  <p className="text-sm text-[#5f6662]">{event.occasion_type || "-"}</p>
                </div>
                <p className="text-sm text-[#2f3331]">{event.event_date || "-"}</p>
                <p className="text-sm text-[#2f3331]">{event.venue || "-"}</p>
                <p className="text-sm uppercase tracking-[0.12rem] text-[#7b6540]">{event.event_status || "-"}</p>
              </div>
            ))
          ) : (
            <div className="editorial-muted px-4 py-10 text-center text-sm text-[#5f6662]">No events available yet.</div>
          )}
        </div>
      </Panel>
    </div>
  );
}
