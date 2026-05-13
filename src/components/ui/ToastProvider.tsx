import { PropsWithChildren, useCallback, useMemo, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { classNames } from "../../lib/format";
import { ToastContext, type Toast, type ToastInput, type ToastTone } from "./toastContext";

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const toneClasses: Record<ToastTone, string> = {
  success: "border-market-100 bg-white text-market-700",
  error: "border-red-200 bg-white text-red-700",
  info: "border-sky-200 bg-white text-sky-800",
};

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    ({ message = "", title, tone = "info" }: ToastInput) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, message, title, tone }]);
      window.setTimeout(() => dismiss(id), 3500);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex w-[min(420px,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((toast) => {
          const Icon = icons[toast.tone];
          return (
            <div
              className={classNames("flex items-start gap-3 rounded-md border p-4 shadow-soft", toneClasses[toast.tone])}
              key={toast.id}
              role="status"
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink-950">{toast.title}</p>
                {toast.message ? <p className="mt-1 text-sm leading-5 text-ink-600">{toast.message}</p> : null}
              </div>
              <button
                aria-label="Dismiss notification"
                className="rounded-md p-1 text-ink-600 transition hover:bg-ink-950/5 hover:text-ink-950"
                onClick={() => dismiss(toast.id)}
                type="button"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
