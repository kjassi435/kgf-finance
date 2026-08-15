import {
  dailySeries,
  monthlySeries,
  agentPerformance,
  paymentModeReport,
} from "@/lib/services/reports";
import { pendingCustomers } from "@/lib/services/customers";
import { listAgents } from "@/lib/services/agents";
import { formatCurrency } from "@/lib/id";
import { Card, PageHeader, Badge } from "@/components/ui";
import {
  DailyLineChart,
  MonthlyBarChart,
  AgentBarChart,
  ModePieChart,
} from "@/components/charts";

export default async function AnalyticsPage() {
  const [daily, monthly, agents, modes, pending, agentList] = await Promise.all([
    dailySeries(30),
    monthlySeries(12),
    agentPerformance(),
    paymentModeReport(),
    pendingCustomers(),
    listAgents(),
  ]);

  const agentMap: Record<string, string> = Object.fromEntries(
    agentList.map((a) => [a.id, `${a.name} (${a.agentId})`])
  );

  const best = daily.reduce(
    (m, d) => (d.amount > m.amount ? d : m),
    { date: "-", amount: 0 }
  );
  const worst = daily
    .filter((d) => d.amount > 0)
    .reduce((m, d) => (d.amount < m.amount ? d : m), { date: "-", amount: Infinity });

  const pendingByAgent = pending.reduce<Record<string, number>>((acc, c) => {
    acc[c.assignedAgentId || "unassigned"] =
      (acc[c.assignedAgentId || "unassigned"] || 0) + (Number(c.totalPending) || 0);
    return acc;
  }, {});
  const topPendingAgent = Object.entries(pendingByAgent).sort((a, b) => b[1] - a[1])[0];

  return (
    <div>
      <PageHeader title="Analytics & Insights" subtitle="Data-driven observations" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="text-xs uppercase text-slate-500">Best Day</div>
          <div className="text-lg font-bold text-green-600">{best.date}</div>
          <div className="text-sm">{formatCurrency(best.amount)}</div>
        </Card>
        <Card>
          <div className="text-xs uppercase text-slate-500">Lowest Day</div>
          <div className="text-lg font-bold text-amber-600">
            {worst.amount === Infinity ? "-" : worst.date}
          </div>
          <div className="text-sm">
            {worst.amount === Infinity ? "-" : formatCurrency(worst.amount)}
          </div>
        </Card>
        <Card>
          <div className="text-xs uppercase text-slate-500">Top Collector</div>
          <div className="text-lg font-bold text-indigo-600">
            {agents[0]?.agentName || "-"}
          </div>
          <div className="text-sm">{formatCurrency(agents[0]?.collected || 0)}</div>
        </Card>
        <Card>
          <div className="text-xs uppercase text-slate-500">Max Pending Agent</div>
          <div className="text-lg font-bold text-rose-600">
            {topPendingAgent ? agentMap[topPendingAgent[0]] || "unassigned" : "-"}
          </div>
          <div className="text-sm">
            {topPendingAgent ? formatCurrency(topPendingAgent[1]) : "-"}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-3">Daily Collection Trend</h3>
          <DailyLineChart data={daily} />
        </Card>
        <Card>
          <h3 className="font-semibold mb-3">Monthly Collection</h3>
          <MonthlyBarChart data={monthly} />
        </Card>
        <Card>
          <h3 className="font-semibold mb-3">Agent Performance</h3>
          <AgentBarChart data={agents} />
        </Card>
        <Card>
          <h3 className="font-semibold mb-3">Payment Mode</h3>
          <ModePieChart data={modes} />
        </Card>
      </div>
    </div>
  );
}
