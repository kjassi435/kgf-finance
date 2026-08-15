"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ACTOR_TYPES = ["admin", "agent", "customer"];
const ACTIONS = [
  "create",
  "update",
  "delete",
  "login",
  "logout",
  "reset_password",
  "assign",
];

export default function AuditToolbar() {
  const router = useRouter();
  const sp = useSearchParams();
  const [actorType, setActorType] = useState(sp.get("actorType") || "");
  const [action, setAction] = useState(sp.get("action") || "");
  const [from, setFrom] = useState(sp.get("from") || "");
  const [to, setTo] = useState(sp.get("to") || "");

  function apply() {
    const params = new URLSearchParams(sp.toString());
    const set = (k: string, v: string) =>
      v ? params.set(k, v) : params.delete(k);
    set("actorType", actorType);
    set("action", action);
    set("from", from);
    set("to", to);
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  function clear() {
    router.push("?");
  }

  return (
    <div className="flex items-end gap-3 flex-wrap bg-white border border-slate-200 rounded-lg p-3">
      <div>
        <label className="block text-xs text-slate-500 mb-1">Actor</label>
        <select
          value={actorType}
          onChange={(e) => setActorType(e.target.value)}
          className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
        >
          <option value="">All</option>
          {ACTOR_TYPES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Action</label>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="border border-slate-300 rounded-md px-2 py-1.5 text-sm"
        >
          <option value="">All</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
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
