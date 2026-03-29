"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { auth } from "@/services/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const validationError = useMemo(() => {
    if (!email.trim() || !password) return "Email and password are required.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Enter a valid email address.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    return "";
  }, [email, password]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (validationError) {
      setErr(validationError);
      return;
    }

    setLoading(true);
    try {
      const data = await auth.login({ email: email.trim().toLowerCase(), password });
      auth.saveSession({ token: data.token, admin: data.admin });
      router.replace("/dashboard");
    } catch (error) {
      setErr(error?.response?.data?.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative grid min-h-screen overflow-hidden bg-white p-4 md:p-8 lg:grid-cols-2 lg:gap-8">
      {/* Warm decorative blurs */}
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#FDC3A1]/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#FB9B8F]/30 blur-3xl" />

      {/* Left Panel - Warm Gradient */}
      <section className="relative hidden rounded-3xl border border-[#FDC3A1]/40 bg-[url('https://www.marriagecolours.com/wp-content/uploads/2025/04/Anisha-Vishal-Reception-MRC-9.jpg')] bg-center bg-cover p-10 text-gray-800 shadow-2xl lg:flex lg:flex-col lg:justify-between">
        <div className="border bg-linear-to-br from-amber-100 via-white to-white border-amber-100 p-5 rounded-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#F57799]/30 bg-white/90 px-3 py-1 text-xs font-semibold tracking-wide text-[#F57799]">
            <Sparkles size={14} />
            CITYVIEW ADMIN
          </p>
          <h1 className="mt-5 text-6xl font-bold leading-tighter text-zinc-800 text-shadow-2xs">Secure control for premium event operations</h1>
          <p className="mt-4 max-w-md text-sm text-zinc-800 text-shadow-2xs">
            Manage clients, quotations, event timelines, and operational workflows in one protected command center.
          </p>
        </div>

        <div className="space-y-3 text-sm text-gray-600">
          <p className="flex items-center gap-2">
            <ShieldCheck size={16} />
            Registration is disabled on the website.
          </p>
          <p className="text-gray-500">Create admin users from Postman using the secure setup key.</p>
        </div>
      </section>

      {/* Right Panel - Login Form */}
      <section className="relative grid place-items-center">
        <div className="w-full max-w-md rounded-3xl border border-[#FDC3A1]/40 bg-white/90 p-7 shadow-2xl shadow-gray-200/30 backdrop-blur md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F57799]">Admin Access</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-800">Sign in</h2>
          <p className="mt-2 text-sm text-gray-500">Use your admin credentials to enter the portal.</p>

          {err ? (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{err}</span>
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#FDC3A1]/40 bg-[#FFF7CD]/30 px-3 py-3 focus-within:border-[#F57799]/50 focus-within:bg-white">
                <Mail size={18} className="text-gray-400" />
                <input
                  type="email"
                  className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                  placeholder="admin@cityview.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#FDC3A1]/40 bg-[#FFF7CD]/30 px-3 py-3 focus-within:border-[#F57799]/50 focus-within:bg-white">
                <Lock size={18} className="text-gray-400" />
                <input
                  type={show ? "text" : "password"}
                  className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow((prev) => !prev)}
                  className="text-gray-400 transition hover:text-gray-600"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-linear-to-r from-[#F57799] to-[#FB9B8F] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#F57799]/30 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in to admin portal"}
            </button>
          </form>

          <p className="mt-4 text-xs text-gray-500">
            Admin onboarding: use <span className="font-semibold text-gray-700">POST /api/auth/register</span> from Postman with setup key.
          </p>
        </div>
      </section>
    </div>
  );
}