import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Users, Mail, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";
import { ClientAvatar } from "@/components/clients/client-avatar";
import { EmptyState } from "@/components/common/empty-state";
import { useStore } from "@/lib/store";
import { clientTotals, isOverdue } from "@/lib/calc";
import { formatCurrency } from "@/lib/format";

const Clients = () => {
  const { clients, invoices } = useStore();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return clients;
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(normalized) ||
        client.contactName?.toLowerCase().includes(normalized) ||
        client.email.toLowerCase().includes(normalized),
    );
  }, [clients, query]);

  const hasClients = clients.length > 0;

  return (
    <>
      <PageHeader
        title="Clients"
        description="Keep contact details, notes, and per-client billing in one place."
        actions={
          <Button asChild size="sm" className="gap-1.5">
            <Link to="/clients/new">
              <Plus className="size-4" />
              Add client
            </Link>
          </Button>
        }
      />

      <div className="mt-6">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search clients…"
            className="h-9 pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="mt-4 border-border/70 shadow-none">
          <EmptyState
            className="py-16"
            icon={<Users className="size-6" />}
            title={hasClients ? "No matching clients" : "No clients yet"}
            description={
              hasClients
                ? "Try searching by name, contact, or email."
                : "Add a client to start sending them invoices."
            }
            action={
              hasClients ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery("")}
                >
                  Clear search
                </Button>
              ) : (
                <Button asChild size="sm">
                  <Link to="/clients/new">
                    <Plus className="size-4" />
                    Add client
                  </Link>
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((client) => {
            const totals = clientTotals(client, invoices);
            const clientInvoices = invoices.filter(
              (i) => i.clientId === client.id,
            );
            const overdueCount = clientInvoices.filter(isOverdue).length;

            return (
              <Card
                key={client.id}
                className="flex flex-col gap-4 border-border/70 p-5 shadow-none transition-shadow hover:shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <ClientAvatar name={client.name} />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/clients/${client.id}`}
                      className="block truncate font-medium text-foreground hover:text-primary"
                    >
                      {client.name}
                    </Link>
                    <p className="truncate text-sm text-muted-foreground">
                      {client.contactName ?? client.email}
                    </p>
                  </div>
                  {overdueCount > 0 ? (
                    <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                      {overdueCount} overdue
                    </span>
                  ) : null}
                </div>

                <div className="space-y-1.5 text-sm">
                  <a
                    href={`mailto:${client.email}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Mail className="size-3.5 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </a>
                  {client.phone ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="size-3.5 shrink-0" />
                      <span className="truncate">{client.phone}</span>
                    </div>
                  ) : null}
                </div>

                <div className="mt-auto grid grid-cols-3 gap-2 border-t border-border/70 pt-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Billed
                    </p>
                    <p className="mt-0.5 text-sm font-medium tabular-nums">
                      {formatCurrency(totals.totalBilled)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Paid
                    </p>
                    <p className="mt-0.5 text-sm font-medium tabular-nums">
                      {formatCurrency(totals.totalPaid)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Due
                    </p>
                    <p className="mt-0.5 text-sm font-medium tabular-nums text-foreground">
                      {formatCurrency(
                        totals.totalBilled - totals.totalPaid,
                      )}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
};

export default Clients;
