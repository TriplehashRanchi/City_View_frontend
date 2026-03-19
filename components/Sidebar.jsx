"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  FileText,
  LayoutDashboard,
  Package,
  Shield,
  Sparkles,
  Users,
  Utensils,
  X,
} from "lucide-react";

const menu = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Clients", icon: Users, path: "/clients" },
  { name: "Products", icon: Utensils, path: "/products" },
  { name: "Services", icon: Package, path: "/services" },
  { name: "Events", icon: Calendar, path: "/events" },
  { name: "Quotations", icon: FileText, path: "/quotations" },
];

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen w-72 flex-col border-r border-white/70 bg-white/90 shadow-2xl shadow-slate-900/10 backdrop-blur-xl transition-transform duration-300 md:z-20 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700">CityView</p>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Admin Portal</h1>
          </div>
          <button
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 md:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-600 hover:bg-cyan-50 hover:text-cyan-800"
                }`}
                onClick={onClose}
              >
                <span
                  className={`rounded-lg p-2 transition ${
                    active ? "bg-white/20" : "bg-slate-100 text-slate-500 group-hover:bg-white"
                  }`}
                >
                  <Icon size={17} />
                </span>
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="m-4 rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-900 p-4 text-white shadow-lg">
          <div className="mb-2 inline-flex rounded-lg bg-white/15 p-2">
            <Sparkles size={16} />
          </div>
          <p className="text-sm font-semibold">Operations Status</p>
          <p className="mt-1 text-xs text-cyan-100">All systems active. 99.9% uptime this week.</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-cyan-100">
            <Shield size={14} />
            Secure admin channel enabled
          </div>
        </div>
      </aside>
    </>
  );
}
