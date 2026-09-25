import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  hint?: ReactNode;
  accent?: "primary" | "success" | "warning" | "destructive";
  className?: string;
}

const accentStyles = {
  primary: "bg-accent text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
} as const;

export const KpiCard = ({
  label,
  value,
  icon,
  hint,
  accent = "primary",
  className,
}: KpiCardProps) => (
  <Card
    className={cn(
      "gap-0 border-border/70 p-5 shadow-none",
      className,
    )}
  >
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-lg",
          accentStyles[accent],
        )}
      >
        {icon}
      </span>
    </div>
    <div className="mt-3 text-[28px] font-semibold leading-tight tracking-tight tabular-nums text-foreground">
      {value}
    </div>
    {hint ? (
      <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        {hint}
      </div>
    ) : null}
  </Card>
);

export const DeltaHint = ({
  value,
  label,
  positive = true,
}: {
  value: string;
  label: string;
  positive?: boolean;
}) => (
  <>
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-medium",
        positive ? "text-success" : "text-destructive",
      )}
    >
      <ArrowRight
        className={cn("size-3", positive ? "-rotate-45" : "rotate-45")}
      />
      {value}
    </span>
    <span>{label}</span>
  </>
);
