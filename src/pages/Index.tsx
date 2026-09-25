import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Users,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MonthlyRevenueChart } from "@/components/charts/monthly-revenue-chart";
import { OverduePanel } from "@/components/dashboard/overdue-panel";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { useStore } from "@/lib/store";
import { formatCurrency } from "@/lib/format";
import {
  effectiveStatus,
  invoiceBalance,
  invoicePaid,
  invoiceTotal,
  isOverdue,
} from "@/lib/calc";

const Index = () => {
  const { invoices, clients, business } = useStore();

  const stats = useMemo(() => {
    let totalRevenue = 0;
    let outstanding = 0;
    let overdueAmount = 0;
    let paidCount = 0;
    let lastMonthRevenue = 0;

    for (const invoice of invoices) {
      const paid = invoicePaid(invoice);
      const month = invoice.issueDate.slice(0, 7);
      const status = effectiveStatus(invoice);

      totalRevenue += paid;
      if (status !== "paid") outstanding += invoiceBalance(invoice);
      if (isOverdue(invoice)) overdueAmount += invoiceBalance(invoice);
      if (status === "paid") paidCount += 1;
      if (status === "paid" && month === lastMonthKey()) {
        lastMonthRevenue += paid;
      }
    }

    const payingClients = new Set(
      invoices.filter((i) => invoicePaid(i) > 0).map((i) => i.clientId),
    ).size;

    return {
      totalRevenue,
      outstanding,
      overdueAmount,
      paidCount,
      payingClients,
      lastMonthRevenue,
      collectionRate:
        totalRevenue + outstanding > 0
          ? (totalRevenue / (totalRevenue + outstanding)) * 100
          : 100,
    };
  }, [invoices]);

  const monthlyData = useMemo(() => {
    const buckets = new Map<string, { revenue: number; label: string }>();

    for (const invoice of invoices) {
      const key = invoice.issueDate.slice(0, 7);
      const [year, month] = key.split("-");
      const label = new Date(
        Number(year),
        Number(month) - 1,
        1,
      ).toLocaleDateString("en-US", { month: "short" });

      const existing = buckets.get(key) ?? { revenue: 0, label };
      existing.revenue += invoicePaid(invoice);
      buckets.set(key, existing);
    }

    // Always render a trailing 6-month window, padding empty months with 0.
    const now = new Date();
    const window: { month: string; label: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short" });
      window.push({
        month: key,
        label,
        revenue: buckets.get(key)?.revenue ?? 0,
      });
    }

    return window;
  }, [invoices]);

  const overdueCount = invoices.filter(isOverdue).length;
  const displayName = business.name.split(" ")[0];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${displayName}`}
        description="Here's how your freelance business is doing this month."
        actions={
          <Button asChild size="sm" className="gap-1.5">
            <Link to="/invoices/new">
              <FileText className="size-4" />
              New invoice
            </Link>
          </Button>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Revenue collected"
          value={formatCurrency(stats.totalRevenue)}
          icon={<DollarSign className="size-4" />}
          accent="primary"
          hint={
            <span>
              {stats.lastMonthRevenue > 0
                ? `${formatCurrency(stats.lastMonthRevenue)} collected last month`
                : "Lifetime collected"}
            </span>
          }
        />
        <KpiCard
          label="Outstanding"
          value={formatCurrency(stats.outstanding)}
          icon={<Clock className="size-4" />}
          accent="warning"
          hint={
            <span>
              {invoices.filter((i) => effectiveStatus(i) !== "paid").length}{" "}
              unpaid invoices
            </span>
          }
        />
        <KpiCard
          label="Overdue"
          value={formatCurrency(stats.overdueAmount)}
          icon={<AlertTriangle className="size-4" />}
          accent="destructive"
          hint={
            overdueCount > 0 ? (
              <span>{overdueCount} need reminders</span>
            ) : (
              <span>Nothing past due</span>
            )
          }
        />
        <KpiCard
          label="Collection rate"
          value={`${stats.collectionRate.toFixed(0)}%`}
          icon={<CheckCircle2 className="size-4" />}
          accent="success"
          hint={
            <span>
              {stats.paidCount} paid · {stats.payingClients} paying clients
            </span>
          }
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-border/70 p-5 shadow-none sm:p-6 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold tracking-tight">
                Monthly revenue
              </h2>
              <p className="text-xs text-muted-foreground">
                Payments received by issue month, last 6 months
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-2 rounded-full bg-primary" />
              Revenue
            </div>
          </div>
          <MonthlyRevenueChart
            data={monthlyData}
            className="mt-4 aspect-[16/7] w-full"
          />
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="border-border/70 p-5 shadow-none sm:p-6">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-primary">
                <Users className="size-4" />
              </span>
              <div>
                <h2 className="text-base font-semibold tracking-tight">
                  Clients
                </h2>
                <p className="text-xs text-muted-foreground">
                  {clients.length} total in your roster
                </p>
              </div>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="mt-4 w-full justify-between"
            >
              <Link to="/clients">
                Manage clients
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </Card>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <OverduePanel />
        <RecentActivity />
      </div>
    </>
  );
};

const lastMonthKey = (): string => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export default Index;
