import { db } from "../db";
import { admins, agents, customers } from "../schema";
import { eq, or } from "drizzle-orm";
import { verifyPassword, SessionPayload } from "../auth";
import { ROLES } from "../constants";

export interface AuthResult {
  role: string;
  id: string;
  name: string;
  ref: string;
}

export async function authenticate(
  identifier: string,
  password: string
): Promise<AuthResult | null> {
  const id = identifier.trim();

  const admin = await db.query.admins.findFirst({
    where: or(eq(admins.username, id), eq(admins.email, id)),
  });
  if (admin && (await verifyPassword(password, admin.passwordHash))) {
    await db
      .update(admins)
      .set({ lastLoginAt: new Date().toISOString() })
      .where(eq(admins.id, admin.id));
    return { role: ROLES.ADMIN, id: admin.id, name: admin.name, ref: admin.username };
  }

  const agent = await db.query.agents.findFirst({
    where: or(eq(agents.mobile, id), eq(agents.agentId, id)),
  });
  if (
    agent &&
    agent.status === "active" &&
    (await verifyPassword(password, agent.passwordHash))
  ) {
    return { role: ROLES.AGENT, id: agent.id, name: agent.name, ref: agent.agentId };
  }

  const customer = await db.query.customers.findFirst({
    where: or(eq(customers.mobile, id), eq(customers.customerId, id)),
  });
  if (
    customer &&
    customer.loginEnabled === 1 &&
    customer.passwordHash &&
    (await verifyPassword(password, customer.passwordHash))
  ) {
    return {
      role: ROLES.CUSTOMER,
      id: customer.id,
      name: customer.name,
      ref: customer.customerId,
    };
  }

  return null;
}

export function toSessionPayload(r: AuthResult): SessionPayload {
  return { sub: r.id, role: r.role, name: r.name, ref: r.ref };
}
