"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Button } from "@/components/ui";

export default function AdminForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    router.refresh();
    setForm({ name: "", username: "", email: "", password: "" });
  }
  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input label="Full Name *" value={form.name} onChange={(e) => set("name", e.target.value)} required />
      <Input label="Username *" value={form.username} onChange={(e) => set("username", e.target.value)} required />
      <Input label="Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
      <Input label="Password *" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} required />
      {error && (
        <div className="md:col-span-2 text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <div className="md:col-span-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Add Admin User"}
        </Button>
      </div>
    </form>
  );
}
