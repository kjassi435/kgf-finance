import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, COOKIE_NAME, SessionPayload } from "./auth";
import { db } from "./db";
import { admins, agents, customers } from "./schema";
import { eq } from "drizzle-orm";

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return verifySession(token);
}

export interface CurrentUser {
  id: string;
  role: string;
  name: string;
  ref?: string;
  record: any;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();
  if (!session) return null;
  let record: any = null;
  if (session.role === "admin") {
    record = await db.query.admins.findFirst({
      where: eq(admins.id, session.sub),
    });
  } else if (session.role === "agent") {
    record = await db.query.agents.findFirst({
      where: eq(agents.id, session.sub),
    });
  } else if (session.role === "customer") {
    record = await db.query.customers.findFirst({
      where: eq(customers.id, session.sub),
    });
  }
  if (!record) return null;
  return { id: session.sub, role: session.role, name: session.name, ref: session.ref, record };
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireRole(role: string | string[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  const roles = Array.isArray(role) ? role : [role];
  if (!user || !roles.includes(user.role)) redirect("/login");
  return user;
}

export async function getClientIp(req?: Request): Promise<string | undefined> {
  if (!req) return undefined;
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    undefined
  );
}
