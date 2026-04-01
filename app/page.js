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
    <div className="relative overflow-hidden bg-white text-gray-800">
      {/* Decorative blurs using warm colors */}
      <div className="pointer-events-none absolute left-[-10rem] top-16 h-80 w-80 rounded-full bg-[#FDC3A1]/40 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] top-0 h-[32rem] w-[32rem] rounded-full bg-[#FB9B8F]/30 blur-3xl" />

      <header className="sticky top-0 z-20 border-b border-[#FDC3A1]/30 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gray-800 text-white shadow-lg">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#F57799]">CityView</p>
              <p className="font-[var(--font-fraunces)] text-lg font-semibold">Events & Admin</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-gray-500 md:flex">
            <a href="#home" className="transition hover:text-gray-800">Home</a>
            <a href="#about" className="transition hover:text-gray-800">About</a>
            <a href="#services" className="transition hover:text-gray-800">Services</a>
            <a href="#footer" className="transition hover:text-gray-800">Footer</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-full border border-[#FDC3A1]/50 px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-[#F57799]/70 hover:bg-white md:inline-flex"
            >
              Admin Login
            </Link>
            <a
              href="#services"
              className="inline-flex rounded-full bg-linear-to-br from-white to-[#F57799] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:translate-y-[-1px]"
            >
              Explore
            </a>
          </div>
        </div>
      </header>

      <main id="home">
        <section className="mx-auto grid max-w-7xl gap-12 px-5 py-14 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#F57799]/30 bg-[#FFF7CD]/60 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-[#F57799]">
              <ShieldCheck size={14} />
              Refined Event Operations
            </div>

            <h1 className="mt-6 max-w-3xl font-[var(--font-fraunces)] text-5xl font-semibold leading-[0.95] tracking-[-0.03em] text-gray-800 md:text-7xl">
              CityView crafts polished event experiences with a calm, premium admin core.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 md:text-xl">
              A public-facing landing space for your brand, paired with a protected operations portal for clients,
              packages, quotations, services, and event execution.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#about"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-br from-white to-[#F57799] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:translate-y-[-1px]"
              >
                Explore CityView
                <ArrowRight size={16} />
              </a>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-[#FDC3A1]/50 bg-white/90 px-6 py-3.5 text-sm font-bold text-gray-800 transition hover:bg-white"
              >
                Enter Admin Portal
              </Link>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.75rem] border border-[#FDC3A1]/30 bg-white/90 p-5 shadow-md backdrop-blur"
                >
                  <p className="font-[var(--font-fraunces)] text-4xl font-semibold text-gray-800">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            {/* <div className="absolute -right-4 top-6 hidden h-24 w-24 rounded-[2rem] border border-white/60 bg-white/65 blur-[1px] md:block" /> */}
            <div className="relative overflow-hidden rounded-[2rem] border border-[#FDC3A1]/30 bg-gradient-to-br from-[#FDC3A1]/20 to-[#FB9B8F]/20 p-6 text-gray-800 shadow-xl md:p-8">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#F57799]">Signature Flow</p>
                  <h2 className="mt-3 font-[var(--font-fraunces)] text-3xl font-semibold leading-tight">
                    Elegant planning outside. Disciplined execution inside.
                  </h2>
                </div>
                <div className="rounded-2xl bg-[#F57799]/10 p-3 text-[#F57799]">
                  <CalendarRange size={22} />
                </div>
              </div>

              <div className="mt-8 grid gap-4">
                {highlights.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-[1.5rem] border border-[#FDC3A1]/40 bg-white/60 p-4">
                    <CheckCircle2 size={18} className="mt-1 shrink-0 text-[#F57799]" />
                    <p className="text-sm leading-7 text-gray-700">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 rounded-[1.75rem] bg-white/70 p-5 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Operational Focus</p>
                  <p className="mt-2 text-sm leading-7 text-gray-700">
                    Quote faster, align vendors sooner, and keep every event decision visible.
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-[#FDC3A1]/40 bg-white/80 p-4">
                  <p className="text-sm font-semibold text-gray-800">Protected admin access</p>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Public landing on the outside, secure CityView control center on the inside.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="mx-auto max-w-7xl px-5 py-6 md:px-8 md:py-10">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-[#FDC3A1]/30 bg-white/90 p-8 shadow-md">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#F57799]">About CityView</p>
              <h2 className="mt-4 font-[var(--font-fraunces)] text-4xl font-semibold leading-tight">
                Built for teams who want event presentation to feel as refined as event delivery.
              </h2>
            </div>

            <div className="rounded-[2rem] border border-[#FDC3A1]/30 bg-white/90 p-8 shadow-md">
              <p className="text-base leading-8 text-gray-600">
                CityView combines a polished brand-facing homepage with a practical backend workspace. The result is
                simple: visitors understand the quality of the brand immediately, while internal teams get a secure,
                structured portal for real execution.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] bg-[#F57799]/10 p-5">
                  <Users2 size={20} className="text-[#F57799]" />
                  <p className="mt-3 text-sm font-bold text-gray-800">Client-led planning</p>
                  <p className="mt-2 text-sm leading-6 text-gray-600">Keep every client interaction organized and premium.</p>
                </div>
                <div className="rounded-[1.5rem] bg-gray-100 p-5">
                  <PhoneCall size={20} className="text-gray-700" />
                  <p className="mt-3 text-sm font-bold text-gray-800">Fast operational response</p>
                  <p className="mt-2 text-sm leading-6 text-gray-600">Move from enquiry to execution without visual clutter.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="relative mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-18">

          <div className="pointer-events-none absolute left-[-8rem] -top-20 h-[32rem] w-[32rem] rounded-full bg-[#FB9B8F]/20 blur-3xl" />

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#F57799]">Services</p>
              <h2 className="mt-3 font-[var(--font-fraunces)] text-4xl font-semibold leading-tight md:text-5xl">
                Designed to feel premium before the first event call starts.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-gray-600">
              The visual language stays soft and high-end while the content stays clear enough to convert visitors into enquiries.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {services.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="z-1 group rounded-[2rem] border border-[#FDC3A1]/30 bg-white/90 p-7 shadow-md transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="inline-flex rounded-2xl bg-[#F57799]/10 p-3 text-[#F57799] transition group-hover:bg-[#F57799] group-hover:text-white">
                  <Icon size={22} />
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-gray-800">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-16 md:px-8 md:pb-24">
  <div className="overflow-hidden rounded-[2.25rem] border border-[#FDC3A1]/30 bg-white p-8 shadow-md md:p-12">
    <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#F57799]">Ready To Enter</p>
    <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <h2 className="font-[var(--font-fraunces)] text-4xl font-semibold leading-tight md:text-5xl">
          Keep the homepage open and elegant. Keep the admin work secure and focused.
        </h2>
        <p className="mt-4 text-base leading-8 text-gray-600">
          This layout gives CityView a real landing page instead of opening directly into admin login, while still
          preserving a dedicated portal for internal use.
        </p>
      </div>
      <Link
        href="/login"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-br from-white to-[#F57799] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:translate-y-[-1px]"
      >
        Proceed To Login
        <ArrowRight size={16} />
      </Link>
    </div>
  </div>
</section>
      </main>

      <footer id="footer" className="border-t border-[#FDC3A1]/30 bg-gradient-to-br from-[#FDC3A1]/20 to-[#FB9B8F]/20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[1fr_auto_auto] md:px-8">
          <div>
            <p className="font-[var(--font-fraunces)] text-2xl font-semibold text-gray-800">CityView Events</p>
            <p className="mt-3 max-w-md text-sm leading-7 text-gray-600">
              Premium event planning presence on the front end, disciplined operations in the admin layer.
            </p>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p className="font-semibold text-gray-800">Navigate</p>
            <a href="#home" className="block transition hover:text-gray-800">Home</a>
            <a href="#about" className="block transition hover:text-gray-800">About</a>
            <a href="#services" className="block transition hover:text-gray-800">Services</a>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-800">Admin Access</p>
            <Link
              href="/login"
              className="inline-flex rounded-full border border-[#FDC3A1]/50 px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-white"
            >
              Open Secure Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}