import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { receipts } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { formatCurrency } from "@/lib/id";
import { Card, PageHeader, Table } from "@/components/ui";

export default async function CustomerReceiptsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const recs = await db
    .select()
    .from(receipts)
    .where(eq(receipts.customerId, user.id))
    .orderBy(desc(receipts.generatedAt));
  return (
    <div>
      <PageHeader title="My Receipts" subtitle={`${recs.length} receipts`} />
      <Card>
        <Table headers={["Receipt No", "Date", "Amount", "Prev Balance", "Current Balance", "Action"]}>
          {recs.map((r) => (
            <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-2 px-3 font-mono text-xs">{r.receiptNumber}</td>
              <td className="py-2 px-3">{r.generatedAt?.slice(0, 10)}</td>
              <td className="py-2 px-3 font-semibold">{formatCurrency(r.amount)}</td>
              <td className="py-2 px-3">{formatCurrency(r.previousBalance)}</td>
              <td className="py-2 px-3">{formatCurrency(r.currentBalance)}</td>
              <td className="py-2 px-3">
                <a
                  href={`/customer/receipts/${r.id}`}
                  className="text-indigo-600 hover:underline text-sm"
                >
                  View / Print
                </a>
              </td>
            </tr>
          ))}
          {recs.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-slate-400">
                No receipts yet.
              </td>
            </tr>
          )}
        </Table>
      </Card>
    </div>
  );
}
