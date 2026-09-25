import { Link } from "react-router-dom";

import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/invoices/status-badge";
import { useStore } from "@/lib/store";
import {
  clientName,
  invoiceBalance,
  invoiceTotal,
  isOverdue,
  effectiveStatus,
} from "@/lib/calc";
import { formatShortDate } from "@/lib/format";

export const RecentActivity = () => {
  const { invoices, clients } = useStore();

  const recent = [...invoices]
    .sort((a, b) => b.issueDate.localeCompare(a.issueDate))
    .slice(0, 6);

  return (
    <Card className="flex flex-col border-border/70 p-5 shadow-none sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Recent invoices
          </h2>
          <p className="text-xs text-muted-foreground">
            Latest activity across all clients
          </p>
        </div>
      </div>

      {recent.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No invoices yet — create your first one to get started.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border/70">
          {recent.map((invoice) => {
            const overdue = isOverdue(invoice);
            const balance = invoiceBalance(invoice);
            const total = invoiceTotal(invoice);

            return (
              <li
                key={invoice.id}
                className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/invoices/${invoice.id}`}
                    className="flex items-center gap-2"
                  >
                    <span className="text-sm font-medium text-foreground hover:text-primary">
                      {invoice.number}
                    </span>
                    <span className="truncate text-sm text-muted-foreground">
                      {clientName(invoice.clientId, clients)}
                    </span>
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Issued {formatShortDate(invoice.issueDate)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="hidden text-right sm:block">
                    <span className="block text-sm font-medium tabular-nums">
                      {formatShortAmount(
                        overdue || effectiveStatus(invoice) !== "paid"
                          ? balance
                          : total,
                      )}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      {overdue || effectiveStatus(invoice) !== "paid"
                        ? "balance due"
                        : "total"}
                    </span>
                  </span>
                  <StatusBadge invoice={invoice} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

const formatShortAmount = (value: number): string => {
  if (value >= 10000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
};
