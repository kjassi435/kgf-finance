import { listAgents } from "@/lib/services/agents";
import { PageHeader, Card } from "@/components/ui";
import CustomerForm from "@/components/CustomerForm";

export default async function NewCustomerPage() {
  const agents = await listAgents();
  return (
    <div>
      <PageHeader title="Add Customer" subtitle="Create a new customer account" />
      <Card>
        <CustomerForm agents={agents.map((a) => ({ id: a.id, name: a.name, agentId: a.agentId }))} />
      </Card>
    </div>
  );
}
