import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { ArrowLeft, Plus, Save, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/layout/page-header";
import { useStore } from "@/lib/store";
import { formatCurrency, toISODate, todayISO } from "@/lib/format";
import type { InvoiceLineItem, InvoiceStatus } from "@/lib/types";

const uid = (): string =>
  `it_${Math.random().toString(36).slice(2, 9)}`;

const defaultDueDate = (issueDate: string): string => {
  const d = new Date(issueDate + "T00:00:00");
  d.setDate(d.getDate() + 14);
  return toISODate(d);
};

const InvoiceForm = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const isEditing = Boolean(invoiceId);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    clients,
    invoices,
    addInvoice,
    updateInvoice,
    nextInvoiceNumber,
  } = useStore();

  const existing = isEditing
    ? invoices.find((i) => i.id === invoiceId)
    : undefined;

  const presetClientId = searchParams.get("clientId") ?? "";

  const [number, setNumber] = useState(
    existing?.number ?? nextInvoiceNumber(),
  );
  const [clientId, setClientId] = useState(
    existing?.clientId ?? presetClientId,
  );
  const [issueDate, setIssueDate] = useState(existing?.issueDate ?? todayISO());
  const [dueDate, setDueDate] = useState(existing?.dueDate ?? "");
  const [status, setStatus] = useState<InvoiceStatus>(existing?.status ?? "draft");
  const [taxRate, setTaxRate] = useState(existing?.taxRate ?? 0);
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [items, setItems] = useState<InvoiceLineItem[]>(
    existing?.items ?? [
      { id: uid(), description: "", quantity: 1, rate: 0 },
    ],
  );

  // Keep the due date in sync with a sensible default until manually changed.
  useEffect(() => {
    if (!existing && !dueDate) {
      setDueDate(defaultDueDate(issueDate));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueDate]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.rate, 0),
    [items],
  );

  const tax = useMemo(
    () => subtotal * (Number(taxRate) / 100),
    [subtotal, taxRate],
  );

  const total = subtotal + tax;

  const updateItem = (id: string, patch: Partial<InvoiceLineItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: uid(), description: "", quantity: 1, rate: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!clientId) {
      toast.error("Choose a client for this invoice");
      return;
    }
    if (!number.trim()) {
      toast.error("Invoice number is required");
      return;
    }

    const validItems = items.filter(
      (item) => item.description.trim() !== "",
    );

    if (validItems.length === 0) {
      toast.error("Add at least one line item with a description");
      return;
    }

    const payload = {
      number: number.trim(),
      clientId,
      issueDate,
      dueDate: dueDate || defaultDueDate(issueDate),
      status,
      items: validItems.map((item) => ({
        ...item,
        quantity: Number(item.quantity) || 0,
        rate: Number(item.rate) || 0,
      })),
      taxRate: Number(taxRate) || 0,
      notes: notes.trim() || undefined,
    };

    if (isEditing && existing) {
      updateInvoice(existing.id, payload);
      toast.success(`Invoice ${payload.number} updated`);
      navigate(`/invoices/${existing.id}`);
    } else {
      const created = addInvoice(payload);
      toast.success(`Invoice ${created.number} created`);
      navigate(`/invoices/${created.id}`);
    }
  };

  if (clients.length === 0) {
    return (
      <Card className="mt-6 border-border/70 shadow-none">
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <h2 className="text-lg font-medium">Add a client first</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Invoices need a client. Add one, then come back to create the
            invoice.
          </p>
          <Button asChild size="sm">
            <a href="/clients/new">Add a client</a>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title={isEditing ? "Edit invoice" : "New invoice"}
        description={
          isEditing
            ? `Update the details of ${existing?.number}.`
            : "Create an invoice, then send it or keep it as a draft."
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-1.5"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        }
      />

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3"
      >
        <Card className="flex flex-col gap-6 border-border/70 p-6 shadow-none lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="number">Invoice number</Label>
              <Input
                id="number"
                value={number}
                onChange={(event) => setNumber(event.target.value)}
                placeholder="INV-1077"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger id="client" className="w-full">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue date</Label>
              <Input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(event) => setIssueDate(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as InvoiceStatus)}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={taxRate}
                onChange={(event) => setTaxRate(Number(event.target.value))}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Label>Line items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="gap-1.5"
              >
                <Plus className="size-4" />
                Add item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => {
                const amount = item.quantity * item.rate;

                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-2 rounded-lg border border-border/70 bg-secondary/30 p-3 sm:gap-3 sm:p-4"
                  >
                    <div className="hidden shrink-0 pt-2.5 text-muted-foreground sm:block">
                      <GripVertical className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-3">
                      <Input
                        value={item.description}
                        onChange={(event) =>
                          updateItem(item.id, {
                            description: event.target.value,
                          })
                        }
                        placeholder={`Line item ${index + 1} description`}
                        className="border-transparent bg-background"
                      />
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-20 shrink-0">
                          <Input
                            type="number"
                            min="0"
                            step="0.25"
                            value={item.quantity}
                            onChange={(event) =>
                              updateItem(item.id, {
                                quantity: Number(event.target.value),
                              })
                            }
                            className="border-transparent bg-background tabular-nums"
                            aria-label="Quantity"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">×</span>
                        <div className="flex-1">
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={item.rate}
                            onChange={(event) =>
                              updateItem(item.id, {
                                rate: Number(event.target.value),
                              })
                            }
                            className="border-transparent bg-background tabular-nums"
                            placeholder="Rate"
                            aria-label="Rate"
                          />
                        </div>
                        <div className="w-24 shrink-0 text-right text-sm font-medium tabular-nums">
                          {formatCurrency(amount)}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                          aria-label="Remove line item"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Payment instructions, terms, or a thank-you note"
              rows={3}
            />
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="border-border/70 p-6 shadow-none">
            <h2 className="text-base font-semibold tracking-tight">Summary</h2>
            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Tax ({taxRate || 0}%)
                </span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(tax)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border/70 pt-3 text-base">
                <span className="font-semibold">Total</span>
                <span className="font-semibold tabular-nums">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-3">
            <Button type="submit" className="gap-1.5">
              <Save className="size-4" />
              {isEditing ? "Save changes" : "Create invoice"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </>
  );
};

export default InvoiceForm;
