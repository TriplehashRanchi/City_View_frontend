"use client";

export function PageIntro({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--accent-deep)]">{eyebrow}</p>
        <div>
          <h1 className="font-[var(--font-fraunces)] text-3xl font-semibold text-[var(--foreground)] md:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">{description}</p>
        </div>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function Panel({ title, subtitle, children, aside }) {
  return (
    <section className="rounded-[2rem] border border-[var(--line)] bg-[rgba(255,255,255,0.78)] p-6 shadow-[0_18px_50px_rgba(23,32,51,0.06)]">
      {(title || subtitle || aside) && (
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            {title ? <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-sm text-[var(--ink-soft)]">{subtitle}</p> : null}
          </div>
          {aside ? <div>{aside}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-[1.75rem] border border-[var(--line)] bg-[rgba(255,250,242,0.9)] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--accent-deep)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{value}</p>
      {hint ? <p className="mt-2 text-sm text-[var(--ink-soft)]">{hint}</p> : null}
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[var(--foreground)]">{label}</span>
      <div className="mt-2">{children}</div>
      {hint ? <p className="mt-2 text-xs text-[var(--ink-soft)]">{hint}</p> : null}
    </label>
  );
}

export function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[rgba(201,111,74,0.5)] focus:ring-2 focus:ring-[rgba(201,111,74,0.16)] ${props.className || ""}`}
    />
  );
}

export function TextArea(props) {
  return (
    <textarea
      {...props}
      className={`min-h-28 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[rgba(201,111,74,0.5)] focus:ring-2 focus:ring-[rgba(201,111,74,0.16)] ${props.className || ""}`}
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[rgba(201,111,74,0.5)] focus:ring-2 focus:ring-[rgba(201,111,74,0.16)] ${props.className || ""}`}
    />
  );
}

export function PrimaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className={`rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-50 ${props.className || ""}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className={`rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[rgba(201,111,74,0.45)] hover:text-[var(--accent-deep)] disabled:cursor-not-allowed disabled:opacity-50 ${props.className || ""}`}
    >
      {children}
    </button>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[rgba(255,250,242,0.7)] p-6 text-center">
      <p className="text-sm font-semibold text-[var(--foreground)]">{title}</p>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">{description}</p>
    </div>
  );
}

export function DataTable({ columns, rows, emptyTitle, emptyDescription }) {
  if (!rows.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-[var(--line)]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-[rgba(23,32,51,0.04)] text-[var(--foreground)]">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-semibold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id || index} className="border-t border-[var(--line)] bg-white">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 align-top text-[var(--ink-soft)]">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MessageBanner({ tone = "neutral", message }) {
  if (!message) return null;

  const styles = {
    neutral: "border-[var(--line)] bg-white text-[var(--foreground)]",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    danger: "border-rose-200 bg-rose-50 text-rose-800",
  };

  return <div className={`rounded-2xl border px-4 py-3 text-sm ${styles[tone] || styles.neutral}`}>{message}</div>;
}
