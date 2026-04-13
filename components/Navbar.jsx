"use client";

import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/services/auth";

const labels = {
  dashboard: "Dashboard",
  categories: "Categories",
  products: "Products",
  packages: "Packages",
  clients: "Clients",
  events: "Events",
  quotations: "Quotations",
  "quotation-versions": "Quotation Versions",
  login: "Login",
};

export default function TopNavbar({ onMenuClick = () => {} }) {
  const pathname = usePathname();
  const router = useRouter();
  const segment = pathname.split("/")[1] || "dashboard";
  const admin = auth.getAdmin();

  const logout = () => {
    auth.clearSession();
    router.replace("/login");
  };

  return (
    <header className="  sticky top-0 z-20 px-4 py-4 md:px-10 bg-[#f3f4f1]">
      <div className="grid gap-4 md:grid-cols-[auto_1fr_auto] md:items-center">
        <button
          type="button"
          onClick={onMenuClick}
          className="editorial-button-secondary px-4 py-3 text-left text-sm uppercase tracking-[0.12rem] md:hidden"
        >
          Menu
        </button>

        <div className="space-y-1">
           <h2 className="display-font text-2xl text-[#2f3331]">{labels[segment] || "Admin"}</h2>
        </div>

        <div className="flex items-center gap-3 md:justify-end">
          <div className="hidden text-right md:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14rem] text-[#5d5e61]">Signed In</p>
            <p className="text-sm text-[#2f3331]">{admin?.name || admin?.email || "Administrator"}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="editorial-button-secondary px-4 py-3 text-sm uppercase tracking-[0.12rem]"
          >
            Exit
          </button>
        </div>
      </div>
    </header>
  );
}
