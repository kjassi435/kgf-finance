import { requireRole } from "@/lib/session";
import Sidebar from "@/components/Sidebar";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("customer");
  return (
    <div className="flex min-h-screen">
      <Sidebar role="customer" name={user.name} />
      <main className="flex-1 min-w-0 p-4 md:p-6">{children}</main>
    </div>
  );
}
