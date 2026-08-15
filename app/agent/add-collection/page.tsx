import { getCurrentUser } from "@/lib/session";
import { customersOfAgent } from "@/lib/services/agents";
import { PageHeader, Card } from "@/components/ui";
import CollectionForm from "@/components/CollectionForm";

export default async function AddCollectionPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const rows = await customersOfAgent(user.id);
  const customers = rows.map((c) => ({
    id: c.id,
    name: c.name,
    customerId: c.customerId,
    dailyAmount: Number(c.dailyCollectionAmount) || 0,
  }));
  return (
    <div>
      <PageHeader title="Add Collection" subtitle="Record a customer payment" />
      {customers.length === 0 ? (
        <Card>No customers assigned. Contact admin.</Card>
      ) : (
        <Card>
          <CollectionForm customers={customers} />
        </Card>
      )}
    </div>
  );
}
