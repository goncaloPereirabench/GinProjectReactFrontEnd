import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { classNames } from "../../lib/format";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  isLoading?: boolean;
  icon?: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-market-600 text-white hover:bg-market-700 focus-visible:ring-market-600",
  secondary: "border border-ink-950/10 bg-white text-ink-950 hover:bg-stone-50 focus-visible:ring-market-600",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
  ghost: "text-ink-800 hover:bg-ink-950/5 focus-visible:ring-market-600",
};

export function Button({
  children,
  className,
  disabled,
  icon,
  isLoading,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={classNames(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : icon}
      {children}
    </button>
  );
}
