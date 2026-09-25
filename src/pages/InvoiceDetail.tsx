import { useMemo } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Printer,
  Send,
  Trash2,
  CreditCard,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/invoices/status-badge";
import { PaymentForm } from "@/components/invoices/payment-form";
import { PrintableInvoice } from "@/components/invoices/printable-invoice";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { ClientAvatar } from "@/components/clients/client-avatar";
import { useStore } from "@/lib/store";
import {
  clientName,
  effectiveStatus,
  invoiceBalance,
  invoicePaid,
  invoiceSubtotal,
  invoiceTax,
  invoiceTotal,
  isOverdue,
  sortedPayments,
} from "@/lib/calc";
import {
  formatCurrency,
  formatDate,
  paymentMethodLabel,
} from "@/lib/format";

const InvoiceDetail = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const {
    invoices,
    clients,
    business,
    addPayment,
    deletePayment,
    setInvoiceStatus,
    deleteInvoice,
  } = useStore();

  const invoice = invoices.find((i) => i.id === invoiceId);
  const client = clients.find((c) => c.id === invoice?.clientId);

  const totals = useMemo(() => {
    if (!invoice) return null;
    return {
      subtotal: invoiceSubtotal(invoice),
      tax: invoiceTax(invoice),
      total: invoiceTotal(invoice),
      paid: invoicePaid(invoice),
      balance: invoiceBalance(invoice),
    };
  }, [invoice]);

  if (!invoice || !totals) {
    return (
      <Card className="mt-6 border-border/70 shadow-none">
        <EmptyState
          className="py-16"
          title="Invoice not found"
          description="This invoice may have been removed."
          action={
            <Button asChild size="sm">
              <Link to="/invoices">Back to invoices</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  const status = effectiveStatus(invoice);
  const overdue = isOverdue(invoice);
  const payments = sortedPayments(invoice);
  const isPaid = totals.balance <= 0 && totals.total > 0;

  const handleAddPayment = (input: {
    amount: number;
    date: string;
    method: PaymentMethod;
    note?: string;
  }) => {
    addPayment(invoice.id, input);
    if (
      invoice.status !== "paid" &&
      totals.paid + input.amount >= totals.total
    ) {
      setInvoiceStatus(invoice.id, "paid");
      toast.success("Invoice fully paid — marked as paid");
    } else if (invoice.status === "draft") {
      setInvoiceStatus(invoice.id, "sent");
      toast.success("Invoice moved out of draft");
    }
  };

  const handleDelete = () => {
    const number = invoice.number;
    deleteInvoice(invoice.id);
    toast.success(`Invoice ${number} deleted`);
    navigate("/invoices");
  };

  const handleMarkSent = () => {
    setInvoiceStatus(invoice.id, "sent");
    toast.success(`Invoice ${invoice.number} marked as sent`);
  };

  const handlePrint = () => {
    window.print();
  };

  const clientLink = client ? `/clients/${client.id}` : "/clients";

  return (
    <>
      <div className="no-print">
        <PageHeader
          title={invoice.number}
          description={`${clientName(invoice.clientId, clients)} · issued ${formatDate(invoice.issueDate)}`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-1.5"
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-1.5"
              >
                <Printer className="size-4" />
                Print / PDF
              </Button>
              {status === "draft" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkSent}
                  className="gap-1.5"
                >
                  <Send className="size-4" />
                  Mark as sent
                </Button>
              ) : null}
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link to={`/invoices/${invoice.id}/edit`}>
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </Button>
              <ConfirmDialog
                title={`Delete invoice ${invoice.number}?`}
                description="This permanently removes the invoice and its payment history. This cannot be undone."
                confirmLabel="Delete invoice"
                onConfirm={handleDelete}
                trigger={
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                }
              />
            </div>
          }
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card className="border-border/70 p-6 shadow-none sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <ClientAvatar
                  name={clientName(invoice.clientId, clients)}
                  className="size-12 text-base"
                />
                <div>
                  <Link
                    to={clientLink}
                    className="text-lg font-semibold tracking-tight hover:text-primary"
                  >
                    {clientName(invoice.clientId, clients)}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {client?.contactName ?? client?.email}
                  </p>
                </div>
              </div>
              <StatusBadge invoice={invoice} />
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Issue date
                </p>
                <p className="mt-1 text-sm font-medium">
                  {formatDate(invoice.issueDate)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Due date
                </p>
                <p className="mt-1 text-sm font-medium">
                  {formatDate(invoice.dueDate)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Invoice total
                </p>
                <p className="mt-1 text-sm font-medium tabular-nums">
                  {formatCurrency(totals.total)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Balance due
                </p>
                <p
                  className={
                    overdue
                      ? "mt-1 text-sm font-bold tabular-nums text-destructive"
                      : "mt-1 text-sm font-bold tabular-nums"
                  }
                >
                  {formatCurrency(totals.balance)}
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">
                Line items
              </h3>
              <div className="mt-3 overflow-hidden rounded-lg border border-border/70">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-2.5 font-medium">Description</th>
                      <th className="px-4 py-2.5 text-right font-medium">Qty</th>
                      <th className="px-4 py-2.5 text-right font-medium">
                        Rate
                      </th>
                      <th className="px-4 py-2.5 text-right font-medium">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/70">
                    {invoice.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">{item.description}</td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatCurrency(item.rate)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums">
                          {formatCurrency(item.quantity * item.rate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-end">
                <div className="w-full max-w-xs space-y-2.5 text-sm">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="tabular-nums">
                      {formatCurrency(totals.subtotal)}
                    </span>
                  </div>
                  {invoice.taxRate > 0 ? (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Tax ({invoice.taxRate}%)</span>
                      <span className="tabular-nums">
                        {formatCurrency(totals.tax)}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold">
                    <span>Total</span>
                    <span className="tabular-nums">
                      {formatCurrency(totals.total)}
                    </span>
                  </div>
                  {totals.paid > 0 ? (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Payments received</span>
                      <span className="tabular-nums">
                        −{formatCurrency(totals.paid)}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between text-base">
                    <span className="font-semibold text-primary">
                      Balance due
                    </span>
                    <span className="font-bold tabular-nums text-primary">
                      {formatCurrency(totals.balance)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {invoice.notes ? (
              <div className="mt-6 rounded-lg bg-secondary/40 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Notes
                </p>
                <p className="mt-1.5 whitespace-pre-line text-sm text-muted-foreground">
                  {invoice.notes}
                </p>
              </div>
            ) : null}
          </Card>

          <PrintableInvoice
            invoice={invoice}
            client={client}
            business={business}
          />
        </div>

        <div className="flex flex-col gap-4">
          <Card className="border-border/70 p-6 shadow-none">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold tracking-tight">
                Payments
              </h2>
              <span className="text-sm tabular-nums text-muted-foreground">
                {formatCurrency(totals.paid)} of {formatCurrency(totals.total)}
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${
                    totals.total > 0
                      ? Math.min(100, (totals.paid / totals.total) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>

            {isPaid ? (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm font-medium text-success">
                <CheckCircle2 className="size-4" />
                Paid in full
              </div>
            ) : overdue ? (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive">
                <Send className="size-4" />
                Overdue — send a reminder
              </div>
            ) : null}

            <div className="mt-4">
              {payments.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No payments recorded yet.
                </p>
              ) : (
                <ul className="divide-y divide-border/70">
                  {payments.map((payment) => (
                    <li
                      key={payment.id}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                        <CreditCard className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium tabular-nums">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(payment.date)} ·{" "}
                          {paymentMethodLabel(payment.method)}
                        </p>
                        {payment.note ? (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {payment.note}
                          </p>
                        ) : null}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          deletePayment(invoice.id, payment.id);
                          toast.success("Payment removed");
                        }}
                        aria-label="Remove payment"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {!isPaid ? (
              <PaymentForm
                balance={totals.balance}
                onAdd={handleAddPayment}
                trigger={
                  <Button className="mt-4 w-full gap-1.5">
                    <Plus className="size-4" />
                    Record payment
                  </Button>
                }
              />
            ) : null}
          </Card>

          <Card className="border-border/70 p-6 shadow-none">
            <h2 className="text-base font-semibold tracking-tight">
              Client details
            </h2>
            {client ? (
              <div className="mt-4 space-y-2.5 text-sm">
                <p className="font-medium">{client.name}</p>
                {client.contactName ? (
                  <p className="text-muted-foreground">{client.contactName}</p>
                ) : null}
                <a
                  href={`mailto:${client.email}`}
                  className="block truncate text-muted-foreground hover:text-foreground"
                >
                  {client.email}
                </a>
                {client.phone ? (
                  <p className="text-muted-foreground">{client.phone}</p>
                ) : null}
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link to={clientLink}>View client profile</Link>
                </Button>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Client details unavailable.
              </p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

type PaymentMethod = import("@/lib/types").PaymentMethod;

export default InvoiceDetail;
