"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function CustomersToolbar({
  agents,
}: {
  agents: { id: string; name: string; agentId: string }[];
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [search, setSearch] = useState(sp.get("search") || "");
  const [status, setStatus] = useState(sp.get("status") || "");
  const [agentId, setAgentId] = useState(sp.get("agentId") || "");

  function go() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (agentId) params.set("agentId", agentId);
    router.push(`/admin/customers?${params.toString()}`);
  }

  return (
    <div className="mb-4 flex flex-wrap gap-3 items-end">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Name / ID / Mobile / Aadhaar"
        className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-64"
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <select
        value={agentId}
        onChange={(e) => setAgentId(e.target.value)}
        className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
      >
        <option value="">All Agents</option>
        {agents.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name} ({a.agentId})
          </option>
        ))}
      </select>
      <button
        onClick={go}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"
      >
        Search
      </button>
    </div>
  );
}
