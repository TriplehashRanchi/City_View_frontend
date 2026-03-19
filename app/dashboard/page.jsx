import { ArrowUpRight, CalendarClock, FileCheck2, Handshake, Sparkles, Users } from "lucide-react";

const statCards = [
  {
    title: "Total Events",
    value: "45",
    change: "+12%",
    note: "vs last month",
    icon: CalendarClock,
  },
  {
    title: "Quotations",
    value: "120",
    change: "+18%",
    note: "high intent leads",
    icon: FileCheck2,
  },
  {
    title: "Accepted",
    value: "32",
    change: "+9%",
    note: "conversion quality",
    icon: Handshake,
  },
  {
    title: "Active Clients",
    value: "76",
    change: "+6%",
    note: "retained this quarter",
    icon: Users,
  },
];

const upcoming = [
  { title: "Royal Banquet Wedding", date: "Mar 12", status: "Confirmed" },
  { title: "Corporate Launch Event", date: "Mar 14", status: "Prep Ongoing" },
  { title: "Silver Jubilee Dinner", date: "Mar 19", status: "Awaiting Assets" },
];

export default function Dashboard() {
  return (
    <section className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-900 to-indigo-900 p-6 text-white shadow-xl md:p-8">
        <div className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-cyan-100">
          <Sparkles size={14} />
          Welcome back, Admin
        </p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">CityView Event Command Center</h1>
        <p className="mt-2 max-w-2xl text-sm text-cyan-100 md:text-base">
          Monitor revenue-critical activity, keep operations aligned, and move faster on high-value event deals.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.title}
              className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-lg shadow-slate-900/5 backdrop-blur"
            >
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <span className="rounded-lg bg-slate-100 p-2 text-slate-600">
                  <Icon size={16} />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{card.value}</p>
              <p className="mt-2 text-xs">
                <span className="font-semibold text-emerald-600">{card.change}</span>
                <span className="ml-1 text-slate-500">{card.note}</span>
              </p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Event Timeline</h2>
            <button className="inline-flex items-center gap-1 text-sm font-medium text-cyan-700 transition hover:text-cyan-800">
              Open calendar
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {upcoming.map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.date}</p>
                </div>
                <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-800">{item.status}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5">
          <h2 className="text-lg font-semibold text-slate-900">Focus Today</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="rounded-xl bg-slate-50 px-3 py-2">Follow up on 7 pending premium quotations.</li>
            <li className="rounded-xl bg-slate-50 px-3 py-2">Finalize product package pricing for Q2.</li>
            <li className="rounded-xl bg-slate-50 px-3 py-2">Assign venue checks for weekend events.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
