"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  CalendarDays,
  ChevronsLeft,
  ChevronsRight,
  HandCoins,
  FileText,
  LayoutDashboard,
  LogOut,
  Package2,
  Tags,
  Users,
} from "lucide-react";
import { auth } from "@/services/auth";

const navigation = [
  {
    heading: "Control",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { label: "Categories", path: "/categories", icon: Tags },
      { label: "Products", path: "/products", icon: Box },
      { label: "Packages", path: "/packages", icon: Package2 },
      { label: "Clients", path: "/clients", icon: Users },
      { label: "Events", path: "/events", icon: CalendarDays },
      { label: "Quotations", path: "/quotations", icon: FileText },
      { label: "Expenses", path: "/expenses", icon: HandCoins },
    ],
  },
];

export default function Sidebar({
  isOpen = false,
  onClose = () => {},
  isCollapsed = false,
  onToggleCollapse = () => {},
}) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    auth.clearSession();
    router.replace("/login");
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/20 transition md:hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />

      <aside
        className={`editorial-muted fixed left-0 top-0 z-40 flex h-screen border-r border-[#e1e0df] pb-6 flex-col overflow-hidden transition-[width,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:translate-x-0 ${
          isCollapsed ? "w-[80px]" : "w-[280px]"
        } ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div
          className={`border-b border-[#e1e0df] transition-[padding,height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isCollapsed ? "  px-3 py-4" : "px-4 py-4"
          }`}
        >
          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            <div
              className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isCollapsed ? "w-0 opacity-0" : "w-[170px] opacity-100"
              }`}
            >
              <h1 className="display-font px-2 text-[2rem] leading-none text-[#2f3331]">
                {isCollapsed ? "" : "CityView"}
              </h1>
            </div>
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-sm text-[#5d5e61] transition-all duration-300 hover:bg-[#ece9e2] md:inline-flex"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronsRight size={20} />
              ) : (
                <ChevronsLeft size={20} />
              )}
            </button>
          </div>
        </div>

        <nav
          className={`mt-4 flex-1 space-y-10 transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isCollapsed ? "px-3" : "px-4"
          }`}
        >
          {navigation.map((group) => (
            <div key={group.heading} className="space-y-4">
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active =
                    pathname === item.path ||
                    pathname.startsWith(`${item.path}/`);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={onClose}
                      title={isCollapsed ? item.label : undefined}
                      className={`flex items-center rounded-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isCollapsed
                          ? "justify-center px-0 py-3"
                          : "gap-3 px-4 py-2 text-lg"
                      } ${
                        active
                          ? "bg-[#ffffff] text-[#2f3331]"
                          : "text-[#5f6662] hover:bg-[#ffffff]/70 hover:text-[#2f3331]"
                      }`}
                    >
                      <Icon size={18} strokeWidth={1.8} className="shrink-0" />
                      <span
                        className={`overflow-hidden whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          isCollapsed
                            ? "w-0 -translate-x-2 opacity-0"
                            : "w-auto translate-x-0 opacity-100"
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-3 ">
          <button
            type="button"
            onClick={logout}
            title={isCollapsed ? "Log Out" : undefined}
            className={`flex w-full cursor-pointer items-center bg-[#ECE9E2] px-8 py-3 text-left text-sm uppercase text-[#404040] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#d9d6ca] ${
              isCollapsed ? "justify-center gap-0 px-3" : "gap-3"
            }`}
          >
            <LogOut size={18} strokeWidth={2.5} />
            <span
              className={`overflow-hidden whitespace-nowrap font-semibold transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isCollapsed
                  ? "w-0 -translate-x-2 opacity-0"
                  : "w-auto translate-x-0 opacity-100"
              }`}
            >
              Log Out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
