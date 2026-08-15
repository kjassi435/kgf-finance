import { getCurrentUser } from "@/lib/session";
import { listCustomers, countCustomers } from "@/lib/services/customers";
import { formatCurrency } from "@/lib/id";
import { Card, PageHeader, Table, Badge } from "@/components/ui";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";

export default async function AgentCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;
  const sp = await searchParams;
  const page = parseInt(sp.page || "1", 10) || 1;
  const pageSize = 50;
  const [rows, total] = await Promise.all([
    listCustomers({ agentId: user.id, search: sp.search, page, pageSize }),
    countCustomers({ agentId: user.id, search: sp.search }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const queryString = sp.search ? `search=${sp.search}` : "";

  return (
    <div>
      <PageHeader title="My Customers" subtitle={`${total} assigned`} />
      <div className="mb-4">
        <SearchBar basePath="/agent/customers" placeholder="Search customers..." />
      </div>
      <Card>
        <Table
          headers={[
            "Customer ID",
            "Name",
            "Mobile",
            "Plan",
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
              <td className="py-2 px-3">{c.planType}</td>
              <td className="py-2 px-3">{formatCurrency(c.dailyCollectionAmount)}</td>
              <td className="py-2 px-3">{formatCurrency(c.totalDeposited)}</td>
              <td className="py-2 px-3 text-rose-600">{formatCurrency(c.totalPending)}</td>
              <td className="py-2 px-3">
                <Badge tone={c.accountStatus === "active" ? "green" : "red"}>
                  {c.accountStatus}
                </Badge>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={8} className="py-6 text-center text-slate-400">
                No customers assigned yet.
              </td>
            </tr>
          )}
        </Table>
      </Card>
      <Pagination page={page} totalPages={totalPages} queryString={queryString} />
    </div>
  );
}
