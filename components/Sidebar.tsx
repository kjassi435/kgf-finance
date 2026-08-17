"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Wallet,
  AlertTriangle,
  FileBarChart,
  BarChart3,
  Bell,
  Shield,
  Settings,
  LogOut,
  PlusCircle,
  History,
  User,
  Receipt,
  ScrollText,
  Menu,
  X,
} from "lucide-react";

const NAV: Record<string, { href: string; label: string; icon: any }[]> = {
  admin: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/agents", label: "Agents", icon: UserCog },
    { href: "/admin/collections", label: "Collections", icon: Wallet },
    { href: "/admin/pending", label: "Pending Payments", icon: AlertTriangle },
    { href: "/admin/reports", label: "Reports", icon: FileBarChart },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
    { href: "/admin/audit", label: "Audit Logs", icon: ScrollText },
    { href: "/admin/users", label: "Users", icon: Shield },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ],
  agent: [
    { href: "/agent", label: "Dashboard", icon: LayoutDashboard },
    { href: "/agent/customers", label: "My Customers", icon: Users },
    { href: "/agent/add-collection", label: "Add Collection", icon: PlusCircle },
    { href: "/agent/history", label: "Collection History", icon: History },
    { href: "/agent/pending", label: "Pending", icon: AlertTriangle },
    { href: "/agent/profile", label: "Profile", icon: User },
  ],
  customer: [
    { href: "/customer", label: "Dashboard", icon: LayoutDashboard },
    { href: "/customer/history", label: "Payment History", icon: History },
    { href: "/customer/receipts", label: "Receipts", icon: Receipt },
    { href: "/customer/profile", label: "Profile", icon: User },
  ],
};

export default function Sidebar({
  role,
  name,
}: {
  role: string;
  name: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const items = NAV[role] || [];
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 bg-slate-900 text-white p-2 rounded-md shadow"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 shrink-0 bg-slate-900 text-slate-100 flex flex-col h-screen transform transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800">
          <span className="font-bold text-lg tracking-tight">Kalyan Gold Fund</span>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden text-slate-300"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-5 py-3 text-xs uppercase text-slate-400">
          {role} · {name}
        </div>
        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          {items.map((it) => {
            const active =
              pathname === it.href ||
              (it.href !== "/admin" && pathname.startsWith(it.href));
            const Icon = it.icon;
            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Icon size={18} />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-800 w-full"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
