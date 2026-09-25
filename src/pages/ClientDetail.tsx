import { useMemo } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Pencil,
  Trash2,
  Plus,
  StickyNote,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { ClientAvatar } from "@/components/clients/client-avatar";
import { InvoiceRow } from "@/components/invoices/invoice-row";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { useStore } from "@/lib/store";
import { clientTotals, isOverdue } from "@/lib/calc";
import { formatCurrency, formatDate } from "@/lib/format";

const ClientDetail = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { clients, invoices, deleteClient } = useStore();

  const client = clients.find((c) => c.id === clientId);

  const clientInvoices = useMemo(
    () =>
      invoices.filter((invoice) => invoice.clientId === clientId),
    [invoices, clientId],
  );

  const totals = useMemo(
    () => (client ? clientTotals(client, invoices) : null),
    [client, invoices],
  );

  if (!client || !totals) {
    return (
      <Card className="mt-6 border-border/70 shadow-none">
        <EmptyState
          className="py-16"
          title="Client not found"
          description="This client may have been removed."
          action={
            <Button asChild size="sm">
              <Link to="/clients">Back to clients</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  const overdueCount = clientInvoices.filter(isOverdue).length;
  const outstanding = totals.totalBilled - totals.totalPaid;

  const handleDelete = () => {
    const name = client.name;
    deleteClient(client.id);
    toast.success(`${name} removed, along with their invoices`);
    navigate("/clients");
  };

  return (
    <>
      <PageHeader
        title={client.name}
        description={`Client since ${formatDate(client.createdAt)}`}
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
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to={`/clients/${client.id}/edit`}>
                <Pencil className="size-4" />
                Edit
              </Link>
            </Button>
            <ConfirmDialog
              title={`Delete ${client.name}?`}
              description={`This removes ${client.name} and all ${clientInvoices.length} of their invoices. This cannot be undone.`}
              confirmLabel="Delete client"
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

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-border/70 p-6 shadow-none">
          <div className="flex items-center gap-3">
            <ClientAvatar name={client.name} className="size-12 text-base" />
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold tracking-tight">
                {client.name}
              </h2>
              <p className="truncate text-sm text-muted-foreground">
                {client.contactName ?? "No contact named"}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3 text-sm">
            <a
              href={`mailto:${client.email}`}
              className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground"
            >
              <Mail className="size-4 shrink-0" />
              <span className="truncate">{client.email}</span>
            </a>
            {client.phone ? (
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Phone className="size-4 shrink-0" />
                <span className="truncate">{client.phone}</span>
              </div>
            ) : null}
            {client.address ? (
              <div className="flex items-start gap-2.5 text-muted-foreground">
                <MapPin className="size-4 shrink-0 translate-y-0.5" />
                <span className="whitespace-pre-line">{client.address}</span>
              </div>
            ) : null}
          </div>

          {client.notes ? (
            <div className="mt-5 border-t border-border/70 pt-5">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <StickyNote className="size-3.5" />
                Notes
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                {client.notes}
              </p>
            </div>
          ) : null}
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          <StatTile label="Total billed" value={formatCurrency(totals.totalBilled)} />
          <StatTile label="Total paid" value={formatCurrency(totals.totalPaid)} />
          <StatTile
            label="Outstanding"
            value={formatCurrency(outstanding)}
            accent={outstanding > 0 ? "warning" : undefined}
          />
          <StatTile
            label="Invoices"
            value={String(totals.invoiceCount)}
            hint={`${totals.paidCount} paid${overdueCount ? ` · ${overdueCount} overdue` : ""}`}
          />
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Invoices for {client.name}
          </h2>
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link to={`/invoices/new?clientId=${client.id}`}>
              <Plus className="size-4" />
              New invoice
            </Link>
          </Button>
        </div>

        <Card className="mt-4 overflow-hidden border-border/70 p-0 shadow-none">
          {clientInvoices.length === 0 ? (
            <EmptyState
              className="py-14"
              title="No invoices yet"
              description={`You haven't invoiced ${client.name} yet. Start with a new invoice.`}
              action={
                <Button asChild size="sm">
                  <Link to={`/invoices/new?clientId=${client.id}`}>
                    <Plus className="size-4" />
                    New invoice
                  </Link>
                </Button>
              }
            />
          ) : (
            <div className="scrollbar-thin divide-y divide-border/70 overflow-x-auto">
              {clientInvoices.map((invoice) => (
                <InvoiceRow
                  key={invoice.id}
                  invoice={invoice}
                  clients={clients}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
};

const StatTile = ({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "warning";
}) => (
  <Card className="flex flex-col justify-between gap-2 border-border/70 p-5 shadow-none">
    <span className="text-sm font-medium text-muted-foreground">{label}</span>
    <span
      className={
        accent === "warning"
          ? "text-2xl font-semibold tabular-nums text-foreground"
          : "text-2xl font-semibold tabular-nums text-foreground"
      }
    >
      {value}
    </span>
    {hint ? (
      <span className="text-xs text-muted-foreground">{hint}</span>
    ) : null}
  </Card>
);

export default ClientDetail;
