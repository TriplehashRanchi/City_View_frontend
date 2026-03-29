"use client";

import { useEffect, useState } from "react";
import { PageIntro, Panel, StatCard, MessageBanner, DataTable } from "@/components/AdminUI";
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
          <p className="text-sm text-gray-500">Please wait while the admin summary is being prepared.</p>
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

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Panel title="Quotation status mix" subtitle="Grouped by quotation version status.">
              <div className="space-y-3">
                {statusBreakdown.length ? (
                  statusBreakdown.map((item) => (
                    <div
                      key={item.status}
                      className="flex items-center justify-between rounded-2xl border border-[#FDC3A1]/30 bg-amber-100 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold capitalize text-gray-800">{item.status}</p>
                        <p className="text-xs text-gray-500">Quotation versions</p>
                      </div>
                      <div className="rounded-full bg-[#F57799]/10 px-3 py-1 text-sm font-semibold text-[#F57799]">
                        {item.total}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No quotation versions found yet.</p>
                )}
              </div>
            </Panel>

            <Panel title="Operational sequence" subtitle="Recommended backend-aligned workflow for the admin team.">
              <ol className="grid gap-3 text-sm text-gray-500 md:grid-cols-2">
                {[
                  "Register admin from Postman, then sign in on the portal.",
                  "Create clients before capturing event enquiries.",
                  "Build product and service catalogs.",
                  "Assemble reusable packages from those catalog items.",
                  "Create events for real client requirements.",
                  "Initialize quotations per event and create versions.",
                  "Accept a quotation version to convert it into revenue and reporting.",
                ].map((step, index) => (
                  <li
                    key={step}
                    className="rounded-[1.5rem] border border-[#FDC3A1]/30 bg-white px-4 py-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#F57799]">
                      Step {index + 1}
                    </p>
                    <p className="mt-2 text-gray-800">{step}</p>
                  </li>
                ))}
              </ol>
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