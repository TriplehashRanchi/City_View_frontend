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
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    const check = async () => {
      const token = auth.getToken();

      if (pathname === "/login") {
        if (!token) {
          if (!active) return;
          setIsAuthenticated(false);
          setCheckingAuth(false);
          return;
        }

        try {
          await auth.me();
          if (!active) return;
          setIsAuthenticated(true);
          setCheckingAuth(false);
          router.replace("/dashboard");
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
        await auth.me();
        if (!active) return;
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
  }, [pathname, router]);

  if (checkingAuth) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 p-6">
        <div className="rounded-2xl border border-white/70 bg-white/90 px-6 py-4 text-sm font-medium text-slate-600 shadow-lg">
          Verifying admin session...
        </div>
      </main>
    );
  }

  if (pathname === "/login") {
    return <main className="min-h-screen">{children}</main>;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100">
      <div className="pointer-events-none absolute -top-48 right-[-120px] h-96 w-96 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-[-120px] h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />

      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="md:pl-72">
        <TopNavbar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="relative z-10 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
