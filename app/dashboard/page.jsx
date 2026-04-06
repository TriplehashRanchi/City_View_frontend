"use client";

import { useEffect, useState } from "react";
import { PageIntro, Panel, StatCard, MessageBanner, DataTable, LoadingState } from "@/components/AdminUI";
import { reportsApi } from "@/services/modules";
import { auth } from "@/services/auth";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function DashboardPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await reportsApi.dashboard();
        setReport(data.data);
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load dashboard report.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const admin = auth.getAdmin();
  const metrics = report?.metrics || {};
  const statusBreakdown = report?.statusBreakdown || [];
  const upcomingEvents = report?.upcomingEvents || [];
  //Greetings Time
  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 21) return "Good Evening";
    return "Good Night";
  };

  return (

    <div className="mx-auto max-w-7xl space-y-6">
      <PageIntro
        eyebrow="Control Center"
        title={`${getGreeting()}${admin?.name ? `, ${admin.name}` : ""}`}
        description="This dashboard reads from the live reporting endpoint and shows event volume, quotation movement, accepted revenue, and upcoming operations."
      />

      <MessageBanner tone="danger" message={error} />

      {loading ? (
        <Panel title="Loading dashboard" subtitle="Fetching metrics from /reports/dashboard">
          <LoadingState label="Loading dashboard..." className="py-6" />
        </Panel>
      ) : null}

      {!loading ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Events" value={metrics.total_events ?? 0} hint="All events in the system" />
            <StatCard label="Quotations" value={metrics.total_quotations ?? 0} hint="Initialized quotation records" />
            <StatCard label="Accepted" value={metrics.accepted_quotations ?? 0} hint="Accepted quotation versions" />
            <StatCard
              label="Accepted Revenue"
              value={money.format(Number(metrics.accepted_revenue || 0))}
              hint={`${metrics.confirmed_bookings ?? 0} confirmed bookings`}
            />
          </div>

          <div className="space-y-6">
            <Panel
              title="Quotations status "
              subtitle="Grouped by quotation version status."
            >
              <div className="space-y-3">
                {statusBreakdown.length ? (
                  statusBreakdown.map((item) => (
                    <div
                      key={item.status}
                      className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50  px-4 py-3"
                    >
                      <div >
                        <p className="text-lg font-semibold capitalize text-gray-800">
                          {item.status}
                        </p>
                        <p className="text-[15px] text-gray-500">
                          Quotation versions
                        </p>
                      </div>

                      <div className="rounded-full border border-green-600 px-3 py-1 text-sm font-semibold text-green-600">
                        {item.total}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No quotation versions found yet.
                  </p>
                )}
              </div>
            </Panel>
          </div>


          <Panel title="Upcoming events" subtitle="Next ten events from the reporting endpoint.">
            <DataTable
              columns={[
                { key: "client_name", label: "Client" },
                { key: "occasion_type", label: "Occasion" },
                { key: "event_date", label: "Event Date" },
                { key: "start_time", label: "Start" },
                { key: "venue", label: "Venue" },
                {
                  key: "event_status",
                  label: "Status",
                  render: (row) => (
                    <span className="capitalize text-gray-800">{row.event_status}</span>
                  ),
                },
              ]}
              rows={upcomingEvents}
              emptyTitle="No upcoming events"
              emptyDescription="Create an event to see it appear here."
            />
          </Panel>
        </>
      ) : null}
    </div>
  );
}
