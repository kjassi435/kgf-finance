import { verifyReceiptToken } from "@/lib/share";
import { getReceipt } from "@/lib/services/collections";
import { notFound } from "next/navigation";
import ReceiptView from "@/components/ReceiptView";
import { PrintButton } from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export default async function PublicReceiptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const receiptId = verifyReceiptToken(token);
  if (!receiptId) notFound();
  const data = await getReceipt(receiptId);
  if (!data) notFound();
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="no-print mb-4 flex justify-end">
        <PrintButton />
      </div>
      <ReceiptView data={data as any} />
      <p className="no-print text-center text-xs text-slate-400 mt-4">
        This receipt was shared with you. For any queries, please contact your
        agent.
      </p>
    </div>
  );
}
