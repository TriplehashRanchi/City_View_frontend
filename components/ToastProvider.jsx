"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const TOAST_STYLES = {
  success: {
    icon: CheckCircle2,
    card: "border-emerald-200 bg-white text-slate-900 shadow-[0_24px_60px_rgba(16,185,129,0.18)]",
    badge: "bg-emerald-50 text-emerald-600",
    title: "text-slate-900",
    description: "text-slate-500",
    progress: "bg-emerald-500",
  },
  error: {
    icon: AlertCircle,
    card: "border-red-200 bg-white text-slate-900 shadow-[0_24px_60px_rgba(239,68,68,0.18)]",
    badge: "bg-red-50 text-red-600",
    title: "text-slate-900",
    description: "text-slate-500",
    progress: "bg-red-500",
  },
  info: {
    icon: Info,
    card: "border-slate-200 bg-white text-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.12)]",
    badge: "bg-slate-100 text-slate-700",
    title: "text-slate-900",
    description: "text-slate-500",
    progress: "bg-slate-700",
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const removeToast = useCallback((id) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description = "", variant = "info", duration = 2600 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const nextToast = { id, title, description, variant, duration };

      setToasts((current) => [...current, nextToast]);

      const timer = setTimeout(() => {
        removeToast(id);
      }, duration);

      timers.current.set(id, timer);
      return id;
    },
    [removeToast]
  );

  const value = useMemo(() => ({ toast, removeToast }), [toast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,24rem)] flex-col gap-3">
        {toasts.map((item) => {
          const style = TOAST_STYLES[item.variant] || TOAST_STYLES.info;
          const Icon = style.icon;

          return (
            <div
              key={item.id}
              className={`pointer-events-auto relative overflow-hidden rounded-2xl border p-4 backdrop-blur-xl transition duration-300 ease-out animate-[toast-in_240ms_ease-out] ${style.card}`}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-3 pr-8">
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.badge}`}>
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${style.title}`}>{item.title}</p>
                  {item.description ? <p className={`mt-1 text-sm ${style.description}`}>{item.description}</p> : null}
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="absolute right-3 top-3 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>

              <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full origin-left animate-[toast-progress_linear_forwards] rounded-full ${style.progress}`}
                  style={{ animationDuration: `${item.duration}ms` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
