import { getCurrentUser } from "@/lib/session";
import { pendingCustomers } from "@/lib/services/customers";
import { formatCurrency } from "@/lib/id";
import { Card, PageHeader, Table, Badge } from "@/components/ui";

export default async function AgentPendingPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const rows = await pendingCustomers(user.id);
  const total = rows.reduce((s, r) => s + (Number(r.totalPending) || 0), 0);
  return (
    <div>
      <PageHeader
        title="Pending Customers"
        subtitle={`${rows.length} customers · ${formatCurrency(total)} due`}
      />
      <Card>
        <Table
          headers={[
            "Customer ID",
            "Name",
            "Mobile",
            "Daily",
            "Deposited",
            "Pending",
          ]}
        >
          {rows.map((c) => (
            <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-2 px-3 font-mono text-xs">{c.customerId}</td>
              <td className="py-2 px-3">{c.name}</td>
              <td className="py-2 px-3">{c.mobile}</td>
              <td className="py-2 px-3">{formatCurrency(c.dailyCollectionAmount)}</td>
              <td className="py-2 px-3">{formatCurrency(c.totalDeposited)}</td>
              <td className="py-2 px-3 text-rose-600 font-semibold">
                {formatCurrency(c.totalPending)}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-slate-400">
                No pending payments. 🎉
              </td>
            </tr>
          )}
        </Table>
      </Card>
    </div>
  );
}
