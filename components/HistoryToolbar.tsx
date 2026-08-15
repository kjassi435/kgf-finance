"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function HistoryToolbar() {
  const router = useRouter();
  const sp = useSearchParams();
  const [from, setFrom] = useState(sp.get("from") || "");
  const [to, setTo] = useState(sp.get("to") || "");

  function apply() {
    const params = new URLSearchParams(sp.toString());
    if (from) params.set("from", from);
    else params.delete("from");
    if (to) params.set("to", to);
    else params.delete("to");
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  function clear() {
    setFrom("");
    setTo("");
    const params = new URLSearchParams(sp.toString());
    params.delete("from");
    params.delete("to");
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-end gap-3 flex-wrap bg-white border border-slate-200 rounded-lg p-3">
      <div>
        <label className="block text-xs text-slate-500 mb-1">From</label>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">To</label>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
        />
      </div>
      <button
        onClick={apply}
        className="bg-indigo-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-indigo-700"
      >
        Filter
      </button>
      <button
        onClick={clear}
        className="px-3 py-1.5 rounded-md text-sm border border-slate-300 text-slate-600 hover:bg-slate-100"
      >
        Clear
      </button>
    </div>
  );
}
