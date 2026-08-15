import { db } from "../db";
import { agents, agentCustomerAssignments, customers } from "../schema";
import { eq, like, and, desc, sql } from "drizzle-orm";
import { genId } from "../id";
import { hashPassword } from "../auth";
import { agentCreateSchema, agentUpdateSchema } from "../validators";
import { writeAudit } from "../audit";
import { nextCode } from "./ids";


export async function listAgents(opts: { search?: string; page?: number; pageSize?: number } = {}) {
  const conditions = [];
  if (opts.search) {
    const s = `%${opts.search}%`;
    conditions.push(like(agents.name, s));
  }
  const where = conditions.length ? and(...conditions) : undefined;
  const pageSize = opts.pageSize || 50;
  const page = Math.max(1, opts.page || 1);
  return db
    .select()
    .from(agents)
    .where(where)
    .orderBy(desc(agents.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
}

export async function countAgents(opts: { search?: string } = {}): Promise<number> {
  const conditions = [];
  if (opts.search) {
    const s = `%${opts.search}%`;
    conditions.push(like(agents.name, s));
  }
  const [row] = await db
    .select({ c: sql<number>`count(*)` })
    .from(agents)
    .where(conditions.length ? and(...conditions) : undefined);
  return Number(row?.c || 0);
}

export async function getAgent(id: string) {
  return db.query.agents.findFirst({ where: eq(agents.id, id) });
}

export async function createAgent(input: any, actor: { type: string; id: string }) {
  const data = agentCreateSchema.parse(input);
  const code = await nextCode("AG", agents.agentId, agents, 3);
  const now = new Date().toISOString();
  const [inserted] = await db
    .insert(agents)
    .values({
      id: genId("AGT"),
      agentId: code,
      name: data.name,
      mobile: data.mobile,
      email: data.email || null,
      passwordHash: await hashPassword(data.password),
      status: data.status,
      createdAt: now,
      updatedAt: now,
      createdBy: actor.id,
    })
    .returning();
  await writeAudit({
    actorType: actor.type,
    actorId: actor.id,
    action: "create",
    entity: "agent",
    entityId: inserted.id,
    details: { agentId: code, name: data.name },
  });
  return inserted;
}

export async function updateAgent(
  id: string,
  input: any,
  actor: { type: string; id: string }
) {
  const existing = await getAgent(id);
  if (!existing) throw new Error("Agent not found");
  const data = agentUpdateSchema.parse(input);
  const patch: any = { updatedAt: new Date().toISOString() };
  const d = data as Record<string, any>;
  for (const k of Object.keys(d)) {
    if (d[k] !== undefined) patch[k] = d[k];
  }
  if (data.password) patch.passwordHash = await hashPassword(data.password);
  const [updated] = await db
    .update(agents)
    .set(patch)
    .where(eq(agents.id, id))
    .returning();
  await writeAudit({
    actorType: actor.type,
    actorId: actor.id,
    action: "update",
    entity: "agent",
    entityId: id,
  });
  return updated;
}

export async function deactivateAgent(id: string, actor: { type: string; id: string }) {
  const [updated] = await db
    .update(agents)
    .set({ status: "inactive", updatedAt: new Date().toISOString() })
    .where(eq(agents.id, id))
    .returning();
  await writeAudit({
    actorType: actor.type,
    actorId: actor.id,
    action: "delete",
    entity: "agent",
    entityId: id,
  });
  return updated;
}

export async function assignCustomer(
  agentId: string,
  customerId: string,
  actor: { type: string; id: string },
  active = true
) {
  const now = new Date().toISOString();
  await db
    .update(customers)
    .set({ assignedAgentId: agentId, updatedAt: now })
    .where(eq(customers.id, customerId));
  await db
    .delete(agentCustomerAssignments)
    .where(eq(agentCustomerAssignments.customerId, customerId));
  const [rec] = await db
    .insert(agentCustomerAssignments)
    .values({
      id: genId("ACA"),
      agentId,
      customerId,
      active: active ? 1 : 0,
      assignedAt: now,
      assignedBy: actor.id,
    })
    .returning();
  await writeAudit({
    actorType: actor.type,
    actorId: actor.id,
    action: "update",
    entity: "assignment",
    entityId: customerId,
    details: { agentId, customerId },
  });
  return rec;
}

export async function customersOfAgent(agentId: string) {
  return db
    .select()
    .from(customers)
    .where(eq(customers.assignedAgentId, agentId));
}
