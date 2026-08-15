import { listAuditLogs } from "@/lib/audit";
import { PageHeader, Card, Table, Badge } from "@/components/ui";
import AuditToolbar from "@/components/AuditToolbar";
import Pagination from "@/components/Pagination";
import { Suspense } from "react";

function fmt(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", { hour12: false });
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{
    actorType?: string;
    action?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const page = parseInt(sp.page || "1", 10) || 1;
  const pageSize = 50;
  const { rows, total } = await listAuditLogs({
    actorType: sp.actorType,
    action: sp.action,
    from: sp.from,
    to: sp.to,
    page,
    pageSize,
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const queryString = [
    sp.actorType && `actorType=${sp.actorType}`,
    sp.action && `action=${sp.action}`,
    sp.from && `from=${sp.from}`,
    sp.to && `to=${sp.to}`,
  ]
    .filter(Boolean)
    .join("&");

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle={`${total} actions (newest first)`}
      />
      <div className="no-print mb-4">
        <Suspense fallback={null}>
          <AuditToolbar />
        </Suspense>
      </div>
      <Card>
        <Table headers={["Time", "Actor", "Action", "Entity", "Details"]}>
          {rows.map((a) => (
            <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-2 px-3 text-xs whitespace-nowrap">{fmt(a.createdAt)}</td>
              <td className="py-2 px-3 text-xs">
                <Badge tone="blue">{a.actorType}</Badge>{" "}
                <span className="font-mono">{a.actorId}</span>
              </td>
              <td className="py-2 px-3 text-xs">{a.action}</td>
              <td className="py-2 px-3 text-xs">{a.entity}</td>
              <td className="py-2 px-3 text-xs text-slate-600">
                {a.details ? JSON.stringify(a.details) : "-"}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-slate-400">
                No audit logs found.
              </td>
            </tr>
          )}
        </Table>
      </Card>
      <Pagination page={page} totalPages={totalPages} queryString={queryString} />
    </div>
  );
}
