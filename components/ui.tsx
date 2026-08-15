import Link from "next/link";
import { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  accent = "indigo",
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  accent?: "indigo" | "green" | "red" | "amber" | "blue";
}) {
  const colors: Record<string, string> = {
    indigo: "text-indigo-600",
    green: "text-emerald-600",
    red: "text-rose-600",
    amber: "text-amber-600",
    blue: "text-sky-600",
  };
  return (
    <Card>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${colors[accent]}`}>{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </Card>
  );
}

export function Badge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "slate" | "green" | "red" | "amber" | "blue";
}) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-sky-100 text-sky-700",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Button({
  children,
  href,
  variant = "primary",
  className = "",
  ...props
}: {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  className?: string;
  [key: string]: any;
}) {
  const variants: Record<string, string> = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
    secondary: "bg-slate-200 hover:bg-slate-300 text-slate-800",
    danger: "bg-rose-600 hover:bg-rose-700 text-white",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700",
  };
  const cls = `inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${variants[variant]} ${className}`;
  if (href)
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}

export function Input({
  label,
  ...props
}: { label?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm">
      {label && <span className="text-slate-600 mb-1 block">{label}</span>}
      <input
        {...props}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </label>
  );
}

export function Select({
  label,
  children,
  ...props
}: { label?: string; children: ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block text-sm">
      {label && <span className="text-slate-600 mb-1 block">{label}</span>}
      <select
        {...props}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
      >
        {children}
      </select>
    </label>
  );
}

export function Table({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-slate-500 border-b border-slate-200">
            {headers.map((h, i) => (
              <th key={i} className="py-2 px-3 font-medium whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
