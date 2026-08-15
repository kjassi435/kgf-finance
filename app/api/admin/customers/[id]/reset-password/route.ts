import { NextRequest } from "next/server";
import { json, error, getReqSession, cleanMessage } from "@/lib/api";
import { getCustomer } from "@/lib/services/customers";
import { db } from "@/lib/db";
import { customers } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";
import { randomPassword } from "@/lib/id";
import { writeAudit } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const s = await getReqSession(req);
  if (!s || s.role !== "admin") return error("Forbidden", 403);
  const { id } = await params;
  try {
    const c = await getCustomer(id);
    if (!c) return error("Customer not found", 404);
    const raw = randomPassword(8);
    await db
      .update(customers)
      .set({ passwordHash: await hashPassword(raw), updatedAt: new Date().toISOString() })
      .where(eq(customers.id, id));
    await writeAudit({
      actorType: "admin",
      actorId: s.sub,
      action: "reset_password",
      entity: "customer",
      entityId: id,
    });
    return json({ ok: true, password: raw });
  } catch (e: any) {
    return error(cleanMessage(e), 400);
  }
}
