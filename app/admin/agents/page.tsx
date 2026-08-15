import { listAgents, countAgents } from "@/lib/services/agents";
import { Card, PageHeader, Button, Badge, Table } from "@/components/ui";
import SearchBar from "@/components/SearchBar";
import { AgentRowActions } from "@/components/AgentRowActions";
import Pagination from "@/components/Pagination";

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = parseInt(sp.page || "1", 10) || 1;
  const pageSize = 50;
  const [agents, total] = await Promise.all([
    listAgents({ search: sp.search, page, pageSize }),
    countAgents({ search: sp.search }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const queryString = sp.search ? `search=${sp.search}` : "";

  return (
    <div>
      <PageHeader
        title="Agents"
        subtitle={`${total} agents`}
        action={<Button href="/admin/agents/new">+ Add Agent</Button>}
      />
      <div className="mb-4">
        <SearchBar basePath="/admin/agents" placeholder="Search agents..." />
      </div>
      <Card>
        <Table headers={["Agent ID", "Name", "Mobile", "Email", "Status", "Actions"]}>
          {agents.map((a) => (
            <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-2 px-3 font-mono text-xs">{a.agentId}</td>
              <td className="py-2 px-3">{a.name}</td>
              <td className="py-2 px-3">{a.mobile}</td>
              <td className="py-2 px-3">{a.email || "-"}</td>
              <td className="py-2 px-3">
                <Badge tone={a.status === "active" ? "green" : "red"}>{a.status}</Badge>
              </td>
              <td className="py-2 px-3">
                <AgentRowActions id={a.id} />
              </td>
            </tr>
          ))}
          {agents.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-slate-400">
                No agents found.
              </td>
            </tr>
          )}
        </Table>
      </Card>
      <Pagination page={page} totalPages={totalPages} queryString={queryString} />
    </div>
  );
}
