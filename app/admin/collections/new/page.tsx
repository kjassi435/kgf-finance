"use client";

import { listCustomers } from "@/lib/services/customers";
import { PageHeader, Card } from "@/components/ui";
import CollectionForm from "@/components/CollectionForm";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminAddCollectionPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Array<{id: string; name: string; customerId: string; dailyAmount: number}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await fetch("/api/admin/customers?limit=5000");
        const data = await res.json();
        if (data.customers) {
          setCustomers(data.customers.map((c: any) => ({
            id: c.id,
            name: c.name,
            customerId: c.customerId,
            dailyAmount: Number(c.dailyCollectionAmount) || 0,
          })));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title="Add Collection" subtitle="Record a customer payment" />
        <Card>Loading customers...</Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Add Collection" subtitle="Record a customer payment" />
      <Card>
        <CollectionForm
          customers={customers}
          onSuccess={() => {
            router.push("/admin/collections");
            router.refresh();
          }}
        />
      </Card>
    </div>
  );
}
