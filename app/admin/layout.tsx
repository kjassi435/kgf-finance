import { requireRole } from "@/lib/session";
import Sidebar from "@/components/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("admin");
  return (
    <div className="flex min-h-screen">
      <Sidebar role="admin" name={user.name} />
      <main className="flex-1 min-w-0 p-6 pt-16 md:pt-6">{children}</main>
    </div>
  );
}
