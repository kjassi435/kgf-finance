import { NextRequest } from "next/server";
import { json, error, getReqSession } from "@/lib/api";
import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const s = await getReqSession(req);
  if (!s || s.role !== "admin") return error("Forbidden", 403);
  const rows = await db.select().from(settings);
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return json({ settings: map });
}

export async function POST(req: NextRequest) {
  const s = await getReqSession(req);
  if (!s || s.role !== "admin") return error("Forbidden", 403);
  const body = await req.json().catch(() => ({}));
  const now = new Date().toISOString();
  for (const key of ["APP_NAME", "CURRENCY"]) {
    if (body[key] === undefined) continue;
    const val = String(body[key]);
    const existing = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);
    if (existing.length) {
      await db
        .update(settings)
        .set({ value: val, updatedAt: now })
        .where(eq(settings.key, key));
    } else {
      await db
        .insert(settings)
        .values({ id: `SET-${key}`, key, value: val, updatedAt: now });
    }
  }
  return json({ ok: true });
}
