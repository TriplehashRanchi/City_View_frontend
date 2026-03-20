"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  UtensilsCrossed,
  Users2,
  FileBadge,
  Settings,
  LogOut,
  X,
  Sparkles,
  Wine,
  ChefHat,
  ReceiptText,
  ChevronRight,
} from "lucide-react";

const navigation = [
  {
    group: "Core Operations",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { name: "Event Calendar", icon: CalendarDays, path: "/events" },
      { name: "Bookings", icon: ReceiptText, path: "/bookings" },
    ],
  },
  {
    group: "Hospitality",
    items: [
      { name: "Catering Menu", icon: ChefHat, path: "/products" },
      { name: "Wine & Bar", icon: Wine, path: "/bar" },
      { name: "Guest List", icon: Users2, path: "/clients" },
    ],
  },
  {
    group: "Administrative",
    items: [
      { name: "Quotations", icon: FileBadge, path: "/quotations" },
      { name: "Settings", icon: Settings, path: "/settings" },
    ],
  },
];

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-md transition-opacity duration-500 md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen w-72 flex-col border-r border-white/5 bg-[#0a0a0b] text-zinc-400 transition-all duration-500 ease-in-out md:z-20 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="relative flex h-24 items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-200 via-amber-500 to-amber-700 p-[1px]">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#0a0a0b]">
                <UtensilsCrossed size={20} className="text-amber-500" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                City<span className="text-amber-500">View</span>
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
                <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                  Grand Ballroom
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-white/5 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
          {navigation.map((group, idx) => (
            <div key={idx} className="mb-8">
              <h2 className="mb-3 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                {group.group}
              </h2>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={onClose}
                      className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                        active
                          ? "bg-gradient-to-r from-amber-500/10 to-transparent text-amber-500"
                          : "hover:bg-white/[0.03] hover:text-zinc-200"
                      }`}
                    >
                      {/* Active Indicator Bar */}
                      {active && (
                        <div className="absolute left-0 h-5 w-1 rounded-r-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                      )}

                      <Icon
                        size={18}
                        className={`transition-colors ${
                          active ? "text-amber-500" : "group-hover:text-zinc-200"
                        }`}
                      />
                      <span className="flex-1">{item.name}</span>
                      {active && <ChevronRight size={14} className="opacity-50" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Premium Feature Card */}
          <div className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 to-black p-5 border border-white/5">
            <div className="relative z-10">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-500">
                <Sparkles size={16} />
              </div>
              <p className="text-xs font-semibold text-zinc-200">Concierge AI</p>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                Generate custom floor plans and seating charts instantly.
              </p>
              <button className="mt-4 w-full rounded-lg bg-zinc-800 py-2 text-[11px] font-bold text-white transition hover:bg-zinc-700">
                Launch Assistant
              </button>
            </div>
            {/* Decorative background glow */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl" />
          </div>
        </div>

        {/* User Profile / Footer */}
        <div className="border-t border-white/5 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-3 border border-white/5">
            <div className="relative">
              <img
                src="https://ui-avatars.com/api/?name=Admin+User&background=f59e0b&color=fff"
                alt="Profile"
                className="h-9 w-9 rounded-lg object-cover"
              />
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0a0a0b] bg-emerald-500"></div>
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
              <p className="truncate text-xs font-bold text-zinc-200">Alexander Rossi</p>
              <p className="truncate text-[10px] text-zinc-500">Executive Manager</p>
            </div>
            <button className="text-zinc-600 hover:text-red-400 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Custom CSS for the scrollbar (optional) */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.2);
        }
      `}</style>
    </>
  );
}