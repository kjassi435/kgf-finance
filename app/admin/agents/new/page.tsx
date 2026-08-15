import { listAgents } from "@/lib/services/agents";
import { PageHeader, Card } from "@/components/ui";
import AgentForm from "@/components/AgentForm";

export default async function NewAgentPage() {
  return (
    <div>
      <PageHeader title="Add Agent" subtitle="Create agent login credentials" />
      <Card>
        <AgentForm />
      </Card>
    </div>
  );
}
