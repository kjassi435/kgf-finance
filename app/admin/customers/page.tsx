import { listCustomers, countCustomers } from "@/lib/services/customers";
import { listAgents } from "@/lib/services/agents";
import { formatCurrency } from "@/lib/id";
import { Card, PageHeader, Button, Badge, Table } from "@/components/ui";
import CustomersToolbar from "@/components/CustomersToolbar";
import { CustomerRowActions } from "@/components/CustomerRowActions";
import Pagination from "@/components/Pagination";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    agentId?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const page = parseInt(sp.page || "1", 10) || 1;
  const pageSize = 50;
  const [rows, total, agents] = await Promise.all([
    listCustomers({
      search: sp.search,
      status: sp.status,
      agentId: sp.agentId,
      page,
      pageSize,
    }),
    countCustomers({ search: sp.search, status: sp.status, agentId: sp.agentId }),
    listAgents(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const queryString = [
    sp.search && `search=${sp.search}`,
    sp.status && `status=${sp.status}`,
    sp.agentId && `agentId=${sp.agentId}`,
  ]
    .filter(Boolean)
    .join("&");

  const agentMap: Record<string, string> = Object.fromEntries(
    agents.map((a) => [a.id, `${a.name} (${a.agentId})`])
  );

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle={`${total} customers`}
        action={<Button href="/admin/customers/new">+ Add Customer</Button>}
      />
      <div className="mb-4">
        <CustomersToolbar
          agents={agents.map((a) => ({ id: a.id, name: a.name, agentId: a.agentId }))}
        />
      </div>

      <Card>
        <Table
          headers={[
            "Customer ID",
            "Name",
            "Mobile",
            "Agent",
            "Plan",
            "Daily",
            "Deposited",
            "Pending",
            "Status",
            "Actions",
          ]}
        >
          {rows.map((c) => (
            <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-2 px-3 font-mono text-xs">{c.customerId}</td>
              <td className="py-2 px-3">{c.name}</td>
              <td className="py-2 px-3">{c.mobile}</td>
              <td className="py-2 px-3 text-xs">{agentMap[c.assignedAgentId || ""] || "—"}</td>
              <td className="py-2 px-3">{c.planType}</td>
              <td className="py-2 px-3">{formatCurrency(c.dailyCollectionAmount)}</td>
              <td className="py-2 px-3">{formatCurrency(c.totalDeposited)}</td>
              <td className="py-2 px-3 text-rose-600">{formatCurrency(c.totalPending)}</td>
              <td className="py-2 px-3">
                <Badge tone={c.accountStatus === "active" ? "green" : "red"}>
                  {c.accountStatus}
                </Badge>
              </td>
              <td className="py-2 px-3">
                <CustomerRowActions id={c.id} />
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={10} className="py-6 text-center text-slate-400">
                No customers found.
              </td>
            </tr>
          )}
        </Table>
      </Card>
      <Pagination page={page} totalPages={totalPages} queryString={queryString} />
    </div>
  );
}
