import Link from "next/link";
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  Flower2,
  MenuSquare,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Users2,
} from "lucide-react";

const highlights = [
  "Curated event operations for weddings, private celebrations, and corporate experiences",
  "One command center for packages, quotations, services, and client coordination",
  "Premium admin workflow with secure access and structured execution",
];

const services = [
  {
    title: "Luxury Wedding Planning",
    description: "End-to-end concept, venue styling, guest flow, and timeline control designed around calm execution.",
    icon: Flower2,
  },
  {
    title: "Corporate Event Production",
    description: "Structured delivery for launches, conferences, and premium brand gatherings with operational clarity.",
    icon: MenuSquare,
  },
  {
    title: "Client & Quotation Management",
    description: "Track leads, shape packages, and convert enquiries into organized, high-value event plans.",
    icon: ClipboardList,
  },
];

const stats = [
  { value: "120+", label: "premium events aligned and delivered" },
  { value: "24/7", label: "coordination visibility for admin teams" },
  { value: "1", label: "central workspace across clients and services" },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="pointer-events-none absolute left-[-10rem] top-16 h-80 w-80 rounded-full bg-[rgba(201,111,74,0.18)] blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] top-0 h-[32rem] w-[32rem] rounded-full bg-[rgba(23,32,51,0.1)] blur-3xl" />

      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[rgba(255,250,242,0.72)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--foreground)] text-[var(--surface)] shadow-[0_14px_40px_rgba(23,32,51,0.18)]">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--accent-deep)]">CityView</p>
              <p className="font-[var(--font-fraunces)] text-lg font-semibold">Events & Admin</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-[var(--ink-soft)] md:flex">
            <a href="#home" className="transition hover:text-[var(--foreground)]">Home</a>
            <a href="#about" className="transition hover:text-[var(--foreground)]">About</a>
            <a href="#services" className="transition hover:text-[var(--foreground)]">Services</a>
            <a href="#footer" className="transition hover:text-[var(--foreground)]">Footer</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:border-[rgba(23,32,51,0.2)] hover:bg-white md:inline-flex"
            >
              Admin Login
            </Link>
            <a
              href="#services"
              className="inline-flex rounded-full bg-[var(--foreground)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(23,32,51,0.18)] transition hover:translate-y-[-1px]"
            >
              Explore
            </a>
          </div>
        </div>
      </header>

      <main id="home">
        <section className="mx-auto grid max-w-7xl gap-12 px-5 py-14 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(201,111,74,0.25)] bg-[rgba(255,255,255,0.65)] px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-[var(--accent-deep)]">
              <ShieldCheck size={14} />
              Refined Event Operations
            </div>

            <h1 className="mt-6 max-w-3xl font-[var(--font-fraunces)] text-5xl font-semibold leading-[0.95] tracking-[-0.03em] text-[var(--foreground)] md:text-7xl">
              CityView crafts polished event experiences with a calm, premium admin core.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--ink-soft)] md:text-xl">
              A public-facing landing space for your brand, paired with a protected operations portal for clients,
              packages, quotations, services, and event execution.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#about"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3.5 text-sm font-bold text-white shadow-[0_18px_40px_rgba(201,111,74,0.28)] transition hover:translate-y-[-1px]"
              >
                Discover CityView
                <ArrowRight size={16} />
              </a>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-[var(--line)] bg-[rgba(255,255,255,0.72)] px-6 py-3.5 text-sm font-bold text-[var(--foreground)] transition hover:bg-white"
              >
                Open Admin Portal
              </Link>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.75rem] border border-[var(--line)] bg-[rgba(255,255,255,0.7)] p-5 shadow-[0_16px_40px_rgba(23,32,51,0.06)] backdrop-blur"
                >
                  <p className="font-[var(--font-fraunces)] text-4xl font-semibold">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-4 top-6 hidden h-24 w-24 rounded-[2rem] border border-white/60 bg-white/65 blur-[1px] md:block" />
            <div className="relative overflow-hidden rounded-[2rem] border border-[rgba(23,32,51,0.08)] bg-[linear-gradient(145deg,#172033_0%,#253451_42%,#d98d68_160%)] p-6 text-white shadow-[0_30px_80px_rgba(23,32,51,0.22)] md:p-8">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-[rgba(255,255,255,0.68)]">Signature Flow</p>
                  <h2 className="mt-3 font-[var(--font-fraunces)] text-3xl font-semibold leading-tight">
                    Elegant planning outside. Disciplined execution inside.
                  </h2>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <CalendarRange size={22} />
                </div>
              </div>

              <div className="mt-8 grid gap-4">
                {highlights.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-[1.5rem] border border-white/10 bg-white/8 p-4">
                    <CheckCircle2 size={18} className="mt-1 shrink-0 text-[#ffd3b8]" />
                    <p className="text-sm leading-7 text-[rgba(255,255,255,0.82)]">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 rounded-[1.75rem] bg-[rgba(255,255,255,0.08)] p-5 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[rgba(255,255,255,0.62)]">Operational Focus</p>
                  <p className="mt-2 text-sm leading-7 text-[rgba(255,255,255,0.82)]">
                    Quote faster, align vendors sooner, and keep every event decision visible.
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-[rgba(255,255,255,0.08)] p-4">
                  <p className="text-sm font-semibold text-white">Protected admin access</p>
                  <p className="mt-2 text-sm leading-6 text-[rgba(255,255,255,0.72)]">
                    Public landing on the outside, secure CityView control center on the inside.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="mx-auto max-w-7xl px-5 py-6 md:px-8 md:py-10">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-8 shadow-[0_18px_50px_rgba(23,32,51,0.06)]">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--accent-deep)]">About CityView</p>
              <h2 className="mt-4 font-[var(--font-fraunces)] text-4xl font-semibold leading-tight">
                Built for teams who want event presentation to feel as refined as event delivery.
              </h2>
            </div>

            <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-8 shadow-[0_18px_50px_rgba(23,32,51,0.06)]">
              <p className="text-base leading-8 text-[var(--ink-soft)]">
                CityView combines a polished brand-facing homepage with a practical backend workspace. The result is
                simple: visitors understand the quality of the brand immediately, while internal teams get a secure,
                structured portal for real execution.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] bg-[rgba(201,111,74,0.08)] p-5">
                  <Users2 size={20} className="text-[var(--accent-deep)]" />
                  <p className="mt-3 text-sm font-bold text-[var(--foreground)]">Client-led planning</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">Keep every client interaction organized and premium.</p>
                </div>
                <div className="rounded-[1.5rem] bg-[rgba(23,32,51,0.05)] p-5">
                  <PhoneCall size={20} className="text-[var(--foreground)]" />
                  <p className="mt-3 text-sm font-bold text-[var(--foreground)]">Fast operational response</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">Move from enquiry to execution without visual clutter.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-18">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--accent-deep)]">Services</p>
              <h2 className="mt-3 font-[var(--font-fraunces)] text-4xl font-semibold leading-tight md:text-5xl">
                Designed to feel premium before the first event call starts.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[var(--ink-soft)]">
              The visual language stays soft and high-end while the content stays clear enough to convert visitors into enquiries.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {services.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="group rounded-[2rem] border border-[var(--line)] bg-[rgba(255,255,255,0.74)] p-7 shadow-[0_18px_50px_rgba(23,32,51,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(23,32,51,0.1)]"
              >
                <div className="inline-flex rounded-2xl bg-[rgba(201,111,74,0.1)] p-3 text-[var(--accent-deep)] transition group-hover:bg-[var(--accent)] group-hover:text-white">
                  <Icon size={22} />
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-[var(--foreground)]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-16 md:px-8 md:pb-24">
          <div className="overflow-hidden rounded-[2.25rem] border border-[rgba(23,32,51,0.08)] bg-[linear-gradient(135deg,#fff7ef_0%,#f7eadf_52%,#f0d8c6_100%)] p-8 shadow-[0_24px_70px_rgba(23,32,51,0.08)] md:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-[var(--accent-deep)]">Ready To Enter</p>
            <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <h2 className="font-[var(--font-fraunces)] text-4xl font-semibold leading-tight md:text-5xl">
                  Keep the homepage open and elegant. Keep the admin work secure and focused.
                </h2>
                <p className="mt-4 text-base leading-8 text-[var(--ink-soft)]">
                  This layout gives CityView a real landing page instead of opening directly into admin login, while still
                  preserving a dedicated portal for internal use.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--foreground)] px-6 py-3.5 text-sm font-bold text-white shadow-[0_18px_35px_rgba(23,32,51,0.16)] transition hover:translate-y-[-1px]"
              >
                Proceed To Login
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer id="footer" className="border-t border-[var(--line)] bg-[rgba(255,250,242,0.88)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[1fr_auto_auto] md:px-8">
          <div>
            <p className="font-[var(--font-fraunces)] text-2xl font-semibold">CityView Events</p>
            <p className="mt-3 max-w-md text-sm leading-7 text-[var(--ink-soft)]">
              Premium event planning presence on the front end, disciplined operations in the admin layer.
            </p>
          </div>

          <div className="space-y-2 text-sm text-[var(--ink-soft)]">
            <p className="font-semibold text-[var(--foreground)]">Navigate</p>
            <a href="#home" className="block transition hover:text-[var(--foreground)]">Home</a>
            <a href="#about" className="block transition hover:text-[var(--foreground)]">About</a>
            <a href="#services" className="block transition hover:text-[var(--foreground)]">Services</a>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-[var(--foreground)]">Admin Access</p>
            <Link
              href="/login"
              className="inline-flex rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-white"
            >
              Open Secure Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
