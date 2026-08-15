import {
  getDashboardStats,
  dailySeries,
  monthlySeries,
  agentPerformance,
  paymentModeReport,
} from "@/lib/services/reports";
import { listCustomers } from "@/lib/services/customers";
import { pendingCustomers } from "@/lib/services/customers";
import { formatCurrency } from "@/lib/id";
import { Card, StatCard, PageHeader } from "@/components/ui";
import {
  DailyLineChart,
  MonthlyBarChart,
  AgentBarChart,
  ModePieChart,
  CustomerBarChart,
} from "@/components/charts";
import DashboardRange from "@/components/DashboardRange";
import { Suspense } from "react";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const sp = await searchParams;
  const range = sp.range || "30";
  const days = range === "12m" ? 30 : parseInt(range, 10);

  const [stats, daily, monthly, agents, modes, allCustomers, pending] =
    await Promise.all([
      getDashboardStats(),
      dailySeries(days),
      monthlySeries(12),
      agentPerformance(),
      paymentModeReport(),
      listCustomers({ limit: 5000 }),
      pendingCustomers(),
    ]);

  const topDepositors = allCustomers
    .slice()
    .sort((a, b) => Number(b.totalDeposited) - Number(a.totalDeposited))
    .slice(0, 8)
    .map((c) => ({ name: c.name, amount: Number(c.totalDeposited) || 0 }));

  const topPending = pending
    .slice(0, 8)
    .map((c) => ({ name: c.name, amount: Number(c.totalPending) || 0 }));

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Overall collection overview"
        action={
          <Suspense fallback={null}>
            <DashboardRange />
          </Suspense>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Customers" value={stats.totalCustomers} accent="blue" />
        <StatCard label="Active Customers" value={stats.activeCustomers} accent="green" />
        <StatCard label="Total Agents" value={stats.totalAgents} accent="indigo" />
        <StatCard label="Today's Collection" value={formatCurrency(stats.todayCollection)} accent="green" />
        <StatCard label="Monthly Collection" value={formatCurrency(stats.monthlyCollection)} accent="indigo" />
        <StatCard label="Total Collection" value={formatCurrency(stats.totalCollection)} accent="blue" />
        <StatCard label="Pending Collection" value={formatCurrency(stats.pendingCollection)} accent="red" />
        <StatCard label="Today's Pending" value={stats.todayPendingCustomers} accent="amber" sub="customers" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-3">
            Daily Collection ({range === "12m" ? "30 days" : `${range} days`})
          </h3>
          <DailyLineChart data={daily} />
        </Card>
        <Card>
          <h3 className="font-semibold mb-3">Monthly Collection (12 months)</h3>
          <MonthlyBarChart data={monthly} />
        </Card>
        <Card>
          <h3 className="font-semibold mb-3">Agent Performance</h3>
          <AgentBarChart data={agents} />
        </Card>
        <Card>
          <h3 className="font-semibold mb-3">Payment Mode Split</h3>
          <ModePieChart data={modes} />
        </Card>
        <Card>
          <h3 className="font-semibold mb-3">Customer Payment Trend (Top Depositors)</h3>
          <CustomerBarChart data={topDepositors} />
        </Card>
        <Card>
          <h3 className="font-semibold mb-3">Pending Payment (Top Dues)</h3>
          <CustomerBarChart data={topPending} />
        </Card>
      </div>
    </div>
  );
}
