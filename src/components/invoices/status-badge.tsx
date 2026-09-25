import { FileText, AlertCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatShortDate } from "@/lib/format";
import type { Invoice } from "@/lib/types";
import { effectiveStatus, isOverdue, daysOverdue } from "@/lib/calc";

interface StatusBadgeProps {
  invoice: Invoice;
  className?: string;
}

export const StatusBadge = ({ invoice, className }: StatusBadgeProps) => {
  const status = effectiveStatus(invoice);
  const overdue = isOverdue(invoice);

  if (status === "paid") {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "gap-1 border-transparent bg-success/10 font-medium text-success",
          className,
        )}
      >
        <span className="size-1.5 rounded-full bg-success" />
        Paid
      </Badge>
    );
  }

  if (overdue) {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "gap-1 border-transparent bg-destructive/10 font-medium text-destructive",
          className,
        )}
      >
        <AlertCircle className="size-3" />
        Overdue {daysOverdue(invoice)}d
      </Badge>
    );
  }

  if (status === "sent") {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "gap-1 border-transparent bg-warning/10 font-medium text-warning",
          className,
        )}
      >
        <span className="size-1.5 rounded-full bg-warning" />
        Awaiting payment
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1 border-transparent bg-muted font-medium text-muted-foreground",
        className,
      )}
    >
      <FileText className="size-3" />
      Draft
    </Badge>
  );
};

export const DueDateCell = ({ invoice }: { invoice: Invoice }) => {
  if (effectiveStatus(invoice) === "paid") {
    return (
      <span className="text-muted-foreground">
        Due {formatShortDate(invoice.dueDate)}
      </span>
    );
  }
  if (isOverdue(invoice)) {
    return (
      <span className="font-medium text-destructive">
        Due {formatShortDate(invoice.dueDate)}
      </span>
    );
  }
  return (
    <span className="text-muted-foreground">
      Due {formatShortDate(invoice.dueDate)}
    </span>
  );
};
