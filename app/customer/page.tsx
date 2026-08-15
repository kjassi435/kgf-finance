import { getCurrentUser } from "@/lib/session";
import { listCollections } from "@/lib/services/collections";
import { db } from "@/lib/db";
import { agents } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { formatCurrency } from "@/lib/id";
import { Card, StatCard, PageHeader, Badge } from "@/components/ui";

export default async function CustomerDashboard() {
  const user = await getCurrentUser();
  if (!user) return null;
  const c = user.record;
  const { rows: cols } = await listCollections({
    customerId: user.id,
    pageSize: 1000,
  });
  const agent = c.assignedAgentId
    ? await db.query.agents.findFirst({ where: eq(agents.id, c.assignedAgentId) })
    : null;
  const total = cols.reduce((s, r) => s + Number(r.amount), 0);
  const last = cols[0];

  return (
    <div>
      <PageHeader title={`Hello, ${c.name}`} subtitle={`Customer ID: ${c.customerId}`} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Daily Amount" value={formatCurrency(c.dailyCollectionAmount)} accent="indigo" />
        <StatCard label="Total Deposited" value={formatCurrency(c.totalDeposited)} accent="green" />
        <StatCard label="Total Pending" value={formatCurrency(c.totalPending)} accent="red" />
        <StatCard label="Status" value={<Badge tone={c.accountStatus === "active" ? "green" : "red"}>{c.accountStatus}</Badge>} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-3">Account Summary</h3>
          <div className="space-y-2 text-sm">
            <Row label="Assigned Agent" value={agent?.name || "Not assigned"} />
            <Row label="Plan Type" value={c.planType} />
            <Row label="Frequency" value={c.collectionFrequency} />
            <Row label="Registration Date" value={c.registrationDate || "-"} />
            <Row label="Total Payments" value={String(cols.length)} />
            <Row label="Last Payment" value={last ? `${formatCurrency(last.amount)} on ${last.date}` : "No payments yet"} />
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold mb-3">Recent Payments</h3>
          <div className="space-y-2 text-sm">
            {cols.slice(0, 6).map((r) => (
              <div key={r.id} className="flex justify-between border-b border-slate-100 py-2">
                <span>{r.date}</span>
                <span className="font-semibold">{formatCurrency(r.amount)}</span>
                <span className="text-slate-400">{r.paymentMode}</span>
              </div>
            ))}
            {cols.length === 0 && <div className="text-slate-400">No payments yet.</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b border-slate-100 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
