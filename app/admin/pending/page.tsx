import { pendingCustomers } from "@/lib/services/customers";
import { listAgents } from "@/lib/services/agents";
import { formatCurrency } from "@/lib/id";
import { Card, PageHeader, Table, Badge } from "@/components/ui";

export default async function PendingPage() {
  const [rows, agents] = await Promise.all([pendingCustomers(), listAgents()]);
  const agentMap: Record<string, string> = Object.fromEntries(
    agents.map((a) => [a.id, `${a.name} (${a.agentId})`])
  );
  const total = rows.reduce((s, r) => s + (Number(r.totalPending) || 0), 0);
  return (
    <div>
      <PageHeader
        title="Pending Payments"
        subtitle={`${rows.length} customers with dues · ${formatCurrency(total)} total`}
      />
      <Card>
        <Table
          headers={[
            "Customer ID",
            "Name",
            "Mobile",
            "Agent",
            "Daily",
            "Deposited",
            "Pending",
            "Status",
          ]}
        >
          {rows.map((c) => (
            <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-2 px-3 font-mono text-xs">{c.customerId}</td>
              <td className="py-2 px-3">{c.name}</td>
              <td className="py-2 px-3">{c.mobile}</td>
              <td className="py-2 px-3 text-xs">{agentMap[c.assignedAgentId || ""] || "—"}</td>
              <td className="py-2 px-3">{formatCurrency(c.dailyCollectionAmount)}</td>
              <td className="py-2 px-3">{formatCurrency(c.totalDeposited)}</td>
              <td className="py-2 px-3 text-rose-600 font-semibold">
                {formatCurrency(c.totalPending)}
              </td>
              <td className="py-2 px-3">
                <Badge tone="amber">pending</Badge>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={8} className="py-6 text-center text-slate-400">
                No pending payments. 🎉
              </td>
            </tr>
          )}
        </Table>
      </Card>
    </div>
  );
}
