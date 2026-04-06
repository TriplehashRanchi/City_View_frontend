"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/Navbar";
import { auth } from "@/services/auth";

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isPublicRoute = pathname === "/" || pathname === "/login";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedState = window.localStorage.getItem("cityview.sidebarCollapsed");
    setSidebarCollapsed(savedState === "true");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("cityview.sidebarCollapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    let active = true;

    const check = async () => {
      const token = auth.getToken();

      if (isPublicRoute) {
        if (!token) {
          if (!active) return;
          setIsAuthenticated(false);
          setCheckingAuth(false);
          return;
        }

        try {
          const session = await auth.me();
          if (!active) return;
          if (session?.admin) auth.saveAdmin(session.admin);
          setIsAuthenticated(true);
          setCheckingAuth(false);
          if (pathname === "/login") {
            router.replace("/dashboard");
          }
        } catch {
          auth.clearSession();
          if (!active) return;
          setIsAuthenticated(false);
          setCheckingAuth(false);
        }
        return;
      }

      if (!token) {
        if (!active) return;
        setIsAuthenticated(false);
        setCheckingAuth(false);
        router.replace("/login");
        return;
      }

      try {
        const session = await auth.me();
        if (!active) return;
        if (session?.admin) auth.saveAdmin(session.admin);
        setIsAuthenticated(true);
      } catch {
        auth.clearSession();
        if (!active) return;
        setIsAuthenticated(false);
        router.replace("/login");
      } finally {
        if (active) setCheckingAuth(false);
      }
    };

    check();

    return () => {
      active = false;
    };
  }, [isPublicRoute, pathname, router]);

  if (checkingAuth) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FFF7CD] p-6">
        <div className="rounded-2xl border border-[#FDC3A1]/50 bg-white/90 px-6 py-4 text-sm font-medium text-gray-600 shadow-lg">
          Verifying admin session...
        </div>
      </main>
    );
  }

  if (isPublicRoute) {
    return <main className="min-h-screen bg-[#FFF7CD]">{children}</main>;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Warm decorative blurs */}
      <div className="pointer-events-none absolute -top-48 right-[-120px] h-96 w-96 " />
      <div className="pointer-events-none absolute bottom-0 left-[-120px] h-80 w-80 " />

      <Sidebar
        isOpen={mobileMenuOpen}
        isCollapsed={sidebarCollapsed}
        onClose={() => setMobileMenuOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
      />

      <div className={`transition-[padding] duration-300 ${sidebarCollapsed ? "md:pl-24" : "md:pl-72"}`}>
        <TopNavbar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="relative z-10 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
