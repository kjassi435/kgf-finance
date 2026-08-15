import { db } from "./db";
import { auditLogs } from "./schema";
import { eq, gte, lte, and, sql } from "drizzle-orm";
import { genId } from "./id";
import { AUDIT_ACTIONS } from "./constants";

interface AuditInput {
  actorType: string;
  actorId: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, any>;
  ip?: string;
}

export async function writeAudit(input: AuditInput): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      id: genId("AUD"),
      actorType: input.actorType,
      actorId: input.actorId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      details: input.details ? JSON.stringify(input.details) : null,
      ip: input.ip ?? null,
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Audit log failed", e);
  }
}

export async function listAuditLogs(opts: {
  actorType?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const conds = [];
  if (opts.actorType) conds.push(eq(auditLogs.actorType, opts.actorType));
  if (opts.action) conds.push(eq(auditLogs.action, opts.action));
  if (opts.from) conds.push(gte(auditLogs.createdAt, opts.from));
  if (opts.to)
    conds.push(lte(auditLogs.createdAt, `${opts.to}T23:59:59.999Z`));
  const where = conds.length ? and(...conds) : undefined;
  const page = Math.max(1, opts.page || 1);
  const pageSize = opts.pageSize || 50;
  const [rows, countRows] = await Promise.all([
    db
      .select()
      .from(auditLogs)
      .where(where)
      .orderBy(sql`${auditLogs.createdAt} desc`)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ c: sql<number>`count(*)` }).from(auditLogs).where(where),
  ]);
  return { rows, total: Number(countRows[0]?.c || 0) };
}

export { AUDIT_ACTIONS };
