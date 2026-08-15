import { db } from "../db";
import {
  customers,
  agents,
  collections,
  receipts,
  agentCustomerAssignments,
} from "../schema";
import { eq, and, gte, lte, sql, desc, like, or, inArray } from "drizzle-orm";
import { todayISODate, shiftDate } from "../id";

export interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  totalAgents: number;
  todayCollection: number;
  monthlyCollection: number;
  totalCollection: number;
  pendingCollection: number;
  todayPendingCustomers: number;
}

function monthStart(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export async function getDashboardStats(
  scopeAgentId?: string
): Promise<DashboardStats> {
  const today = todayISODate();
  const mStart = monthStart();

  const agentCond = scopeAgentId ? eq(customers.assignedAgentId, scopeAgentId) : undefined;

  const [custAgg] = await db
    .select({
      total: sql<number>`count(*)`,
      active: sql<number>`sum(case when ${customers.accountStatus} = 'active' then 1 else 0 end)`,
      pending: sql<number>`coalesce(sum(${customers.totalPending}),0)`,
    })
    .from(customers)
    .where(agentCond);

  const [agentCount] = await db
    .select({ c: sql<number>`count(*)` })
    .from(agents);

  const todayCond = scopeAgentId
    ? and(eq(collections.date, today), eq(collections.agentId, scopeAgentId))
    : eq(collections.date, today);
  const [todayAgg] = await db
    .select({ sum: sql<number>`coalesce(sum(${collections.amount}),0)` })
    .from(collections)
    .where(todayCond);

  const monthCond = scopeAgentId
    ? and(gte(collections.date, mStart), eq(collections.agentId, scopeAgentId))
    : gte(collections.date, mStart);
  const [monthAgg] = await db
    .select({ sum: sql<number>`coalesce(sum(${collections.amount}),0)` })
    .from(collections)
    .where(monthCond);

  const [totalAgg] = await db
    .select({ sum: sql<number>`coalesce(sum(${collections.amount}),0)` })
    .from(collections);

  const [pendingCust] = await db
    .select({ c: sql<number>`count(*)` })
    .from(customers)
    .where(
      and(
        eq(customers.accountStatus, "active"),
        sql`${customers.totalPending} > 0`,
        agentCond ?? sql`1=1`
      )
    );

  return {
    totalCustomers: Number(custAgg?.total) || 0,
    activeCustomers: Number(custAgg?.active) || 0,
    totalAgents: Number(agentCount?.c) || 0,
    todayCollection: Number(todayAgg?.sum) || 0,
    monthlyCollection: Number(monthAgg?.sum) || 0,
    totalCollection: Number(totalAgg?.sum) || 0,
    pendingCollection: Number(custAgg?.pending) || 0,
    todayPendingCustomers: Number(pendingCust?.c) || 0,
  };
}

export async function dailySeries(days = 30, agentId?: string) {
  const rows = await db
    .select({
      date: collections.date,
      sum: sql<number>`coalesce(sum(${collections.amount}),0)`,
    })
    .from(collections)
    .where(agentId ? eq(collections.agentId, agentId) : undefined)
    .groupBy(collections.date)
    .orderBy(collections.date);

  const map = new Map(rows.map((r) => [r.date, Number(r.sum)]));
  const out: { date: string; amount: number }[] = [];
  const today = todayISODate();
  for (let i = days - 1; i >= 0; i--) {
    const key = shiftDate(today, i);
    out.push({ date: key, amount: map.get(key) || 0 });
  }
  return out;
}

export async function monthlySeries(months = 12, agentId?: string) {
  const rows = await db
    .select({
      month: sql<string>`substr(${collections.date},1,7)`,
      sum: sql<number>`coalesce(sum(${collections.amount}),0)`,
    })
    .from(collections)
    .where(agentId ? eq(collections.agentId, agentId) : undefined)
    .groupBy(sql`substr(${collections.date},1,7)`)
    .orderBy(sql`substr(${collections.date},1,7)`);

  const map = new Map(rows.map((r) => [r.month, Number(r.sum)]));
  const out: { month: string; amount: number }[] = [];
  const [ty, tm] = todayISODate().split("-").map(Number);
  for (let i = months - 1; i >= 0; i--) {
    const dt = new Date(ty, tm - 1 - i, 1);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    out.push({ month: key, amount: map.get(key) || 0 });
  }
  return out;
}

export async function agentPerformance() {
  const rows = await db
    .select({
      agentId: agents.id,
      agentName: agents.name,
      collected: sql<number>`coalesce(sum(${collections.amount}),0)`,
      count: sql<number>`count(${collections.id})`,
    })
    .from(collections)
    .rightJoin(agents, eq(collections.agentId, agents.id))
    .groupBy(agents.id, agents.name)
    .orderBy(desc(sql`sum(${collections.amount})`));
  return rows.map((r) => ({
    agentId: r.agentId,
    agentName: r.agentName,
    collected: Number(r.collected) || 0,
    count: Number(r.count) || 0,
  }));
}

export async function yearSeries(years = 5, agentId?: string) {
  const rows = await db
    .select({
      year: sql<string>`substr(${collections.date},1,4)`,
      sum: sql<number>`coalesce(sum(${collections.amount}),0)`,
    })
    .from(collections)
    .where(agentId ? eq(collections.agentId, agentId) : undefined)
    .groupBy(sql`substr(${collections.date},1,4)`)
    .orderBy(sql`substr(${collections.date},1,4)`);

  const map = new Map(rows.map((r) => [r.year, Number(r.sum)]));
  const out: { year: string; amount: number }[] = [];
  const y = Number(todayISODate().slice(0, 4));
  for (let i = years - 1; i >= 0; i--) {
    const key = String(y - i);
    out.push({ year: key, amount: map.get(key) || 0 });
  }
  return out;
}

export async function paymentModeReport(from?: string, to?: string) {
  const conds = [];
  if (from) conds.push(gte(collections.date, from));
  if (to) conds.push(lte(collections.date, to));
  const rows = await db
    .select({
      mode: collections.paymentMode,
      sum: sql<number>`coalesce(sum(${collections.amount}),0)`,
      count: sql<number>`count(*)`,
    })
    .from(collections)
    .where(conds.length ? and(...conds) : undefined)
    .groupBy(collections.paymentMode);
  return rows.map((r) => ({
    mode: r.mode,
    sum: Number(r.sum) || 0,
    count: Number(r.count) || 0,
  }));
}

export async function customerReport(opts: {
  from?: string;
  to?: string;
  search?: string;
  agentId?: string;
}) {
  const conds = [];
  if (opts.search) {
    const s = `%${opts.search}%`;
    conds.push(or(like(customers.name, s), like(customers.customerId, s)));
  }
  if (opts.agentId) conds.push(eq(customers.assignedAgentId, opts.agentId));
  const base = await db
    .select()
    .from(customers)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(customers.totalDeposited));

  // attach last payment per customer
  const ids = base.map((c) => c.id);
  if (ids.length === 0) return [];
  const lasts = await db
    .select({
      customerId: collections.customerId,
      lastDate: sql<string>`max(${collections.date})`,
    })
    .from(collections)
    .where(inArray(collections.customerId, ids))
    .groupBy(collections.customerId);
  const lastMap = new Map(lasts.map((l) => [l.customerId, l.lastDate]));
  return base.map((c) => ({
    ...c,
    lastPaymentDate: lastMap.get(c.id) || null,
  }));
}

export async function dateRangeTotals(opts: {
  from?: string;
  to?: string;
  agentId?: string;
}) {
  const conds = [];
  if (opts.from) conds.push(gte(collections.date, opts.from));
  if (opts.to) conds.push(lte(collections.date, opts.to));
  if (opts.agentId) conds.push(eq(collections.agentId, opts.agentId));
  const [agg] = await db
    .select({
      total: sql<number>`coalesce(sum(${collections.amount}),0)`,
      count: sql<number>`count(*)`,
    })
    .from(collections)
    .where(conds.length ? and(...conds) : undefined);
  return { total: Number(agg?.total) || 0, count: Number(agg?.count) || 0 };
}
