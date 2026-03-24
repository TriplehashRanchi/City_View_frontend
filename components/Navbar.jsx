"use client";

import {
  Menu,
  Search,
  ChevronRight,
  LogOut,
  Command,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/services/auth";

const labels = {
  dashboard: "Executive Overview",
  clients: "Client Registry",
  products: "Product Catalog",
  services: "Service Catalog",
  packages: "Package Builder",
  events: "Event Operations",
  quotations: "Quotation Desk",
};

export default function TopNavbar({ onMenuClick = () => {} }) {
  const pathname = usePathname();
  const router = useRouter();
  const segment = pathname.split("/")[1] || "dashboard";
  const sectionLabel = labels[segment] || "Admin Console";

  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const onLogout = () => {
    auth.clearSession();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#FDC3A1]/30 bg-white backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between px-4 md:px-8">
        
        {/* Left Side: Navigation Info */}
        <div className="flex items-center gap-4">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#FDC3A1]/30 bg-white/50 text-gray-500 transition-all hover:border-[#F57799]/50 hover:text-[#F57799] md:hidden"
            onClick={onMenuClick}
          >
            <Menu size={20} />
          </button>

          <div className="hidden flex-col md:flex">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span>Management</span>
              <ChevronRight size={12} className="text-gray-300" />
              <span className="text-[#F57799]">{segment}</span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-gray-800">
              {sectionLabel}
            </h2>
          </div>
        </div>

        {/* Center: Search Bar (Light Glass) */}
        <div className="hidden max-w-md flex-1 px-8 lg:block">
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={16} className="text-gray-400 transition-colors group-focus-within:text-[#F57799]" />
            </div>
            <input
              type="text"
              placeholder="Search clients, events, quotations..."
              className="w-full rounded-2xl border border-[#FDC3A1]/50 bg-white/50 py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#F57799]/40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#F57799]/30 transition-all"
            />
            <div className="absolute inset-y-0 right-3 flex items-center">
              <kbd className="hidden items-center gap-1 rounded border border-[#FDC3A1]/30 bg-white/50 px-1.5 font-sans text-[10px] font-medium text-gray-500 md:flex">
                <Command size={10} />K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Status Indicator (Desktop Only) */}
          <div className="hidden items-center gap-4 border-r border-[#FDC3A1]/30 pr-4 lg:flex">
            <div className="text-right">
              <p className="text-[11px] font-medium text-gray-500">{dateLabel}</p>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onLogout}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#FDC3A1]/30 bg-white/50 text-gray-500 transition-all hover:border-red-400/50 hover:bg-red-50 hover:text-red-500"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}