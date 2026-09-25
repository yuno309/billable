import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FileText, Plus, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/page-header";
import { InvoiceRow } from "@/components/invoices/invoice-row";
import { EmptyState } from "@/components/common/empty-state";
import { useStore } from "@/lib/store";
import {
  effectiveStatus,
  invoiceTotal,
  isOverdue,
} from "@/lib/calc";
import { formatCurrency } from "@/lib/format";

type StatusFilter = "all" | "overdue" | "sent" | "paid" | "draft";

const filterValues: StatusFilter[] = ["all", "overdue", "sent", "paid", "draft"];

const Invoices = () => {
  const { invoices, clients } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");

  const activeFilter = (searchParams.get("filter") as StatusFilter) ?? "all";

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return invoices
      .filter((invoice) => {
        if (activeFilter === "all") return true;
        if (activeFilter === "overdue") return isOverdue(invoice);
        return effectiveStatus(invoice) === activeFilter;
      })
      .filter((invoice) => {
        if (!normalized) return true;
        const client = clients.find((c) => c.id === invoice.clientId);
        return (
          invoice.number.toLowerCase().includes(normalized) ||
          client?.name.toLowerCase().includes(normalized) ||
          client?.contactName?.toLowerCase().includes(normalized)
        );
      })
      .sort((a, b) => {
        if (isOverdue(a) !== isOverdue(b)) return isOverdue(a) ? -1 : 1;
        return b.issueDate.localeCompare(a.issueDate);
      });
  }, [invoices, clients, activeFilter, query]);

  const totals = useMemo(() => {
    let outstanding = 0;
    let overdue = 0;
    for (const invoice of invoices) {
      if (effectiveStatus(invoice) === "paid") continue;
      const balance = invoiceTotal(invoice);
      outstanding += balance;
      if (isOverdue(invoice)) overdue += balance;
    }
    return { outstanding, overdue };
  }, [invoices]);

  const setFilter = (value: string) => {
    if (value === "all") {
      searchParams.delete("filter");
    } else {
      searchParams.set("filter", value);
    }
    setSearchParams(searchParams);
  };

  const hasInvoices = invoices.length > 0;

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Track every invoice from draft to paid, and chase what's overdue."
        actions={
          <Button asChild size="sm" className="gap-1.5">
            <Link to="/invoices/new">
              <Plus className="size-4" />
              New invoice
            </Link>
          </Button>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search number or client…"
            className="h-9 pl-9"
          />
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <SlidersHorizontal className="size-4" />
          <span className="tabular-nums">
            {formatCurrency(totals.outstanding)} outstanding
          </span>
          {totals.overdue > 0 ? (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 font-medium text-destructive tabular-nums">
              {formatCurrency(totals.overdue)} overdue
            </span>
          ) : null}
        </div>
      </div>

      <Tabs
        value={activeFilter}
        onValueChange={setFilter}
        className="mt-4"
      >
        <TabsList>
          {filterValues.map((value) => (
            <TabsTrigger key={value} value={value} className="capitalize">
              {value}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="mt-4 overflow-hidden border-border/70 p-0 shadow-none">
        {filtered.length === 0 ? (
          <EmptyState
            className="py-16"
            icon={<FileText className="size-6" />}
            title={
              hasInvoices ? "No matching invoices" : "No invoices yet"
            }
            description={
              hasInvoices
                ? "Try a different search term or status filter."
                : "Create your first invoice to start tracking payments."
            }
            action={
              hasInvoices ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuery("");
                    setFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Button asChild size="sm">
                  <Link to="/invoices/new">
                    <Plus className="size-4" />
                    New invoice
                  </Link>
                </Button>
              )
            }
          />
        ) : (
          <div className="flex flex-col">
            <div className="hidden items-center gap-4 border-b border-border/70 bg-secondary/40 px-5 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:flex">
              <span className="min-w-0 flex-1">Invoice</span>
              <span className="min-w-0 flex-1">Contact</span>
              <span className="w-28 shrink-0 text-right">Total</span>
              <span className="w-28 shrink-0 text-right">Due</span>
              <span className="w-32 shrink-0 text-right">Status</span>
              <span className="hidden w-28 shrink-0 text-right lg:block">
                Balance
              </span>
            </div>
            <div className="scrollbar-thin divide-y divide-border/70 overflow-x-auto">
              {filtered.map((invoice) => (
                <InvoiceRow
                  key={invoice.id}
                  invoice={invoice}
                  clients={clients}
                />
              ))}
            </div>
          </div>
        )}
      </Card>
    </>
  );
};

export default Invoices;
