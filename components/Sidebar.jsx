"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  CalendarDays,
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
    ],
  },
];

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
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
        className={`editorial-muted fixed left-0 top-0 z-40 flex h-screen w-[280px] border-r border-[#e1e0df] flex-col  py-6 transition-transform duration-200 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-2 border-b border-[#e1e0df] px-6 pb-3.5">
           <h1 className="display-font text-3xl leading-none text-[#2f3331] px-2">CityView</h1>
         </div>

        <nav className="mt-8 flex-1 space-y-10 px-6">
          {navigation.map((group) => (
            <div key={group.heading} className="space-y-4">
               <div className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.path || pathname.startsWith(`${item.path}/`);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-[0.12rem] transition ${
                        active
                          ? "bg-[#ffffff] text-[#2f3331]"
                          : "text-[#5f6662] hover:bg-[#ffffff]/70 hover:text-[#2f3331]"
                      }`}
                    >
                      <Icon size={18} strokeWidth={1.8} />
                      <span>{item.label}</span>
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
            className="flex w-full cursor-pointer items-center gap-3 bg-[#2f3331] px-6 py-3 text-left text-sm uppercase tracking-[0.12rem] text-[#faf9f7]    "
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
