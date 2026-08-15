import { getCurrentUser } from "@/lib/session";
import { listCollections } from "@/lib/services/collections";
import { customersOfAgent } from "@/lib/services/agents";
import { formatCurrency } from "@/lib/id";
import { Card, PageHeader, Table, Badge } from "@/components/ui";
import HistoryToolbar from "@/components/HistoryToolbar";
import Pagination from "@/components/Pagination";
import { Suspense } from "react";

export default async function AgentHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; page?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;
  const sp = await searchParams;
  const page = parseInt(sp.page || "1", 10) || 1;
  const pageSize = 50;
  const [result, custRows] = await Promise.all([
    listCollections({ agentId: user.id, from: sp.from, to: sp.to, page, pageSize }),
    customersOfAgent(user.id),
  ]);
  const rows = result.rows;
  const totalPages = Math.max(1, Math.ceil(result.total / pageSize));
  const queryString = [sp.from && `from=${sp.from}`, sp.to && `to=${sp.to}`]
    .filter(Boolean)
    .join("&");
  const custMap: Record<string, string> = Object.fromEntries(
    custRows.map((c) => [c.id, c.name])
  );

  return (
    <div className="space-y-4">
      <PageHeader title="Collection History" subtitle={`${result.total} entries`} />
      <Suspense fallback={null}>
        <HistoryToolbar />
      </Suspense>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-xs uppercase text-slate-500">Total Collected</div>
          <div className="text-xl font-bold text-indigo-600">
            {formatCurrency(rows.reduce((s, r) => s + Number(r.amount), 0))}
          </div>
        </Card>
        <Card>
          <div className="text-xs uppercase text-slate-500">Entries</div>
          <div className="text-xl font-bold">{result.total}</div>
        </Card>
      </div>
      <Card>
        <Table
          headers={[
            "Date",
            "Collection ID",
            "Customer",
            "Amount",
            "Mode",
            "Ref",
            "Receipt",
          ]}
        >
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-2 px-3">{r.date}</td>
              <td className="py-2 px-3 font-mono text-xs">{r.collectionId}</td>
              <td className="py-2 px-3 text-xs">
                {custMap[r.customerId] || r.customerId}
              </td>
              <td className="py-2 px-3 font-semibold">{formatCurrency(r.amount)}</td>
              <td className="py-2 px-3">
                <Badge tone="blue">{r.paymentMode}</Badge>
              </td>
              <td className="py-2 px-3">{r.transactionRef || "-"}</td>
              <td className="py-2 px-3">
                <a
                  href={`/agent/history/${r.id}/receipt`}
                  className="text-indigo-600 hover:underline text-sm"
                >
                  Receipt
                </a>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="py-6 text-center text-slate-400">
                No collections yet.
              </td>
            </tr>
          )}
        </Table>
      </Card>
      <Pagination page={page} totalPages={totalPages} queryString={queryString} />
    </div>
  );
}
