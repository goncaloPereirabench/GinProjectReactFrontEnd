import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

type StateBlockProps = {
  title: string;
  children?: ReactNode;
};

export function LoadingState({ title = "Loading" }: Partial<StateBlockProps>) {
  return (
    <div className="flex min-h-52 items-center justify-center rounded-md border border-dashed border-ink-950/15 bg-white/70">
      <div className="flex items-center gap-3 text-sm font-medium text-ink-600">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        {title}
      </div>
    </div>
  );
}

export function EmptyState({ children, title }: StateBlockProps) {
  return (
    <div className="rounded-md border border-dashed border-ink-950/15 bg-white/70 px-6 py-12 text-center">
      <h2 className="text-lg font-semibold text-ink-950">{title}</h2>
      {children ? <div className="mx-auto mt-2 max-w-lg text-sm text-ink-600">{children}</div> : null}
    </div>
  );
}
