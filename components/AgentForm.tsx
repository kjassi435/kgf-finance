"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select, Button } from "@/components/ui";

export default function AgentForm({ initial, id }: { initial?: any; id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initial?.name || "",
    mobile: initial?.mobile || "",
    email: initial?.email || "",
    password: "",
    status: initial?.status || "active",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(k: string, v: any) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(id ? `/api/admin/agents/${id}` : "/api/admin/agents", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    router.push("/admin/agents");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input label="Agent Name *" value={form.name} onChange={(e) => set("name", e.target.value)} required />
      <Input label="Mobile *" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} required />
      <Input label="Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
      <Input
        label={id ? "New Password (leave blank to keep)" : "Password *"}
        type="password"
        value={form.password}
        onChange={(e) => set("password", e.target.value)}
        required={!id}
      />
      <Select label="Status" value={form.status} onChange={(e) => set("status", e.target.value)}>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </Select>
      {error && (
        <div className="md:col-span-2 text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <div className="md:col-span-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : id ? "Update Agent" : "Create Agent"}
        </Button>
      </div>
    </form>
  );
}
