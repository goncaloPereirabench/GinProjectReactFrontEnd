import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { classNames } from "../../lib/format";

type FieldProps = {
  label: string;
  error?: string;
};

type InputProps = FieldProps & InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

const controlClasses =
  "mt-1 w-full rounded-md border border-ink-950/10 bg-white px-3 py-2 text-sm text-ink-950 outline-none transition placeholder:text-ink-600/60 focus:border-market-600 focus:ring-2 focus:ring-market-600/20";

export function Input({ className, error, id, label, ...props }: InputProps) {
  const inputId = id || props.name;

  return (
    <label className="block text-sm font-medium text-ink-800" htmlFor={inputId}>
      {label}
      <input id={inputId} className={classNames(controlClasses, className)} {...props} />
      {error ? <span className="mt-1 block text-xs text-red-700">{error}</span> : null}
    </label>
  );
}

export function Textarea({ className, error, id, label, ...props }: TextareaProps) {
  const inputId = id || props.name;

  return (
    <label className="block text-sm font-medium text-ink-800" htmlFor={inputId}>
      {label}
      <textarea id={inputId} className={classNames(controlClasses, "min-h-24", className)} {...props} />
      {error ? <span className="mt-1 block text-xs text-red-700">{error}</span> : null}
    </label>
  );
}
