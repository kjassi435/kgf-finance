import { NextRequest } from "next/server";
import { json, error, getReqSession } from "@/lib/api";
import { db } from "@/lib/db";
import { admins, agents, customers } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, hashPassword } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  const session = await getReqSession(req);
  if (!session) return error("Unauthorized", 401);

  const body = await req.json().catch(() => ({}));
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0]?.message, 400);

  let table: any;
  let record: any;
  if (session.role === "admin") {
    table = admins;
    record = await db.query.admins.findFirst({ where: eq(admins.id, session.sub) });
  } else if (session.role === "agent") {
    table = agents;
    record = await db.query.agents.findFirst({ where: eq(agents.id, session.sub) });
  } else {
    table = customers;
    record = await db.query.customers.findFirst({ where: eq(customers.id, session.sub) });
  }
  if (!record) return error("User not found", 404);

  const ok = await verifyPassword(parsed.data.currentPassword, record.passwordHash);
  if (!ok) return error("Current password is incorrect", 400);

  await db
    .update(table)
    .set({ passwordHash: await hashPassword(parsed.data.newPassword) })
    .where(eq(table.id, session.sub));

  return json({ ok: true });
}
