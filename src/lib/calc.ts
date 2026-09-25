import type {
  Client,
  Invoice,
  InvoiceStatus,
  Payment,
} from "@/lib/types";
import { todayISO } from "@/lib/format";

export const lineTotal = (item: {
  quantity: number;
  rate: number;
}): number => item.quantity * item.rate;

export const invoiceSubtotal = (invoice: Invoice): number =>
  invoice.items.reduce((sum, item) => sum + lineTotal(item), 0);

export const invoiceTax = (invoice: Invoice): number =>
  invoiceSubtotal(invoice) * (invoice.taxRate / 100);

export const invoiceTotal = (invoice: Invoice): number =>
  invoiceSubtotal(invoice) + invoiceTax(invoice);

export const invoicePaid = (invoice: Invoice): number =>
  invoice.payments.reduce((sum, p) => sum + p.amount, 0);

export const invoiceBalance = (invoice: Invoice): number =>
  Math.max(0, invoiceTotal(invoice) - invoicePaid(invoice));

export const daysBetween = (a: string, b: string): number =>
  Math.round(
    (new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime()) /
      86_400_000,
  );

export const isOverdue = (invoice: Invoice): boolean =>
  invoice.status !== "paid" && invoice.dueDate < todayISO();

export const daysOverdue = (invoice: Invoice): number =>
  isOverdue(invoice) ? daysBetween(invoice.dueDate, todayISO()) : 0;

/**
 * Statuses that represent money the freelancer is still waiting on.
 */
export const isOutstanding = (invoice: Invoice): boolean =>
  invoice.status !== "paid" || invoiceBalance(invoice) > 0;

/**
 * A sent invoice is fully paid when recorded payments cover the total.
 */
export const isFullyPaid = (invoice: Invoice): boolean =>
  invoicePaid(invoice) >= invoiceTotal(invoice) && invoiceTotal(invoice) > 0;

export const effectiveStatus = (invoice: Invoice): InvoiceStatus => {
  if (invoice.status === "draft") return "draft";
  return isFullyPaid(invoice) ? "paid" : invoice.status;
};

export const daysUntilDue = (invoice: Invoice): number =>
  daysBetween(todayISO(), invoice.dueDate);

export interface ClientTotals {
  totalBilled: number;
  totalPaid: number;
  outstanding: number;
  invoiceCount: number;
  paidCount: number;
}

export const clientTotals = (
  client: Client,
  invoices: Invoice[],
): ClientTotals => {
  const clientInvoices = invoices.filter((i) => i.clientId === client.id);
  return clientInvoices.reduce(
    (acc, invoice) => {
      acc.totalBilled += invoiceTotal(invoice);
      acc.totalPaid += invoicePaid(invoice);
      acc.invoiceCount += 1;
      if (effectiveStatus(invoice) === "paid") acc.paidCount += 1;
      return acc;
    },
    {
      totalBilled: 0,
      totalPaid: 0,
      outstanding: 0,
      invoiceCount: 0,
      paidCount: 0,
    } as ClientTotals,
  );
};

export const clientName = (
  clientId: string,
  clients: Client[],
): string =>
  clients.find((c) => c.id === clientId)?.name ?? "Unknown client";

export const getClient = (
  clientId: string,
  clients: Client[],
): Client | undefined => clients.find((c) => c.id === clientId);

export const sortedPayments = (invoice: Invoice): Payment[] =>
  [...invoice.payments].sort((a, b) => a.date.localeCompare(b.date));

/**
 * Sort invoices: overdue first, then by due date ascending.
 */
export const sortByUrgency = (invoices: Invoice[]): Invoice[] =>
  [...invoices].sort((a, b) => {
    const aOverdue = isOverdue(a);
    const bOverdue = isOverdue(b);
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
    return a.dueDate.localeCompare(b.dueDate);
  });
