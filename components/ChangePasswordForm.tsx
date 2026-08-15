"use client";

import { useState } from "react";
import { Input, Button } from "@/components/ui";

export default function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setMsg("");
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) setErr(data.error || "Failed");
    else {
      setMsg("Password changed successfully");
      setForm({ currentPassword: "", newPassword: "" });
    }
  }
  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
      <Input
        label="Current Password"
        type="password"
        value={form.currentPassword}
        onChange={(e) => set("currentPassword", e.target.value)}
        required
      />
      <Input
        label="New Password"
        type="password"
        value={form.newPassword}
        onChange={(e) => set("newPassword", e.target.value)}
        required
      />
      {err && (
        <div className="md:col-span-2 text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
          {err}
        </div>
      )}
      {msg && (
        <div className="md:col-span-2 text-emerald-600 text-sm bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          {msg}
        </div>
      )}
      <div className="md:col-span-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Change Password"}
        </Button>
      </div>
    </form>
  );
}
