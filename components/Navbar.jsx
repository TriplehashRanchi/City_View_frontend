"use client";

import { Menu, Search, Bell, Settings, ChevronRight, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/services/auth";

const labels = {
  dashboard: "Dashboard",
  clients: "Clients",
  products: "Products",
  services: "Services",
  events: "Events",
  quotations: "Quotations",
};

export default function TopNavbar({ onMenuClick = () => {} }) {
  const pathname = usePathname();
  const router = useRouter();
  const segment = pathname.split("/")[1] || "dashboard";
  const sectionLabel = labels[segment] || "Admin";
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const onLogout = () => {
    auth.clearSession();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-10 border-b border-white/70 bg-white/75 backdrop-blur-xl">
      <div className="flex h-20 items-center gap-4 px-4 md:px-8">
        <button
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:border-cyan-300 hover:text-cyan-700 md:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        <div className="hidden min-w-[220px] md:block">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            Admin
            <ChevronRight size={14} />
            <span className="text-slate-700">{sectionLabel}</span>
          </div>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">{sectionLabel} Overview</h2>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3 md:gap-4">
          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-500 shadow-sm md:flex md:w-80">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search clients, events, quotations"
              className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <p className="hidden text-xs font-medium text-slate-500 lg:block">{dateLabel}</p>

          <button className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:border-cyan-300 hover:text-cyan-700">
            <Bell size={17} />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
          </button>

          <button className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:border-cyan-300 hover:text-cyan-700">
            <Settings size={17} />
          </button>

          <button
            onClick={onLogout}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:border-red-300 hover:text-red-600"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut size={17} />
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 text-sm font-semibold text-white">
              AK
            </div>
            <div className="hidden pr-1 md:block">
              <p className="text-xs font-semibold text-slate-900">Admin</p>
              <p className="text-[11px] text-slate-500">Control Center</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
