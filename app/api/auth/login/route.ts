import { NextRequest } from "next/server";
import { json, error, setSessionCookie } from "@/lib/api";
import { authenticate, toSessionPayload } from "@/lib/services/auth";
import { signSession, COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { writeAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/session";
import { rateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success)
    return error(parsed.error.issues[0]?.message || "Invalid input", 400);

  const ip = await getClientIp(req);
  if (!rateLimit(`login:${ip}:${parsed.data.identifier}`, 5, 60_000))
    return error("Too many attempts. Please try again in a minute.", 429);

  let result: Awaited<ReturnType<typeof authenticate>>;
  try {
    result = await authenticate(parsed.data.identifier, parsed.data.password);
  } catch {
    return error("Something went wrong. Please try again.", 500);
  }
  if (!result) return error("Invalid credentials", 401);

  const token = await signSession(toSessionPayload(result));
  const res = json({ ok: true, role: result.role, name: result.name });
  setSessionCookie(res, token, req.nextUrl.protocol === "https:");
  await writeAudit({
    actorType: result.role,
    actorId: result.id,
    action: "login",
    entity: "session",
    ip: await getClientIp(req),
  });
  return res;
}
