import { getCurrentUser } from "@/lib/session";
import { listCollections } from "@/lib/services/collections";
import { db } from "@/lib/db";
import { receipts } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { formatCurrency } from "@/lib/id";
import { Card, PageHeader, Table, Badge } from "@/components/ui";
import Pagination from "@/components/Pagination";

export default async function CustomerHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; page?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;
  const sp = await searchParams;
  const page = parseInt(sp.page || "1", 10) || 1;
  const pageSize = 50;
  const result = await listCollections({
    customerId: user.id,
    from: sp.from,
    to: sp.to,
    page,
    pageSize,
  });
  const cols = result.rows;
  const recs = await db
    .select()
    .from(receipts)
    .where(eq(receipts.customerId, user.id))
    .orderBy(desc(receipts.generatedAt));
  const recByColl = new Map(recs.map((r) => [r.collectionId, r]));
  const totalPages = Math.max(1, Math.ceil(result.total / pageSize));
  const queryString = [sp.from && `from=${sp.from}`, sp.to && `to=${sp.to}`]
    .filter(Boolean)
    .join("&");

  return (
    <div>
      <PageHeader title="Payment History" subtitle={`${result.total} payments`} />
      <Card>
        <Table
          headers={["Date", "Collection ID", "Amount", "Mode", "Ref", "Receipt"]}
        >
          {cols.map((r) => (
            <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-2 px-3">{r.date}</td>
              <td className="py-2 px-3 font-mono text-xs">{r.collectionId}</td>
              <td className="py-2 px-3 font-semibold">{formatCurrency(r.amount)}</td>
              <td className="py-2 px-3">
                <Badge tone="blue">{r.paymentMode}</Badge>
              </td>
              <td className="py-2 px-3">{r.transactionRef || "-"}</td>
              <td className="py-2 px-3">
                {recByColl.get(r.id) ? (
                  <a
                    href={`/customer/receipts/${recByColl.get(r.id)!.id}`}
                    className="text-indigo-600 hover:underline text-sm"
                  >
                    View
                  </a>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
          {cols.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-slate-400">
                No payments yet.
              </td>
            </tr>
          )}
        </Table>
      </Card>
      <Pagination page={page} totalPages={totalPages} queryString={queryString} />
    </div>
  );
}
