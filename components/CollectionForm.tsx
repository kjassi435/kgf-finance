"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select, Button } from "@/components/ui";

export default function CollectionForm({
  customers,
}: {
  customers: {
    id: string;
    name: string;
    customerId: string;
    dailyAmount: number;
  }[];
}) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState(customers[0]?.id || "");
  const selected = customers.find((c) => c.id === customerId);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState(selected?.dailyAmount || 0);
  const [mode, setMode] = useState("cash");
  const [ref, setRef] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function onCustomerChange(id: string) {
    setCustomerId(id);
    const c = customers.find((x) => x.id === id);
    setAmount(c?.dailyAmount || 0);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        date,
        amount: Number(amount),
        paymentMode: mode,
        transactionRef: ref,
        remarks,
      }),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    router.push("/agent/history");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
      <Select label="Customer *" value={customerId} onChange={(e) => onCustomerChange(e.target.value)}>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} ({c.customerId})
          </option>
        ))}
      </Select>
      <Input label="Date *" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      <Input
        label="Amount (₹) *"
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        required
      />
      <Select label="Payment Mode" value={mode} onChange={(e) => setMode(e.target.value)}>
        <option value="cash">Cash</option>
        <option value="upi">UPI</option>
        <option value="bank_transfer">Bank Transfer</option>
        <option value="other">Other</option>
      </Select>
      <Input label="Transaction / Reference No." value={ref} onChange={(e) => setRef(e.target.value)} />
      <Input label="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
      {error && (
        <div className="md:col-span-2 text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <div className="md:col-span-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Record Collection"}
        </Button>
      </div>
    </form>
  );
}
