import { listCustomers } from "@/lib/services/customers";
import { PageHeader, Card } from "@/components/ui";
import CollectionForm from "@/components/CollectionForm";
import { useRouter } from "next/navigation";

export default async function AdminAddCollectionPage() {
  const router = useRouter();
  const rows = await listCustomers({ limit: 5000 });
  const customers = rows.map((c) => ({
    id: c.id,
    name: c.name,
    customerId: c.customerId,
    dailyAmount: Number(c.dailyCollectionAmount) || 0,
  }));
  return (
    <div>
      <PageHeader title="Add Collection" subtitle="Record a customer payment" />
      <Card>
        <CollectionForm
          customers={customers}
          onSuccess={() => {
            router.push("/admin/collections");
            router.refresh();
          }}
        />
      </Card>
    </div>
  );
}
