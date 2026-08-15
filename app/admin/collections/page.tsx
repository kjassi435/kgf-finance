import { listCollections } from "@/lib/services/collections";
import { listAgents } from "@/lib/services/agents";
import { listCustomers } from "@/lib/services/customers";
import { formatCurrency } from "@/lib/id";
import { Card, PageHeader, Button, Badge, Table } from "@/components/ui";
import CollectionsToolbar from "@/components/CollectionsToolbar";
import Pagination from "@/components/Pagination";

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string;
    to?: string;
    agentId?: string;
    paymentMode?: string;
    search?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const page = parseInt(sp.page || "1", 10) || 1;
  const pageSize = 50;
  const [result, agents, custRows] = await Promise.all([
    listCollections({
      from: sp.from,
      to: sp.to,
      agentId: sp.agentId,
      paymentMode: sp.paymentMode,
      search: sp.search,
      page,
      pageSize,
    }),
    listAgents(),
    listCustomers({ limit: 5000 }),
  ]);
  const rows = result.rows;
  const totalPages = Math.max(1, Math.ceil(result.total / pageSize));
  const queryString = [
    sp.from && `from=${sp.from}`,
    sp.to && `to=${sp.to}`,
    sp.agentId && `agentId=${sp.agentId}`,
    sp.paymentMode && `paymentMode=${sp.paymentMode}`,
    sp.search && `search=${sp.search}`,
  ]
    .filter(Boolean)
    .join("&");

  const agentMap: Record<string, string> = Object.fromEntries(
    agents.map((a) => [a.id, `${a.name} (${a.agentId})`])
  );
  const custMap: Record<string, { name: string; code: string }> = Object.fromEntries(
    custRows.map((c) => [c.id, { name: c.name, code: c.customerId }])
  );

  return (
    <div>
      <PageHeader
        title="Collections"
        subtitle={`${result.total} entries`}
        action={<Button href="/admin/collections/new">+ Add Collection</Button>}
      />

      <div className="mb-4">
        <CollectionsToolbar
          agents={agents.map((a) => ({ id: a.id, name: a.name, agentId: a.agentId }))}
        />
      </div>

      <Card>
        <Table
          headers={[
            "Collection ID",
            "Date",
            "Customer",
            "Agent",
            "Amount",
            "Mode",
            "Ref",
            "Receipt",
          ]}
        >
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-2 px-3 font-mono text-xs">{r.collectionId}</td>
              <td className="py-2 px-3">{r.date}</td>
              <td className="py-2 px-3 text-xs">
                {custMap[r.customerId]
                  ? `${custMap[r.customerId].name} (${custMap[r.customerId].code})`
                  : r.customerId}
              </td>
              <td className="py-2 px-3 text-xs">{agentMap[r.agentId] || r.agentId}</td>
              <td className="py-2 px-3 font-semibold">{formatCurrency(r.amount)}</td>
              <td className="py-2 px-3">
                <Badge tone="blue">{r.paymentMode}</Badge>
              </td>
              <td className="py-2 px-3">{r.transactionRef || "-"}</td>
              <td className="py-2 px-3">
                <a
                  href={`/admin/collections/${r.id}/receipt`}
                  className="text-indigo-600 hover:underline text-sm"
                >
                  View
                </a>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={8} className="py-6 text-center text-slate-400">
                No collections found.
              </td>
            </tr>
          )}
        </Table>
      </Card>
      <Pagination page={page} totalPages={totalPages} queryString={queryString} />
    </div>
  );
}
