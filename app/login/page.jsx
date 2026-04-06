"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { auth } from "@/services/auth";
import { LoadingInline } from "@/components/AdminUI";
import { useToast } from "@/components/ToastProvider";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
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
      toast({
        variant: "success",
        title: "Login successful",
        description: `Welcome back${data?.admin?.name ? `, ${data.admin.name}` : ""}. Redirecting to the dashboard.`,
      });
      router.replace("/dashboard");
    } catch (error) {
      const message = error?.response?.data?.message || "Incorrect email or password. Please try again.";
      setErr(message);
      toast({
        variant: "error",
        title: "Login failed",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const emailInvalid = Boolean(err) || (email.length > 0 && !/^\S+@\S+\.\S+$/.test(email.trim()));
  const passwordInvalid = Boolean(err) || (password.length > 0 && password.length < 8);

  return (
    <div className="relative grid min-h-screen overflow-hidden bg-[#f7f8f4] p-4 md:p-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8">
      <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-emerald-100/80 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-amber-100/80 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(21,128,61,0.12),transparent_60%)]" />

      <section
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(9, 21, 18, 0.08), rgba(9, 21, 18, 0.52)), url('https://i.pinimg.com/1200x/fe/a9/9e/fea99e3934355291d1a10f603b439f3c.jpg')",
        }}
        className="relative hidden overflow-hidden rounded-[2rem] border border-white/70 bg-cover bg-center p-10 text-gray-800 shadow-[0_32px_80px_rgba(17,24,39,0.18)] lg:ml-6 lg:flex lg:flex-col lg:justify-between"
      >
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_55%)]" />
        <div className="relative rounded-[1.75rem] bg-white/10 p-6 text-black backdrop-blur-[2px]">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-white/90 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-700">
            <Sparkles size={14} />
            CITYVIEW ADMIN
          </p>
          <h1 className="mt-5 max-w-xl font-[family-name:var(--font-fraunces)] text-5xl leading-[0.95] text-white lg:text-6xl">
            Premium control for flawless event operations
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/78 lg:text-base">
            Manage clients, quotations, event timelines, and approvals from one secure, high-clarity admin workspace.
          </p>
        </div>

        <div className="relative grid gap-3 rounded-[1.75rem] border border-white/20 bg-black/20 p-6 text-sm text-white/82 backdrop-blur-md">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
            <span>Session security</span>
            <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-100">Protected</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
            <span>Admin access</span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">Invite only</span>
          </div>
        </div>
      </section>

      <section className="relative grid place-items-center">
        <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/88 p-7 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Admin Access
          </div>
          <h2 className="mt-4 font-[family-name:var(--font-fraunces)] text-4xl tracking-tight text-slate-900">Sign in</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Use your admin credentials to enter the CityView control center.</p>

          {err ? (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-red-800">Unable to sign in</p>
                <p className="mt-1">{err}</p>
              </div>
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <div
                className={`mt-2 flex items-center gap-2 rounded-2xl border px-3 py-3 transition focus-within:bg-white ${
                  emailInvalid
                    ? "border-red-300 bg-red-50/70 focus-within:border-red-400"
                    : "border-emerald-200 bg-slate-50 focus-within:border-emerald-500/50"
                }`}
              >
                <Mail size={18} className={emailInvalid ? "text-red-400" : "text-slate-400"} />
                <input
                  type="email"
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  placeholder="admin@cityview.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (err) setErr("");
                  }}
                  autoComplete="email"
                  aria-invalid={emailInvalid}
                />
              </div>
              {emailInvalid ? <p className="mt-2 text-xs font-medium text-red-600">Enter a valid admin email address.</p> : null}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <span className="text-xs font-medium text-slate-400">Minimum 8 characters</span>
              </div>
              <div
                className={`mt-2 flex items-center gap-2 rounded-2xl border px-3 py-3 transition focus-within:bg-white ${
                  passwordInvalid
                    ? "border-red-300 bg-red-50/70 focus-within:border-red-400"
                    : "border-emerald-200 bg-slate-50 focus-within:border-emerald-500/50"
                }`}
              >
                <Lock size={18} className={passwordInvalid ? "text-red-400" : "text-slate-400"} />
                <input
                  type={show ? "text" : "password"}
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (err) setErr("");
                  }}
                  autoComplete="current-password"
                  aria-invalid={passwordInvalid}
                />
                <button
                  type="button"
                  onClick={() => setShow((prev) => !prev)}
                  className="text-slate-400 transition hover:text-slate-700"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordInvalid ? (
                <p className="mt-2 text-xs font-medium text-red-600">Password must be at least 8 characters long.</p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl border border-emerald-300 bg-[linear-gradient(135deg,#14532d,#22c55e)] px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_rgba(34,197,94,0.24)] transition hover:translate-y-[-1px] hover:shadow-[0_24px_50px_rgba(34,197,94,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <LoadingInline label="Signing in..." /> : "Sign in to admin portal"}
            </button>
          </form>

          {/* <p className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
            Admin onboarding: use <span className="font-semibold text-slate-700">POST /api/auth/register</span> from Postman with setup key.
          </p> */}
        </div>
      </section>
    </div>
  );
}
