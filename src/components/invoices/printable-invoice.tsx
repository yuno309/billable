import { formatCurrencyExact, formatDate } from "@/lib/format";
import type { BusinessProfile, Client, Invoice } from "@/lib/types";
import {
  invoiceBalance,
  invoicePaid,
  invoiceSubtotal,
  invoiceTax,
  invoiceTotal,
} from "@/lib/calc";

interface PrintableInvoiceProps {
  invoice: Invoice;
  client?: Client;
  business: BusinessProfile;
}

export const PrintableInvoice = ({
  invoice,
  client,
  business,
}: PrintableInvoiceProps) => {
  const subtotal = invoiceSubtotal(invoice);
  const tax = invoiceTax(invoice);
  const total = invoiceTotal(invoice);
  const paid = invoicePaid(invoice);
  const balance = invoiceBalance(invoice);

  return (
    <div
      id="print-invoice"
      className="hidden h-fit rounded-xl border border-border bg-white p-8 text-ink print:block sm:p-12"
      style={{ color: "#1a1a2e" }}
    >
      <div className="flex items-start justify-between gap-8 border-b-2 border-[#4F46E5] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-lg bg-[#4F46E5]">
              <svg viewBox="0 0 32 32" className="size-7" fill="none">
                <path
                  d="M9.5 8.5h8.2l4.8 4.8v10.4a1.2 1.2 0 0 1-1.2 1.2H9.5a1.2 1.2 0 0 1-1.2-1.2V9.7A1.2 1.2 0 0 1 9.5 8.5Z"
                  fill="#fff"
                />
                <path
                  d="M12.6 17.6l1.9 1.9 3.9-3.9"
                  stroke="#4F46E5"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {business.name}
              </h1>
              <p className="text-sm text-slate-500">{business.title}</p>
            </div>
          </div>
          <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">
            {business.address}
          </div>
          <div className="mt-2 text-sm text-slate-600">
            {business.email} · {business.phone}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <h2 className="text-3xl font-bold tracking-tight text-[#4F46E5]">
            INVOICE
          </h2>
          <p className="mt-2 text-sm font-medium text-slate-700">
            {invoice.number}
          </p>
          <div className="mt-4 space-y-1 text-sm text-slate-600">
            <p>Issued: {formatDate(invoice.issueDate)}</p>
            <p className="font-medium text-slate-900">
              Due: {formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Billed to
          </p>
          <div className="mt-2 text-sm">
            <p className="font-semibold text-slate-900">{client?.name}</p>
            {client?.contactName ? <p>{client.contactName}</p> : null}
            {client?.email ? (
              <p className="text-slate-600">{client.email}</p>
            ) : null}
            {client?.phone ? (
              <p className="text-slate-600">{client.phone}</p>
            ) : null}
            {client?.address ? (
              <p className="mt-1 whitespace-pre-line text-slate-600">
                {client.address}
              </p>
            ) : null}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Amount due
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
            {formatCurrencyExact(balance)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {balance > 0
              ? `of ${formatCurrencyExact(total)} total`
              : "Paid in full — thank you"}
          </p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-[11px] uppercase tracking-widest text-slate-500">
              <th className="px-4 py-3 font-semibold">Description</th>
              <th className="px-4 py-3 text-right font-semibold">Qty</th>
              <th className="px-4 py-3 text-right font-semibold">Rate</th>
              <th className="px-4 py-3 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-slate-700">
                  {item.description}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                  {item.quantity}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                  {formatCurrencyExact(item.rate)}
                </td>
                <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-900">
                  {formatCurrencyExact(item.quantity * item.rate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-xs space-y-2.5 text-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatCurrencyExact(subtotal)}</span>
          </div>
          {invoice.taxRate > 0 ? (
            <div className="flex items-center justify-between text-slate-600">
              <span>Tax ({invoice.taxRate}%)</span>
              <span className="tabular-nums">{formatCurrencyExact(tax)}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between border-t-2 border-slate-200 pt-3 text-base font-semibold text-slate-900">
            <span>Total</span>
            <span className="tabular-nums">{formatCurrencyExact(total)}</span>
          </div>
          {paid > 0 ? (
            <div className="flex items-center justify-between text-slate-600">
              <span>Payments received</span>
              <span className="tabular-nums">−{formatCurrencyExact(paid)}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between text-base">
            <span className="font-semibold text-[#4F46E5]">Balance due</span>
            <span className="font-bold tabular-nums text-[#4F46E5]">
              {formatCurrencyExact(balance)}
            </span>
          </div>
        </div>
      </div>

      {invoice.notes ? (
        <div className="mt-10 border-t border-slate-200 pt-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Notes
          </p>
          <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
            {invoice.notes}
          </p>
        </div>
      ) : null}

      <p className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
        Thank you for your business — please remit payment by{" "}
        {formatDate(invoice.dueDate)}.
      </p>
    </div>
  );
};
