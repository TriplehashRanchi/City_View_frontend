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
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between px-4 md:px-8">
        
        {/* Left Side: Navigation Info */}
        <div className="flex items-center gap-4">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 transition-all hover:border-amber-500/50 hover:text-amber-500 md:hidden"
            onClick={onMenuClick}
          >
            <Menu size={20} />
          </button>

          <div className="hidden flex-col md:flex">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <span>Management</span>
              <ChevronRight size={12} className="text-zinc-700" />
              <span className="text-amber-500/80">{segment}</span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-white">
              {sectionLabel}
            </h2>
          </div>
        </div>

        {/* Center: Search Bar (Premium Glass) */}
        <div className="hidden max-w-md flex-1 px-8 lg:block">
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={16} className="text-zinc-500 transition-colors group-focus-within:text-amber-500" />
            </div>
            <input
              type="text"
              placeholder="Search clients, events, quotations..."
              className="w-full rounded-2xl border border-white/5 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/30 focus:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all"
            />
            <div className="absolute inset-y-0 right-3 flex items-center">
              <kbd className="hidden items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-sans text-[10px] font-medium text-zinc-500 md:flex">
                <Command size={10} />K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Status Indicator (Desktop Only) */}
          <div className="hidden items-center gap-4 border-r border-white/10 pr-4 lg:flex">
            <div className="text-right">
              <p className="text-[11px] font-medium text-zinc-400">{dateLabel}</p>
              {/* <div className="flex items-center justify-end gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <p className="text-[10px] font-bold uppercase tracking-tighter text-emerald-500/80">Live Server</p>
              </div> */}
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1.5">

            <button
              onClick={onLogout}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-zinc-400 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500"
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
