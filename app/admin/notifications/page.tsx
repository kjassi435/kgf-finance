import { db } from "@/lib/db";
import { notifications } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { PageHeader, Card, Badge, Table } from "@/components/ui";

export default async function NotificationsPage() {
  const rows = await db
    .select()
    .from(notifications)
    .orderBy(desc(notifications.createdAt))
    .limit(200);
  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="System notifications (SMS/WhatsApp/Email ready via stubs)"
      />
      <Card>
        <Table headers={["Type", "Channel", "Recipient", "Message", "Status", "Created"]}>
          {rows.map((n) => (
            <tr key={n.id} className="border-b border-slate-100">
              <td className="py-2 px-3">{n.type}</td>
              <td className="py-2 px-3">
                <Badge tone="blue">{n.channel}</Badge>
              </td>
              <td className="py-2 px-3 text-xs">{n.recipientType}:{n.recipientId}</td>
              <td className="py-2 px-3">{n.message}</td>
              <td className="py-2 px-3">
                <Badge tone={n.status === "sent" ? "green" : "amber"}>{n.status}</Badge>
              </td>
              <td className="py-2 px-3 text-xs">{n.createdAt?.slice(0, 19)}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-slate-400">
                No notifications yet.
              </td>
            </tr>
          )}
        </Table>
      </Card>
    </div>
  );
}
