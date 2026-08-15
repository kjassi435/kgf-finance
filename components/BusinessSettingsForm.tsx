"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Button } from "@/components/ui";

export default function BusinessSettingsForm({
  appName,
  currency,
}: {
  appName: string;
  currency: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(appName || "KGF Collection");
  const [cur, setCur] = useState(currency || "₹");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ APP_NAME: name, CURRENCY: cur }),
    });
    setLoading(false);
    const d = await res.json();
    if (!res.ok) {
      setMsg(d.error || "Failed");
      return;
    }
    setMsg("Saved successfully.");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-3">
      <Input label="Business / Company Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="Currency Symbol" value={cur} onChange={(e) => setCur(e.target.value)} />
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Settings"}
      </Button>
      {msg && <div className="text-sm text-green-600">{msg}</div>}
    </form>
  );
}
