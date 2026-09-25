import { Link } from "react-router-dom";

import { StatusBadge, DueDateCell } from "@/components/invoices/status-badge";
import { clientName, invoiceBalance, invoiceTotal } from "@/lib/calc";
import { formatCurrency } from "@/lib/format";
import type { Client, Invoice } from "@/lib/types";
import { ClientAvatar } from "@/components/clients/client-avatar";

interface InvoiceRowProps {
  invoice: Invoice;
  clients: Client[];
}

export const InvoiceRow = ({ invoice, clients }: InvoiceRowProps) => {
  const balance = invoiceBalance(invoice);
  const total = invoiceTotal(invoice);
  const name = clientName(invoice.clientId, clients);
  const client = clients.find((c) => c.id === invoice.clientId);

  return (
    <Link
      to={`/invoices/${invoice.id}`}
      className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-secondary/60 sm:gap-4"
    >
      <ClientAvatar name={name} className="size-9 shrink-0 text-sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-medium text-foreground group-hover:text-primary">
            {invoice.number}
          </span>
          <span className="truncate text-sm text-muted-foreground">{name}</span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground sm:hidden">
          {formatCurrency(total)} · <DueDateCell invoice={invoice} />
        </p>
      </div>

      <div className="hidden min-w-0 flex-1 sm:block">
        <span className="text-sm text-muted-foreground">
          {client?.contactName ?? "—"}
        </span>
      </div>

      <div className="hidden w-28 shrink-0 text-right sm:block">
        <span className="text-sm font-medium tabular-nums">
          {formatCurrency(total)}
        </span>
      </div>

      <div className="hidden w-28 shrink-0 text-right sm:block">
        <DueDateCell invoice={invoice} />
      </div>

      <div className="flex w-32 shrink-0 justify-end">
        <StatusBadge invoice={invoice} />
      </div>

      <div className="hidden w-28 shrink-0 text-right lg:block">
        <span className="text-sm font-medium tabular-nums text-foreground">
          {formatCurrency(balance)}
        </span>
      </div>
    </Link>
  );
};
