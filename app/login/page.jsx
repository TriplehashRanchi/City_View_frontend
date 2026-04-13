"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/services/auth";
import { LoadingInline } from "@/components/AdminUI";
import { useToast } from "@/components/ToastProvider";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validationError = useMemo(() => {
    if (!email.trim() || !password) return "Email and password are required.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Enter a valid email address.";
    return "";
  }, [email, password]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const data = await auth.login({ email: email.trim().toLowerCase(), password });
      auth.saveSession({ token: data.token, admin: data.admin });
      toast({
        variant: "success",
        title: "Login successful",
        description: "Redirecting to the dashboard.",
      });
      router.replace("/dashboard");
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to sign in.";
      setError(message);
      toast({
        variant: "error",
        title: "Login failed",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[#faf9f7] lg:grid-cols-[1.1fr_0.9fr]">
      <section className="editorial-muted relative min-h-[260px] overflow-hidden lg:min-h-screen">
        <Image
          src="/image.png"
          alt="CityView login visual"
          fill
          priority
          className="object-cover"
        />
      </section>

      <section className="grid place-items-center px-6 py-10 md:px-10">
        <div className="editorial-panel flex min-h-[620px] w-full max-w-xl flex-col justify-center p-8 md:p-12 lg:p-14">
           <h2 className="display-font mt-4 text-4xl text-[#2f3331]">Sign in</h2>
          <p className="mt-3 text-sm leading-7 text-[#5f6662]">Use your admin credentials to enter the workspace.</p>

          {error ? <div className="mt-6 bg-[#f6e8e5] px-4 py-3 text-sm text-[#8b3733]">{error}</div> : null}

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <label className="block space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16rem] text-[#5d5e61] ">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError("");
                }}
                className="editorial-input px-4 py-4 text-sm mt-2" 
                placeholder="admin@cityview.com"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16rem] text-[#5d5e61]">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (error) setError("");
                }}
                className="editorial-input px-4 py-4 text-sm mt-2"
                placeholder="Enter password"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="editorial-button w-full px-5 py-4 mt-4 text-sm font-semibold uppercase tracking-[0.16rem] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <LoadingInline label="Signing in..." /> : "Enter Admin"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
