import { getCurrentUser } from "@/lib/session";
import { getReceipt } from "@/lib/services/collections";
import { notFound } from "next/navigation";
import ReceiptView from "@/components/ReceiptView";
import { PrintButton } from "@/components/PrintButton";

export default async function CustomerReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const data = await getReceipt(id);
  if (!data || data.receipt.customerId !== user?.id) notFound();
  return (
    <div className="p-6">
      <div className="no-print mb-4">
        <PrintButton />
      </div>
      <ReceiptView data={data as any} />
    </div>
  );
}
