"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CustomerRowActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function del() {
    if (!confirm("Deactivate this customer?")) return;
    setBusy(true);
    await fetch(`/api/admin/customers/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  async function resetPw() {
    if (!confirm("Reset this customer's password? A new temporary password will be shown."))
      return;
    setBusy(true);
    const res = await fetch(`/api/admin/customers/${id}/reset-password`, {
      method: "POST",
    });
    setBusy(false);
    const d = await res.json();
    if (res.ok) {
      window.alert(`New temporary password: ${d.password}\nShare it with the customer.`);
    } else {
      window.alert(d.error || "Failed");
    }
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <a
        href={`/admin/customers/${id}/edit`}
        className="text-indigo-600 hover:underline text-sm"
      >
        Edit
      </a>
      <button
        onClick={resetPw}
        disabled={busy}
        className="text-amber-600 hover:underline text-sm disabled:opacity-50"
      >
        Reset PW
      </button>
      <button
        onClick={del}
        disabled={busy}
        className="text-rose-600 hover:underline text-sm disabled:opacity-50"
      >
        Deactivate
      </button>
    </div>
  );
}
