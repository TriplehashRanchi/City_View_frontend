"use client";

import Image from "next/image";

export function PageIntro({ eyebrow, title, description, action }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
      <div className="space-y-3">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.28rem] text-[#7b6540]">{eyebrow}</p>
        ) : null}
        <div className="space-y-1">
          <h1 className="display-font text-4xl leading-none text-[#2f3331] md:text-4xl">{title}</h1>
          {description ? <p className="max-w-4xl text-md leading-7 text-[#5f6662]">{description}</p> : null}
        </div>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function Panel({ title, subtitle, children, aside, className = "" }) {
  return (
    <section className={`editorial-panel p-6 md:p-8 ${className}`}>
      {title || subtitle || aside ? (
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="space-y-1">
            {title ? <h2 className="display-font text-2xl text-[#2f3331]">{title}</h2> : null}
            {subtitle ? <p className="text-sm leading-7 text-[#5f6662]">{subtitle}</p> : null}
          </div>
          {aside ? <div>{aside}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function StatCard({ label, value, hint }) {
  return (
    <article className="editorial-panel p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22rem] text-[#7b6540]">{label}</p>
      <p className="display-font mt-3 text-4xl leading-none text-[#2f3331]">{value}</p>
      {hint ? <p className="mt-3 text-sm leading-6 text-[#5f6662]">{hint}</p> : null}
    </article>
  );
}

export function Field({ label, hint, children, required = false }) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16rem] text-[#5d5e61]">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
      {hint ? <p className="text-xs leading-5 text-[#6e746f]">{hint}</p> : null}
    </label>
  );
}

export function TextInput({ className = "", ...props }) {
  return <input {...props} className={`editorial-input px-4 py-3 text-sm ${className}`} />;
}

export function TextArea({ className = "", ...props }) {
  return <textarea {...props} className={`editorial-textarea px-4 py-3 text-sm ${className}`} />;
}

export function Select({ className = "", children, ...props }) {
  return (
    <select {...props} className={`editorial-select px-4 py-3 text-sm ${className}`}>
      {children}
    </select>
  );
}

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`editorial-button px-5 py-3 text-sm font-semibold uppercase tracking-[0.12rem] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`editorial-button-secondary px-5 py-3 text-sm font-semibold uppercase tracking-[0.12rem] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="editorial-muted px-6 py-12 text-center">
      <p className="display-font text-2xl text-[#2f3331]">{title}</p>
      <p className="mt-3 text-sm leading-7 text-[#5f6662]">{description}</p>
    </div>
  );
}

export function DataTable({ columns, rows, emptyTitle, emptyDescription }) {
  if (!rows.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-left">
        <thead className="editorial-table-head">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18rem] text-[#5d5e61] ${column.align === "right" ? "text-right" : ""}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || index} className="border-b border-[var(--outline-ghost)] last:border-b-0">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-6 py-5 align-top text-sm text-[#3c413e] ${column.align === "right" ? "text-right" : ""}`}
                >
                  {column.render ? column.render(row) : row[column.key] ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MessageBanner({ tone = "neutral", message }) {
  if (!message) return null;

  const toneClasses = {
    neutral: "bg-[#ece9e2] text-[#444947]",
    success: "bg-[#e4ece6] text-[#34523f]",
    danger: "bg-[#f6e8e5] text-[#8b3733]",
  };

  return <div className={`px-4 py-3 text-sm ${toneClasses[tone] || toneClasses.neutral}`}>{message}</div>;
}

export function LoadingState({ label = "Loading...", className = "" }) {
  return (
    <div className={`flex items-center justify-center py-16 ${className}`}>
      <div className="text-center">
        <Image
          src="/loding.png"
          alt={label}
          width={64}
          height={64}
          className="mx-auto h-16 w-16 object-contain opacity-80"
          priority
        />
        <p className="mt-4 text-sm uppercase tracking-[0.16rem] text-[#5d5e61]">{label}</p>
      </div>
    </div>
  );
}

export function LoadingInline({ label = "Loading..." }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Image src="/loding.png" alt="" width={18} height={18} className="h-[18px] w-[18px] object-contain" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
