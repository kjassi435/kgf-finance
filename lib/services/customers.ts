import { db } from "../db";
import { customers, agentCustomerAssignments } from "../schema";
import { eq, like, and, or, desc, sql, isNotNull } from "drizzle-orm";
import { genId, todayISODate, randomPassword } from "../id";
import { encryptSensitive, maskAadhaar } from "../crypto";
import { hashPassword } from "../auth";
import { customerCreateSchema, customerUpdateSchema } from "../validators";
import { recomputeCustomerBalance } from "./balance";
import { writeAudit } from "../audit";
import { NOTIFICATION_TYPES } from "../constants";
import { nextCode } from "./ids";


export async function listCustomers(opts: {
  search?: string;
  agentId?: string;
  status?: string;
  createdBy?: string;
  page?: number;
  pageSize?: number;
  limit?: number;
}) {
  const conditions = [];
  if (opts.search) {
    const s = `%${opts.search}%`;
    conditions.push(
      or(
        like(customers.name, s),
        like(customers.customerId, s),
        like(customers.mobile, s),
        like(customers.aadhaarMask, s)
      )
    );
  }
  if (opts.agentId) conditions.push(eq(customers.assignedAgentId, opts.agentId));
  if (opts.status) conditions.push(eq(customers.accountStatus, opts.status));

  const where = conditions.length ? and(...conditions) : undefined;
  const pageSize = opts.limit ?? opts.pageSize ?? 50;
  const page = Math.max(1, opts.page || 1);
  const rows = await db
    .select()
    .from(customers)
    .where(where)
    .orderBy(desc(customers.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return rows;
}

export async function countCustomers(opts: {
  search?: string;
  agentId?: string;
  status?: string;
} = {}): Promise<number> {
  const conditions = [];
  if (opts.search) {
    const s = `%${opts.search}%`;
    conditions.push(
      or(
        like(customers.name, s),
        like(customers.customerId, s),
        like(customers.mobile, s),
        like(customers.aadhaarMask, s)
      )
    );
  }
  if (opts.agentId) conditions.push(eq(customers.assignedAgentId, opts.agentId));
  if (opts.status) conditions.push(eq(customers.accountStatus, opts.status));
  const [row] = await db
    .select({ c: sql<number>`count(*)` })
    .from(customers)
    .where(conditions.length ? and(...conditions) : undefined);
  return Number(row?.c || 0);
}

export async function getCustomer(id: string) {
  return db.query.customers.findFirst({ where: eq(customers.id, id) });
}

export async function pendingCustomers(agentId?: string) {
  const conds = [
    eq(customers.accountStatus, "active"),
    sql`${customers.totalPending} > 0`,
  ];
  if (agentId) conds.push(eq(customers.assignedAgentId, agentId));
  return db
    .select()
    .from(customers)
    .where(and(...conds))
    .orderBy(desc(customers.totalPending));
}

export async function createCustomer(input: any, actor: { type: string; id: string }) {
  const data = customerCreateSchema.parse(input);
  const code = await nextCode("CUST", customers.customerId, customers, 4);
  const aadhaar = data.aadhaar && data.aadhaar.length === 12 ? data.aadhaar : "";
  const rawPassword = randomPassword(8);
  const now = new Date().toISOString();

  const [inserted] = await db
    .insert(customers)
    .values({
      id: genId("CUS"),
      customerId: code,
      name: data.name,
      fatherHusbandName: data.fatherHusbandName || null,
      dob: data.dob || null,
      gender: data.gender || null,
      aadhaarEnc: aadhaar ? encryptSensitive(aadhaar) : null,
      aadhaarMask: aadhaar ? maskAadhaar(aadhaar) : null,
      mobile: data.mobile,
      alternateMobile: data.alternateMobile || null,
      fullAddress: data.fullAddress || null,
      village: data.village || null,
      post: data.post || null,
      tehsil: data.tehsil || null,
      district: data.district || null,
      state: data.state || null,
      pin: data.pin || null,
      registrationDate: data.registrationDate || todayISODate(),
      assignedAgentId: data.assignedAgentId || null,
      dailyCollectionAmount: data.dailyCollectionAmount,
      collectionFrequency: data.collectionFrequency,
      planType: data.planType,
      accountStatus: data.accountStatus,
      passwordHash: await hashPassword(rawPassword),
      loginEnabled: 1,
      totalDeposited: 0,
      totalPending: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: actor.id,
    })
    .returning();

  if (data.assignedAgentId) {
    await db.insert(agentCustomerAssignments).values({
      id: genId("ACA"),
      agentId: data.assignedAgentId,
      customerId: inserted.id,
      active: 1,
      assignedAt: now,
      assignedBy: actor.id,
    });
  }

  await recomputeCustomerBalance(inserted.id);
  await writeAudit({
    actorType: actor.type,
    actorId: actor.id,
    action: "create",
    entity: "customer",
    entityId: inserted.id,
    details: { customerId: code, name: data.name },
  });
  await notifyNewCustomer(inserted.id, inserted.name, data.assignedAgentId);
  return { customer: inserted, rawPassword };
}

export async function updateCustomer(
  id: string,
  input: any,
  actor: { type: string; id: string }
) {
  const existing = await getCustomer(id);
  if (!existing) throw new Error("Customer not found");
  const data = customerUpdateSchema.parse(input);
  const now = new Date().toISOString();

  const aadhaar = data.aadhaar && data.aadhaar.length === 12 ? data.aadhaar : undefined;
  const patch: any = { updatedAt: now };
  const d = data as Record<string, any>;
  for (const k of Object.keys(d)) {
    if (k === "aadhaar") continue;
    if (d[k] !== undefined) patch[k] = d[k];
  }
  if (aadhaar) {
    patch.aadhaarEnc = encryptSensitive(aadhaar);
    patch.aadhaarMask = maskAadhaar(aadhaar);
  }

  const [updated] = await db
    .update(customers)
    .set(patch)
    .where(eq(customers.id, id))
    .returning();

  if (data.assignedAgentId !== undefined) {
    await db
      .delete(agentCustomerAssignments)
      .where(eq(agentCustomerAssignments.customerId, id));
    if (data.assignedAgentId) {
      await db.insert(agentCustomerAssignments).values({
        id: genId("ACA"),
        agentId: data.assignedAgentId,
        customerId: id,
        active: 1,
        assignedAt: now,
        assignedBy: actor.id,
      });
    }
  }

  await recomputeCustomerBalance(id);
  await writeAudit({
    actorType: actor.type,
    actorId: actor.id,
    action: "update",
    entity: "customer",
    entityId: id,
    details: { fields: Object.keys(patch) },
  });
  return updated;
}

export async function deleteCustomer(
  id: string,
  actor: { type: string; id: string }
) {
  const existing = await getCustomer(id);
  if (!existing) throw new Error("Customer not found");
  // Soft deactivate for data safety
  const [updated] = await db
    .update(customers)
    .set({ accountStatus: "inactive", loginEnabled: 0, updatedAt: new Date().toISOString() })
    .where(eq(customers.id, id))
    .returning();
  await writeAudit({
    actorType: actor.type,
    actorId: actor.id,
    action: "delete",
    entity: "customer",
    entityId: id,
    details: { customerId: existing.customerId },
  });
  return updated;
}

async function notifyNewCustomer(
  customerId: string,
  name: string,
  agentId?: string
) {
  try {
    const { notify } = await import("../notifications");
    await notify({
      type: NOTIFICATION_TYPES.NEW_CUSTOMER,
      channel: "inapp",
      recipientType: "admin",
      recipientId: "system",
      message: `New customer registered: ${name}`,
    });
    if (agentId) {
      await notify({
        type: NOTIFICATION_TYPES.AGENT_ASSIGNMENT,
        channel: "inapp",
        recipientType: "agent",
        recipientId: agentId,
        message: `New customer ${name} assigned to you.`,
      });
    }
  } catch {}
}
