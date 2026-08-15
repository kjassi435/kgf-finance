import { getAgent } from "@/lib/services/agents";
import { PageHeader, Card } from "@/components/ui";
import AgentForm from "@/components/AgentForm";
import { notFound } from "next/navigation";

export default async function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const a = await getAgent(id);
  if (!a) notFound();
  return (
    <div>
      <PageHeader title="Edit Agent" subtitle={a.name} />
      <Card>
        <AgentForm id={a.id} initial={a} />
      </Card>
    </div>
  );
}
