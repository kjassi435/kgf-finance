import { requireRole } from "@/lib/session";
import Sidebar from "@/components/Sidebar";

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("agent");
  return (
    <div className="flex min-h-screen">
      <Sidebar role="agent" name={user.name} />
      <main className="flex-1 min-w-0 p-4 md:p-6">{children}</main>
    </div>
  );
}
