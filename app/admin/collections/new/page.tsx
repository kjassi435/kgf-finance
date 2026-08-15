import { listCustomers } from "@/lib/services/customers";
import { PageHeader, Card } from "@/components/ui";
import CollectionForm from "@/components/CollectionForm";

export default async function AdminAddCollectionPage() {
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
        <CollectionForm customers={customers} />
      </Card>
    </div>
  );
}
