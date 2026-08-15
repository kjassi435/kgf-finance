"use client";

import { useState } from "react";
import { Input, Button } from "@/components/ui";

export default function MobileUpdateRequest({ current }: { current?: string }) {
  const [mobile, setMobile] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setMsg("");
    const res = await fetch("/api/customer/request-mobile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile }),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) setErr(data.error || "Failed");
    else setMsg(data.message);
  }

  return (
    <form onSubmit={submit} className="space-y-3 max-w-md">
      <p className="text-xs text-slate-500">Current: {current || "-"}</p>
      <Input
        label="New Mobile Number"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        required
      />
      {err && (
        <div className="text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
          {err}
        </div>
      )}
      {msg && (
        <div className="text-emerald-600 text-sm bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          {msg}
        </div>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? "Sending..." : "Request Update"}
      </Button>
    </form>
  );
}
