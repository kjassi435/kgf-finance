"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select, Button } from "@/components/ui";

export default function CustomerForm({
  agents,
  initial,
  id,
}: {
  agents: { id: string; name: string; agentId: string }[];
  initial?: any;
  id?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initial?.name || "",
    fatherHusbandName: initial?.fatherHusbandName || "",
    dob: initial?.dob || "",
    gender: initial?.gender || "",
    aadhaar: initial?.aadhaar || "",
    mobile: initial?.mobile || "",
    alternateMobile: initial?.alternateMobile || "",
    fullAddress: initial?.fullAddress || "",
    village: initial?.village || "",
    post: initial?.post || "",
    tehsil: initial?.tehsil || "",
    district: initial?.district || "",
    state: initial?.state || "",
    pin: initial?.pin || "",
    registrationDate: initial?.registrationDate || "",
    assignedAgentId: initial?.assignedAgentId || "",
    dailyCollectionAmount: initial?.dailyCollectionAmount ?? 0,
    collectionFrequency: initial?.collectionFrequency || "daily",
    planType: initial?.planType || "basic",
    accountStatus: initial?.accountStatus || "active",
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
    const res = await fetch(
      id ? `/api/admin/customers/${id}` : "/api/admin/customers",
      {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    if (!id && data.password) {
      window.alert(
        `Customer created.\n\nLogin ID: ${data.customer.customerId}\nTemporary password: ${data.password}\n\nShare this with the customer. They can change it after first login.`
      );
    }
    router.push("/admin/customers");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Input label="Customer Name *" value={form.name} onChange={(e) => set("name", e.target.value)} required />
      <Input label="Father/Husband Name" value={form.fatherHusbandName} onChange={(e) => set("fatherHusbandName", e.target.value)} />
      <Input label="Date of Birth" type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
      <Select label="Gender" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
        <option value="">Select</option>
        <option>Male</option>
        <option>Female</option>
        <option>Other</option>
      </Select>
      <Input label="Aadhaar (12 digits)" value={form.aadhaar} maxLength={12} onChange={(e) => set("aadhaar", e.target.value.replace(/\D/g, ""))} />
      <Input label="Mobile *" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} required />
      <Input label="Alternate Mobile" value={form.alternateMobile} onChange={(e) => set("alternateMobile", e.target.value)} />
      <Input label="Registration Date" type="date" value={form.registrationDate} onChange={(e) => set("registrationDate", e.target.value)} />
      <Select label="Assigned Agent" value={form.assignedAgentId} onChange={(e) => set("assignedAgentId", e.target.value)}>
        <option value="">None</option>
        {agents.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name} ({a.agentId})
          </option>
        ))}
      </Select>
      <Input label="Daily Collection Amount" type="number" value={form.dailyCollectionAmount} onChange={(e) => set("dailyCollectionAmount", Number(e.target.value))} />
      <Select label="Frequency" value={form.collectionFrequency} onChange={(e) => set("collectionFrequency", e.target.value)}>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </Select>
      <Select label="Plan Type" value={form.planType} onChange={(e) => set("planType", e.target.value)}>
        <option value="basic">Basic</option>
        <option value="standard">Standard</option>
        <option value="premium">Premium</option>
        <option value="custom">Custom</option>
      </Select>
      <Select label="Account Status" value={form.accountStatus} onChange={(e) => set("accountStatus", e.target.value)}>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </Select>
      <Input label="Full Address" value={form.fullAddress} onChange={(e) => set("fullAddress", e.target.value)} />
      <Input label="Village/City" value={form.village} onChange={(e) => set("village", e.target.value)} />
      <Input label="Post" value={form.post} onChange={(e) => set("post", e.target.value)} />
      <Input label="Tehsil" value={form.tehsil} onChange={(e) => set("tehsil", e.target.value)} />
      <Input label="District" value={form.district} onChange={(e) => set("district", e.target.value)} />
      <Input label="State" value={form.state} onChange={(e) => set("state", e.target.value)} />
      <Input label="PIN Code" value={form.pin} onChange={(e) => set("pin", e.target.value)} />

      {error && (
        <div className="md:col-span-3 text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <div className="md:col-span-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : id ? "Update Customer" : "Create Customer"}
        </Button>
      </div>
    </form>
  );
}
