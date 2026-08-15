import { getCurrentUser } from "@/lib/session";
import {
  getDashboardStats,
  dailySeries,
  monthlySeries,
} from "@/lib/services/reports";
import { customersOfAgent } from "@/lib/services/agents";
import { formatCurrency, todayISODate } from "@/lib/id";
import { Card, StatCard, PageHeader } from "@/components/ui";
import { DailyLineChart, MonthlyBarChart } from "@/components/charts";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { collections } from "@/lib/schema";
import { sql } from "drizzle-orm";

export default async function AgentDashboard() {
  const user = await getCurrentUser();
  if (!user) return null;
  const agentId = user.id;

  const [stats, daily, monthly, assigned] = await Promise.all([
    getDashboardStats(agentId),
    dailySeries(30, agentId),
    monthlySeries(12, agentId),
    customersOfAgent(agentId),
  ]);

  const target = assigned
    .filter((c) => c.accountStatus === "active")
    .reduce((s, c) => s + (Number(c.dailyCollectionAmount) || 0), 0);

  const [todayRow] = await db
    .select({ sum: sql<number>`coalesce(sum(${collections.amount}),0)` })
    .from(collections)
    .where(
      and(
        eq(collections.agentId, agentId),
        eq(collections.date, todayISODate())
      )
    );

  const todayCol = Number(todayRow?.sum) || 0;

  return (
    <div>
      <PageHeader title={`Welcome, ${user.name}`} subtitle="Your collection summary" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Assigned Customers" value={stats.activeCustomers} accent="blue" />
        <StatCard label="Today's Target" value={formatCurrency(target)} accent="indigo" />
        <StatCard label="Today's Collection" value={formatCurrency(todayCol)} accent="green" />
        <StatCard
          label="Today's Pending"
          value={formatCurrency(Math.max(0, target - todayCol))}
          accent="amber"
        />
        <StatCard label="Monthly Collection" value={formatCurrency(stats.monthlyCollection)} accent="indigo" />
        <StatCard label="Total Collection" value={formatCurrency(stats.totalCollection)} accent="blue" />
        <StatCard label="Pending Customers" value={stats.todayPendingCustomers} accent="red" />
        <StatCard label="My Pending Dues" value={formatCurrency(stats.pendingCollection)} accent="red" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-3">My Daily Collection</h3>
          <DailyLineChart data={daily} />
        </Card>
        <Card>
          <h3 className="font-semibold mb-3">My Monthly Collection</h3>
          <MonthlyBarChart data={monthly} />
        </Card>
      </div>
    </div>
  );
}
