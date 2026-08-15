"use client";

import { useRouter, useSearchParams } from "next/navigation";

const RANGES = [
  { key: "7", label: "7 Days" },
  { key: "30", label: "30 Days" },
  { key: "90", label: "90 Days" },
  { key: "12m", label: "12 Months" },
];

export default function DashboardRange() {
  const router = useRouter();
  const sp = useSearchParams();
  const current = sp.get("range") || "30";

  function go(key: string) {
    const params = new URLSearchParams(sp.toString());
    params.set("range", key);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="inline-flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
      {RANGES.map((r) => (
        <button
          key={r.key}
          onClick={() => go(r.key)}
          className={`px-3 py-1 text-sm rounded-md transition ${
            current === r.key
              ? "bg-indigo-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
