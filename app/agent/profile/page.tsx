import { getCurrentUser } from "@/lib/session";
import { Card, PageHeader, Badge } from "@/components/ui";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export default async function AgentProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const a = user.record;
  return (
    <div>
      <PageHeader title="My Profile" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-3">Account Details</h3>
          <div className="space-y-2 text-sm">
            <Row label="Name" value={a.name} />
            <Row label="Agent ID" value={a.agentId} />
            <Row label="Mobile" value={a.mobile} />
            <Row label="Email" value={a.email || "-"} />
            <Row label="Status" value={<Badge tone={a.status === "active" ? "green" : "red"}>{a.status}</Badge>} />
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold mb-3">Change Password</h3>
          <ChangePasswordForm />
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b border-slate-100 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
