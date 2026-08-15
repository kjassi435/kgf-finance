"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminRowActions({
  id,
  status,
  isSelf,
}: {
  id: string;
  status: string;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function toggle() {
    if (isSelf) return;
    setLoading(true);
    const next = status === "active" ? "inactive" : "active";
    await fetch(`/api/admin/admins/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(false);
    router.refresh();
  }
  return (
    <button
      onClick={toggle}
      disabled={loading || isSelf}
      className={`text-xs px-2 py-1 rounded border ${
        status === "active"
          ? "border-amber-300 text-amber-700 hover:bg-amber-50"
          : "border-green-300 text-green-700 hover:bg-green-50"
      } disabled:opacity-40`}
    >
      {isSelf ? "you" : status === "active" ? "Deactivate" : "Activate"}
    </button>
  );
}
