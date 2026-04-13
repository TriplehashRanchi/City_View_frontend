"use client";

import Image from "next/image";
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

  const isPublicRoute = pathname === "/login";

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
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
          router.replace("/dashboard");
        } catch {
          auth.clearSession();
          if (!active) return;
          setIsAuthenticated(false);
        } finally {
          if (active) setCheckingAuth(false);
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

    checkSession();

    return () => {
      active = false;
    };
  }, [isPublicRoute, router]);

  if (checkingAuth) {
    return (
      <main className="grid min-h-screen place-items-center   px-6">
        <div className="  px-10 py-8">
          <Image
            src="/loading.png"
            alt="Verifying admin session"
            width={120}
            height={120}
            priority
            className="h-24 w-24 object-contain md:h-32 md:w-32"
          />
        </div>
      </main>
    );
  }

  if (isPublicRoute) {
    return <main className="min-h-screen bg-[#faf9f7]">{children}</main>;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
      />
      <div
        className={`transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          sidebarCollapsed ? "md:pl-[80px]" : "md:pl-[280px]"
        }`}
      >
        <TopNavbar
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        <main className="px-4 pb-10 pt-6 md:px-10">{children}</main>
      </div>
    </div>
  );
}
