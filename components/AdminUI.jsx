"use client";

import { Children, isValidElement, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

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
          <div className="">
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
  const { value, onChange, name, disabled = false } = props;
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const options = useMemo(
    () =>
      Children.toArray(children)
        .filter((child) => isValidElement(child) && child.type === "option")
        .map((child) => ({
          value: child.props.value ?? "",
          label: child.props.children,
          disabled: Boolean(child.props.disabled),
        })),
    [children],
  );

  const selectedOption =
    options.find((option) => String(option.value) === String(value ?? "")) ||
    options[0] ||
    null;

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handleSelect = (nextValue) => {
    setOpen(false);
    onChange?.({
      target: { value: nextValue, name },
      currentTarget: { value: nextValue, name },
    });
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`editorial-select flex w-full items-center justify-between px-4 py-3 pr-11 text-left text-sm ${className}`}
      >
        <span className="truncate">{selectedOption?.label ?? ""}</span>
      </button>
      <ChevronDown
        size={18}
        className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7b6540] transition ${open ? "rotate-180" : ""}`}
      />

      {open ? (
        <div className="absolute left-0 right-0  z-30 overflow-hidden rounded-sm border border-[rgba(123,101,64,0.18)] bg-[#fffdf7] shadow-[0_18px_30px_rgba(47,51,49,0.08)]">
          {options.map((option) => {
            const active =
              String(option.value) === String(selectedOption?.value ?? "");

            return (
              <button
                key={String(option.value)}
                type="button"
                disabled={option.disabled}
                onClick={() => handleSelect(option.value)}
                className={`block w-full px-4 py-2 text-left text-sm cursor-pointer transition ${
                  active
                    ? "bg-[#efe4ca] font-semibold text-[#6f5d33]"
                    : "text-[#2f3331] hover:bg-[#f7f1e5]"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`editorial-button cursor-pointer px-5 py-3 text-sm font-semibold uppercase tracking-[0.12rem] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`editorial-button-secondary cursor-pointer px-5 py-3 text-sm font-semibold uppercase tracking-[0.12rem] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
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
          src="/loading.png"
          alt={label}
          width={64}
          height={64}
          className="mx-auto h-16 w-16 object-contain opacity-80"
          priority
        />
        <p className="mt-4 text-sm  tracking-[0.16rem] text-[#5d5e61]">{label}</p>
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

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) {
  if (totalItems <= pageSize) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const pageNumbers = [];

  for (let page = 1; page <= totalPages; page += 1) {
    if (
      page === 1 ||
      page === totalPages ||
      Math.abs(page - currentPage) <= 1
    ) {
      pageNumbers.push(page);
    } else if (pageNumbers[pageNumbers.length - 1] !== "...") {
      pageNumbers.push("...");
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-4 border-t border-[var(--outline-ghost)] pt-5 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-[#5f6662]">
        Showing {startItem}-{endItem} of {totalItems}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="editorial-button-secondary inline-flex items-center cursor-pointer justify-center rounded-sm px-3 py-3 text-xs font-semibold uppercase tracking-[0.12rem] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={16} />
        </button>

        {pageNumbers.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-sm text-[#7d817d] font-semibold"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`min-w-10 rounded-sm px-3 py-2 cursor-pointer text-sm font-semibold transition ${
                currentPage === page
                  ? "bg-[#2f3331] text-[#faf9f7]"
                  : "  text-[#2f3331] hover:bg-[#ece9e2]"
              }`}
            >
              {page}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="editorial-button-secondary inline-flex cursor-pointer items-center justify-center rounded-sm px-3 py-3 text-xs font-semibold uppercase tracking-[0.12rem] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
