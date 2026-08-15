import { NextRequest } from "next/server";
import { json, error, getReqSession } from "@/lib/api";
import { db } from "@/lib/db";
import { admins } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const s = await getReqSession(req);
  if (!s || s.role !== "admin") return error("Forbidden", 403);
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!["active", "inactive"].includes(body.status)) {
    return error("Invalid status");
  }
  if (id === s.sub) {
    return error("You cannot deactivate your own account");
  }
  await db.update(admins).set({ status: body.status, updatedAt: new Date().toISOString() }).where(eq(admins.id, id));
  return json({ ok: true });
}
