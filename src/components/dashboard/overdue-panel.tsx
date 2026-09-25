import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, Mail } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import {
  clientName,
  daysOverdue,
  invoiceBalance,
  isOverdue,
  sortByUrgency,
} from "@/lib/calc";
import { formatCurrency } from "@/lib/format";
import { EmptyState } from "@/components/common/empty-state";

export const OverduePanel = () => {
  const { invoices, clients } = useStore();
  const overdue = sortByUrgency(invoices.filter(isOverdue));

  const totalOutstanding = overdue.reduce(
    (sum, i) => sum + invoiceBalance(i),
    0,
  );

  return (
    <Card className="flex flex-col border-border/70 p-5 shadow-none sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <AlertCircle className="size-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Overdue reminders
            </h2>
            <p className="text-xs text-muted-foreground">
              {overdue.length > 0
                ? `${overdue.length} invoice${overdue.length > 1 ? "s" : ""} need attention`
                : "Nothing past due — nice work"}
            </p>
          </div>
        </div>
        {overdue.length > 0 ? (
          <span className="shrink-0 text-sm font-semibold tabular-nums text-destructive">
            {formatCurrency(totalOutstanding)}
          </span>
        ) : null}
      </div>

      {overdue.length === 0 ? (
        <EmptyState
          className="py-8"
          icon={<Mail className="size-5" />}
          title="All caught up"
          description="No invoices are past their due date right now."
        />
      ) : (
        <ul className="mt-4 divide-y divide-border/70">
          {overdue.slice(0, 5).map((invoice) => {
            const name = clientName(invoice.clientId, clients);
            const late = daysOverdue(invoice);
            const balance = invoiceBalance(invoice);

            const subject = encodeURIComponent(
              `Reminder: Invoice ${invoice.number} is overdue`,
            );
            const body = encodeURIComponent(
              `Hi ${name.split(" ")[0]},\n\nJust a friendly reminder that invoice ${invoice.number} for ${formatCurrency(balance)} was due ${invoice.dueDate} (${late} day${late > 1 ? "s" : ""} ago).\n\nLet me know if you have any questions — happy to help.\n\nThanks so much,\nAlex`,
            );
            const mailto = `mailto:${"billing@example.com"}?subject=${subject}&body=${body}`;

            return (
              <li
                key={invoice.id}
                className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/invoices/${invoice.id}`}
                    className="block truncate text-sm font-medium text-foreground hover:text-primary"
                  >
                    {invoice.number} · {name}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {late} day{late > 1 ? "s" : ""} past due
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums">
                    {formatCurrency(balance)}
                  </p>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5"
                >
                  <a href={mailto}>
                    <Mail className="size-3.5" />
                    <span className="hidden sm:inline">Remind</span>
                  </a>
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {overdue.length > 0 ? (
        <div className="mt-4 border-t border-border/70 pt-4">
          <Button asChild variant="ghost" size="sm" className="w-full gap-1.5">
            <Link to="/invoices?filter=overdue">
              View all overdue invoices
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      ) : null}
    </Card>
  );
};
