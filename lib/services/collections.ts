import { db } from "../db";
import { collections, customers, receipts, agents, paymentTransactions } from "../schema";
import { eq, and, like, or, desc, sql, gte, lte } from "drizzle-orm";
import { genId, nowTime } from "../id";
import { writeAudit } from "../audit";
import { recomputeCustomerBalance } from "./balance";
import { collectionCreateSchema } from "../validators";
import { NOTIFICATION_TYPES } from "../constants";
import { nextCode } from "./ids";

export async function listCollections(opts: {
  from?: string;
  to?: string;
  agentId?: string;
  customerId?: string;
  paymentMode?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const conditions = [];
  if (opts.from) conditions.push(gte(collections.date, opts.from));
  if (opts.to) conditions.push(lte(collections.date, opts.to));
  if (opts.agentId) conditions.push(eq(collections.agentId, opts.agentId));
  if (opts.customerId) conditions.push(eq(collections.customerId, opts.customerId));
  if (opts.paymentMode) conditions.push(eq(collections.paymentMode, opts.paymentMode));
  if (opts.search) {
    const s = `%${opts.search}%`;
    conditions.push(
      or(like(collections.collectionId, s), like(collections.transactionRef, s))
    );
  }
  const where = conditions.length ? and(...conditions) : undefined;
  const page = Math.max(1, opts.page || 1);
  const pageSize = opts.pageSize || 50;
  const [rows, countRows] = await Promise.all([
    db
      .select()
      .from(collections)
      .where(where)
      .orderBy(desc(collections.date), desc(collections.time))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ c: sql<number>`count(*)` }).from(collections).where(where),
  ]);
  return { rows, total: Number(countRows[0]?.c || 0) };
}

export async function createCollection(
  input: any,
  actor: { type: string; id: string; agentId?: string }
) {
  const data = collectionCreateSchema.parse(input);

  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, data.customerId),
  });
  if (!customer) throw new Error("Customer not found");
  if (customer.accountStatus !== "active")
    throw new Error("Customer account is not active");

  // Agent scope enforcement
  let agentId = actor.agentId;
  if (actor.type === "admin") {
    if (!customer.assignedAgentId) {
      throw new Error("Customer has no assigned agent");
    }
    agentId = customer.assignedAgentId;
  }
  if (!agentId) throw new Error("No agent assigned to this customer");
  if (actor.type === "agent" && customer.assignedAgentId !== actor.id) {
    throw new Error("This customer is not assigned to you");
  }

  // Prevent duplicate same-day collection
  const dup = await db
    .select({ id: collections.id })
    .from(collections)
    .where(
      and(
        eq(collections.customerId, data.customerId),
        eq(collections.date, data.date)
      )
    )
    .limit(1);
  if (dup.length) throw new Error("Collection already recorded for this date");

  const previousBalance = Number(customer.totalPending) || 0;
  const now = new Date().toISOString();

  const { inserted, receipt } = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(collections)
      .values({
        id: genId("COL"),
        collectionId: await nextCode("COL", collections.collectionId, collections, 5, tx),
        customerId: data.customerId,
        agentId: agentId!,
        date: data.date,
        time: data.time || nowTime(),
        amount: data.amount,
        paymentMode: data.paymentMode,
        transactionRef: data.transactionRef || null,
        remarks: data.remarks || null,
        collectedById: actor.id,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Update customer deposited + balances
    await tx
      .update(customers)
      .set({
        totalDeposited: (Number(customer.totalDeposited) || 0) + Number(data.amount),
        updatedAt: now,
      })
      .where(eq(customers.id, customer.id));
    await recomputeCustomerBalance(customer.id, tx);

    await tx.insert(paymentTransactions).values({
      id: genId("PTX"),
      transactionId: await nextCode("PTX", paymentTransactions.transactionId, paymentTransactions, 4, tx),
      collectionId: inserted.id,
      customerId: customer.id,
      agentId,
      date: data.date,
      amount: data.amount,
      paymentMode: data.paymentMode,
      transactionRef: data.transactionRef || null,
      type: "collection",
      status: "success",
      createdAt: now,
    });

    const [refreshed] = await tx
      .select()
      .from(customers)
      .where(eq(customers.id, customer.id))
      .limit(1);
    const currentBalance = Number(refreshed?.totalPending) || 0;

    // Retry receipt insert on unique constraint (race condition on receipt number)
    let receipt: any;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const [r] = await tx
          .insert(receipts)
          .values({
            id: genId("RCP"),
            receiptNumber: await nextCode("RCP", receipts.receiptNumber, receipts, 6, tx),
            collectionId: inserted.id,
            customerId: customer.id,
            agentId: agentId!,
            amount: data.amount,
            previousBalance,
            currentBalance,
            generatedAt: now,
          })
          .returning();
        receipt = r;
        break;
      } catch (e: any) {
        const errStr = String(e?.message || e?.cause?.message || e?.toString?.() || JSON.stringify(e) || e || "").toLowerCase();
        const isUnique = errStr.includes("unique constraint") ||
          errStr.includes("duplicate") ||
          errStr.includes("constraint failed") ||
          errStr.includes("unique") ||
          errStr.includes("constraint") ||
          errStr.includes("failed query") ||
          errStr.includes("19") ||
          errStr.includes("sql") ||
          (errStr.includes("insert") && errStr.includes("receipt")) ||
          false;
        if (!isUnique || attempt === 2) throw e;
        await new Promise((r) => setTimeout(r, 50 * (attempt + 1)));
      }
    }

    return { inserted, receipt };
  });

  await writeAudit({
    actorType: actor.type,
    actorId: actor.id,
    action: "collection",
    entity: "collection",
    entityId: inserted.id,
    details: { customerId: customer.customerId, amount: data.amount, date: data.date },
  });

  // Notification stub
  try {
    const { notify } = await import("../notifications");
    await notify({
      type: NOTIFICATION_TYPES.PAYMENT_CONFIRMATION,
      channel: "inapp",
      recipientType: "customer",
      recipientId: customer.id,
      message: `Payment of ₹${data.amount} received on ${data.date}.`,
    });
  } catch {}

  return { collection: inserted, receipt };
}

export async function getReceipt(receiptId: string) {
  const r = await db.query.receipts.findFirst({ where: eq(receipts.id, receiptId) });
  if (!r) return null;
  return getReceiptData(r);
}

export async function getReceiptByCollection(collectionId: string) {
  const r = await db.query.receipts.findFirst({
    where: eq(receipts.collectionId, collectionId),
  });
  if (!r) return null;
  return getReceiptData(r);
}

async function getReceiptData(r: any) {
  const c = await db.query.customers.findFirst({ where: eq(customers.id, r.customerId) });
  const a = await db.query.agents.findFirst({ where: eq(agents.id, r.agentId) });
  const col = await db.query.collections.findFirst({ where: eq(collections.id, r.collectionId) });
  return { receipt: r, customer: c, agent: a, collection: col };
}
