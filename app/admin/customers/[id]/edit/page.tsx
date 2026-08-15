import { getCustomer } from "@/lib/services/customers";
import { listAgents } from "@/lib/services/agents";
import { decryptSensitive } from "@/lib/crypto";
import { PageHeader, Card } from "@/components/ui";
import CustomerForm from "@/components/CustomerForm";
import DocumentManager from "@/components/DocumentManager";
import { notFound } from "next/navigation";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [c, agents] = await Promise.all([getCustomer(id), listAgents()]);
  if (!c) notFound();
  const initial = { ...c, aadhaar: decryptSensitive(c.aadhaarEnc) };
  return (
    <div className="space-y-4">
      <PageHeader title="Edit Customer" subtitle={c.name} />
      <Card>
        <CustomerForm
          id={c.id}
          agents={agents.map((a) => ({ id: a.id, name: a.name, agentId: a.agentId }))}
          initial={initial}
        />
      </Card>
      <Card>
        <h3 className="font-semibold mb-3">Customer Documents</h3>
        <DocumentManager customerId={c.id} />
      </Card>
    </div>
  );
}
