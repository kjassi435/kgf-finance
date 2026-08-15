import { formatCurrency } from "@/lib/id";
import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { eq } from "drizzle-orm";

export default async function ReceiptView({
  data,
}: {
  data: {
    receipt: any;
    customer: any;
    agent: any;
    collection: any;
  };
}) {
  const { receipt, customer, agent, collection } = data;
  let companyName = process.env.APP_NAME || "KGF Daily Collection";
  try {
    const row = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "APP_NAME"))
      .limit(1);
    if (row[0]?.value) companyName = row[0].value;
  } catch {}
  return (
    <div className="print-area max-w-md mx-auto bg-white border border-slate-300 rounded-xl p-6">
      <div className="text-center border-b border-dashed border-slate-300 pb-3 mb-3">
        <h2 className="text-xl font-bold">{companyName}</h2>
        <p className="text-xs text-slate-500">Money Collection Receipt</p>
      </div>
      <div className="text-center text-2xl font-bold text-indigo-700 mb-3">
        {formatCurrency(receipt.amount)}
      </div>
      <table className="w-full text-sm">
        <tbody>
          <Row label="Receipt No" value={receipt.receiptNumber} />
          <Row label="Date" value={collection?.date} />
          <Row label="Customer Name" value={customer?.name} />
          <Row label="Customer ID" value={customer?.customerId} />
          <Row label="Agent" value={agent?.name} />
          <Row label="Payment Mode" value={collection?.paymentMode} />
          <Row label="Transaction ID" value={collection?.transactionRef || "-"} />
          <Row label="Previous Balance" value={formatCurrency(receipt.previousBalance)} />
          <Row label="Current Balance" value={formatCurrency(receipt.currentBalance)} />
        </tbody>
      </table>
      <div className="mt-4 text-center text-xs text-slate-400">
        Thank you for your payment.
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <tr className="border-b border-slate-100">
      <td className="py-1.5 text-slate-500">{label}</td>
      <td className="py-1.5 text-right font-medium">{value ?? "-"}</td>
    </tr>
  );
}
