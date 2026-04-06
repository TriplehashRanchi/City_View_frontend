"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
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
  ArrowLeftToLine,
  ArrowRightToLine,
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

export default function Sidebar({
  isOpen = false,
  isCollapsed = false,
  onClose = () => {},
  onToggleCollapse = () => {},
}) {
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
        className={`fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-green-100 bg-white text-gray-700 transition-all duration-300 ease-in-out md:z-20 md:translate-x-0 ${
          isCollapsed ? "md:w-24" : "md:w-72"
        } ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className={`relative flex h-24 items-center justify-between ${isCollapsed ? "px-4" : "px-8"}`}>
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
            <div className="flex h-10 w-10 items-center justify-center border border-green-100 rounded-xl bg-gradient-to-br from-green-50 via-green-100/50 to-green-100  p-[1px]">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-white">
                <Boxes size={20} className="text-green-500" />
              </div>
            </div>
            <div className={`${isCollapsed ? "hidden" : "block"}`}>
              <h1 className="text-lg font-bold tracking-tight text-gray-800">
                City<span className="text-green-500">View</span>
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
                <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400">
                  Grand Ballroom
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden rounded-xl  p-2 text-gray-500 transition cursor-pointer hover:text-green-600 md:flex"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ArrowRightToLine size={18} /> : <ArrowLeftToLine size={18} />}
            </button>
            <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100 md:hidden">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className={`flex-1 overflow-y-auto py-4 custom-scrollbar ${isCollapsed ? "px-3" : "px-4"}`}>
          {navigation.map((group, idx) => (
            <div key={idx} className="mb-8">
              {!isCollapsed ? (
                <h2 className="mb-3 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                  {group.group}
                </h2>
              ) : null}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={onClose}
                      title={item.name}
                      className={`group relative flex items-center rounded-xl text-sm font-medium transition-all duration-300 ${
                        isCollapsed ? "justify-center px-3 py-3.5" : "gap-3 px-4 py-3"
                      } ${
                        active
                          ? "bg-gradient-to-r from-green-100 to-transparent text-green-500"
                          : "hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      {/* Active Indicator Bar */}
                      {active && (
                        <div className="absolute left-0 h-5 w-1 rounded-r-full bg-green-500 shadow-[0_0_8px_rgba(245,119,153,0.4)]" />
                      )}

                      <Icon
                        size={18}
                        className={`transition-colors ${
                          active
                            ? "text-green-500"
                            : "group-hover:text-gray-700"
                        }`}
                      />
                      {!isCollapsed ? <span className="flex-1">{item.name}</span> : null}
                      {active && !isCollapsed ? <ChevronRight size={14} className="opacity-50" /> : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Profile / Footer */}
        <div className="border-t border-[#FDC3A1]/30 p-4">
          <div
            className={`rounded-xl border border-[#FDC3A1]/30 bg-gray-50 p-3 ${
              isCollapsed ? "flex flex-col items-center gap-3" : "flex items-center gap-3"
            }`}
          >
            <div className="relative grid h-9 w-9 place-items-center rounded-lg bg-[#F57799] font-semibold text-white">
              A
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"></div>
            </div>
            {!isCollapsed ? (
              <div className="flex flex-1 flex-col overflow-hidden">
                <p className="truncate text-xs font-bold text-gray-800">Admin Session</p>
                <p className="truncate text-[10px] text-gray-500">Secure event operations</p>
              </div>
            ) : null}
            <button
              onClick={onLogout}
              className="text-gray-400 transition-colors hover:text-red-500"
              title="Sign out"
              aria-label="Sign out"
            >
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
