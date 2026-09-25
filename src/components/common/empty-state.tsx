import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center gap-4 px-6 py-14 text-center",
      className,
    )}
  >
    {icon ? (
      <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
        {icon}
      </div>
    ) : null}
    <div className="space-y-1.5">
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      {description ? (
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
    {action ? <div className="flex items-center gap-2">{action}</div> : null}
  </div>
);
