import { getReceiptByCollection } from "@/lib/services/collections";
import { getCurrentUser } from "@/lib/session";
import { notFound } from "next/navigation";
import ReceiptView from "@/components/ReceiptView";
import { PrintButton } from "@/components/PrintButton";
import WhatsAppShareButton from "@/components/WhatsAppShareButton";
import { receiptShareToken } from "@/lib/share";

export default async function AgentReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const data = await getReceiptByCollection(id);
  if (!data || data.receipt.agentId !== user?.id) notFound();
  const token = receiptShareToken(data.receipt.id);
  return (
    <div className="p-6">
      <div className="no-print mb-4 flex gap-3">
        <PrintButton />
        <WhatsAppShareButton mobile={data.customer.mobile} token={token} />
      </div>
      <ReceiptView data={data as any} />
    </div>
  );
}
