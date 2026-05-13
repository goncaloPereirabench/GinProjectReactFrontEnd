import { createContext, useContext } from "react";

export type ToastTone = "success" | "error" | "info";

export type ToastInput = {
  title: string;
  message?: string;
  tone?: ToastTone;
};

export type Toast = Required<ToastInput> & {
  id: string;
};

export type ToastContextValue = {
  notify: (toast: ToastInput) => void;
};

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
