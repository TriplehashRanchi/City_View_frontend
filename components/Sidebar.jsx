"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Boxes,
  Users2,
  FileBadge,
  HandPlatter,
  LogOut,
  X,
  Sparkles,
  Package,
  UtensilsCrossed,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/services/auth";

const navigation = [
  {
    group: "Overview",
    items: [{ name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" }],
  },
  {
    group: "Catalog",
    items: [
      { name: "Products", icon: UtensilsCrossed, path: "/products" },
      { name: "Services", icon: HandPlatter, path: "/services" },
      { name: "Packages", icon: Package, path: "/packages" },
    ],
  },
  {
    group: "Operations",
    items: [
      { name: "Clients", icon: Users2, path: "/clients" },
      { name: "Events", icon: CalendarDays, path: "/events" },
      { name: "Quotations", icon: FileBadge, path: "/quotations" },
    ],
  },
];

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const pathname = usePathname();
  const router = useRouter();

  const onLogout = () => {
    auth.clearSession();
    router.replace("/login");
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-500 md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen w-72 flex-col border-r border-[#FDC3A1]/30 bg-white text-gray-700 transition-all duration-500 ease-in-out md:z-20 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="relative flex h-24 items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F57799] via-[#FB9B8F] to-[#FDC3A1] p-[1px]">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-white">
                <Boxes size={20} className="text-[#F57799]" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-gray-800">
                City<span className="text-[#F57799]">View</span>
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
                <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400">
                  Grand Ballroom
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
          {navigation.map((group, idx) => (
            <div key={idx} className="mb-8">
              <h2 className="mb-3 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
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
                          ? "bg-gradient-to-r from-[#FDC3A1]/20 to-transparent text-[#F57799]"
                          : "hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      {/* Active Indicator Bar */}
                      {active && (
                        <div className="absolute left-0 h-5 w-1 rounded-r-full bg-[#F57799] shadow-[0_0_8px_rgba(245,119,153,0.4)]" />
                      )}

                      <Icon
                        size={18}
                        className={`transition-colors ${
                          active
                            ? "text-[#F57799]"
                            : "group-hover:text-gray-700"
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
          <div className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFF7CD] to-[#FDC3A1]/20 p-5 border border-[#FDC3A1]/40">
            <div className="relative z-10">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#F57799]/20 text-[#F57799]">
                <Sparkles size={16} />
              </div>
              <p className="text-xs font-semibold text-gray-800">Workflow Map</p>
              <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
                Move from client creation to accepted quotation without leaving the admin workspace.
              </p>
              <div className="mt-4 rounded-lg border border-[#FDC3A1]/50 bg-white/50 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-gray-500">
                Clients &gt; Events &gt; Quotations
              </div>
            </div>
            {/* Decorative background glow */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#F57799]/20 blur-2xl" />
          </div>
        </div>

        {/* User Profile / Footer */}
        <div className="border-t border-[#FDC3A1]/30 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 border border-[#FDC3A1]/30">
            <div className="relative grid h-9 w-9 place-items-center rounded-lg bg-[#F57799] font-semibold text-white">
              A
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"></div>
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
              <p className="truncate text-xs font-bold text-gray-800">Admin Session</p>
              <p className="truncate text-[10px] text-gray-500">Secure event operations</p>
            </div>
            <button onClick={onLogout} className="text-gray-400 hover:text-red-500 transition-colors">
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
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 119, 153, 0.3);
        }
      `}</style>
    </>
  );
}