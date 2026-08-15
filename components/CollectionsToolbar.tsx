"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CollectionsToolbar({
  agents,
}: {
  agents: { id: string; name: string; agentId: string }[];
}) {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [agentId, setAgentId] = useState("");
  const [paymentMode, setPaymentMode] = useState("");

  function go() {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (agentId) params.set("agentId", agentId);
    if (paymentMode) params.set("paymentMode", paymentMode);
    router.push(`/admin/collections?${params.toString()}`);
  }

  return (
    <form className="mb-4 flex flex-wrap gap-3 items-end" onSubmit={(e) => { e.preventDefault(); go(); }}>
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
      <select
        value={agentId}
        onChange={(e) => setAgentId(e.target.value)}
        className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
      >
        <option value="">All Agents</option>
        {agents.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
      <select
        value={paymentMode}
        onChange={(e) => setPaymentMode(e.target.value)}
        className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
      >
        <option value="">All Modes</option>
        <option value="cash">Cash</option>
        <option value="upi">UPI</option>
        <option value="bank_transfer">Bank Transfer</option>
        <option value="other">Other</option>
      </select>
      <button
        type="submit"
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"
      >
        Filter
      </button>
    </form>
  );
}
