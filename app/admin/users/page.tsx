import { listAdmins } from "@/lib/services/admins";
import { getCurrentUser } from "@/lib/session";
import { PageHeader, Card, Table, Badge } from "@/components/ui";
import AdminForm from "@/components/AdminForm";
import AdminRowActions from "@/components/AdminRowActions";

export default async function UsersPage() {
  const rows = await listAdmins();
  const s = await getCurrentUser();
  return (
    <div>
      <PageHeader title="Users" subtitle="Admin accounts (multi-admin ready)" />
      <Card className="mb-6">
        <h3 className="font-semibold mb-3">Add Admin User</h3>
        <AdminForm />
      </Card>
      <Card>
        <Table headers={["Username", "Name", "Email", "Status", "Action"]}>
          {rows.map((a) => (
            <tr key={a.id} className="border-b border-slate-100">
              <td className="py-2 px-3 font-mono text-xs">{a.username}</td>
              <td className="py-2 px-3">{a.name}</td>
              <td className="py-2 px-3">{a.email || "-"}</td>
              <td className="py-2 px-3">
                <Badge tone={a.status === "active" ? "green" : "red"}>
                  {a.status}
                </Badge>
              </td>
              <td className="py-2 px-3">
                <AdminRowActions
                  id={a.id}
                  status={a.status}
                  isSelf={s?.id === a.id}
                />
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
