"use client";

import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/services/auth";
import { LogOut } from "lucide-react";

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
    <header className="sticky top-0 z-20 border-b border-[#e1e0df] bg-[#f3f4f1] px-4 py-2.5 md:px-10">
      <div className="grid gap-4 md:grid-cols-[auto_1fr_auto] md:items-center">
        <button
          type="button"
          onClick={onMenuClick}
          className="editorial-button-secondary px-4 py-3 text-left text-sm uppercase tracking-[0.12rem] md:hidden"
        >
          Menu
        </button>
        <div></div>

        <div className="space-y-1  flex items-center justify-end gap-2 pr-5">
          <div className="bg-black rounded-full text-white font-bold p-2 w-10 h-10 flex justify-center items-center">
            SA
          </div>
          <div className="hidden text-start md:block">
            <p className="m-0 text-md text-[#2f3331] leading-tight">
              {admin?.email || "-"}
            </p>
            <p className="m-0 text-[12px] font-semibold text-[#5d5e61] leading-tight">
              {admin?.name || admin?.email || "Administrator"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
