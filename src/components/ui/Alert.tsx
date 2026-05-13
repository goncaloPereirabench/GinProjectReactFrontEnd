import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { ReactNode } from "react";
import { classNames } from "../../lib/format";

type AlertTone = "info" | "success" | "error";

type AlertProps = {
  title?: string;
  children: ReactNode;
  tone?: AlertTone;
};

const toneClasses: Record<AlertTone, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-950",
  success: "border-market-100 bg-market-100 text-market-700",
  error: "border-red-200 bg-red-50 text-red-900",
};

const icons = {
  info: Info,
  success: CheckCircle2,
  error: AlertTriangle,
};

export function Alert({ children, title, tone = "info" }: AlertProps) {
  const Icon = icons[tone];

  return (
    <div className={classNames("flex gap-3 rounded-md border p-4 text-sm", toneClasses[tone])}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={title ? "mt-1" : ""}>{children}</div>
      </div>
    </div>
  );
}
