"use client";

import { useState } from "react";

const TYPES = [
  { value: "customers", label: "Customer Report" },
  { value: "collections", label: "Daily Collection Report" },
  { value: "agent-performance", label: "Agent Performance" },
  { value: "payment-mode", label: "Payment Mode Report" },
  { value: "monthly", label: "Monthly Collection Report" },
  { value: "yearly", label: "Yearly Collection Report" },
  { value: "pending", label: "Pending Payments Report" },
  { value: "customer", label: "Customer Payment History Report" },
];

export default function ExportPanel() {
  const [type, setType] = useState("customers");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function url(format: string) {
    const params = new URLSearchParams({ type, format });
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return `/api/export?${params.toString()}`;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
      <h3 className="font-semibold mb-3">Generate & Export Report</h3>
      <div className="flex flex-wrap gap-3 items-end">
        <label className="text-sm">
          <span className="text-slate-600 block mb-1">Report</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-slate-600 block mb-1">From</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="text-slate-600 block mb-1">To</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </label>
        <a
          href={url("excel")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          Export Excel
        </a>
        <a
          href={url("pdf")}
          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          Export PDF
        </a>
        <a
          href={url("excel")}
          onClick={(e) => {
            e.preventDefault();
            window.print();
          }}
          className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          Print
        </a>
      </div>
    </div>
  );
}
