import { db } from "../db";
import { customers } from "../schema";
import { eq } from "drizzle-orm";
import { todayISODate } from "../id";

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00Z").getTime();
  const db2 = new Date(b + "T00:00:00Z").getTime();
  return Math.max(0, Math.floor((db2 - da) / 86400000));
}

export async function recomputeCustomerBalance(customerId: string, runner: any = db) {
  const c = await runner.query.customers.findFirst({
    where: eq(customers.id, customerId),
  });
  if (!c) return;

  const reg = c.registrationDate || todayISODate();
  const days = daysBetween(reg, todayISODate());
  const freq = c.collectionFrequency || "daily";
  let cycles = days;
  if (freq === "weekly") cycles = Math.floor(days / 7);
  else if (freq === "monthly") cycles = Math.floor(days / 30);

  const expected = cycles * (Number(c.dailyCollectionAmount) || 0);
  const deposited = Number(c.totalDeposited) || 0;
  const pending = Math.max(0, expected - deposited);

  await runner
    .update(customers)
    .set({ totalPending: pending, updatedAt: new Date().toISOString() })
    .where(eq(customers.id, customerId));
}
