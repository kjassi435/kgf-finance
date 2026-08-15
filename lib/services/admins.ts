import { db } from "../db";
import { admins } from "../schema";
import { eq, sql } from "drizzle-orm";
import { genId } from "../id";
import { hashPassword } from "../auth";

async function nextAdminCode(): Promise<string> {
  const [row] = await db.select({ c: sql<number>`count(*)` }).from(admins);
  const n = (row?.c ?? 0) + 1;
  return `ADM-${String(n).padStart(3, "0")}`; // username style
}

export async function listAdmins() {
  return db.select().from(admins).orderBy(sql`${admins.createdAt} desc`);
}

export async function createAdmin(input: {
  name: string;
  username: string;
  email?: string;
  password: string;
  actorId: string;
}) {
  const code = await nextAdminCode();
  const now = new Date().toISOString();
  const [inserted] = await db
    .insert(admins)
    .values({
      id: genId("ADM"),
      username: input.username,
      email: input.email || null,
      name: input.name,
      passwordHash: await hashPassword(input.password),
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return inserted;
}
