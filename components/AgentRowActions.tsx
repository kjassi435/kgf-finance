"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AgentRowActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function del() {
    if (!confirm("Deactivate this agent?")) return;
    setBusy(true);
    await fetch(`/api/admin/agents/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }
  return (
    <div className="flex gap-2">
      <a href={`/admin/agents/${id}/edit`} className="text-indigo-600 hover:underline text-sm">
        Edit
      </a>
      <button onClick={del} disabled={busy} className="text-rose-600 hover:underline text-sm">
        Deactivate
      </button>
    </div>
  );
}
