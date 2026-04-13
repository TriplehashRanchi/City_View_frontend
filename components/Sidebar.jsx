"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/services/auth";

const navigation = [
  {
    heading: "Control",
    items: [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Categories", path: "/categories" },
      { label: "Products", path: "/products" },
      { label: "Packages", path: "/packages" },
      { label: "Clients", path: "/clients" },
      { label: "Events", path: "/events" },
      { label: "Quotations", path: "/quotations" },
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
        className={`editorial-muted fixed left-0 top-0 z-40 flex h-screen w-[280px] flex-col px-6 py-8 transition-transform duration-200 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32rem] text-[#7b6540]">CityView</p>
          <h1 className="display-font text-3xl leading-none text-[#2f3331]">Admin Ledger</h1>
          <p className="text-sm leading-7 text-[#5f6662]">Products, packages, clients, events, and quotation versions.</p>
        </div>

        <nav className="mt-12 flex-1 space-y-10">
          {navigation.map((group) => (
            <div key={group.heading} className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22rem] text-[#5d5e61]">{group.heading}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.path || pathname.startsWith(`${item.path}/`);
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={onClose}
                      className={`block px-4 py-3 text-sm uppercase tracking-[0.12rem] transition ${
                        active
                          ? "bg-[#ffffff] text-[#2f3331]"
                          : "text-[#5f6662] hover:bg-[#ffffff]/70 hover:text-[#2f3331]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22rem] text-[#5d5e61]">Session</p>
          <button
            type="button"
            onClick={logout}
            className="w-full bg-[#2f3331] px-4 py-3 text-left text-sm uppercase tracking-[0.12rem] text-[#faf9f7] transition hover:opacity-92"
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
