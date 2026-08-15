import { NextRequest } from "next/server";
import { json, error, setSessionCookie } from "@/lib/api";
import { authenticate, toSessionPayload } from "@/lib/services/auth";
import { signSession, COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { writeAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/session";
import { rateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  const text = await req.text();
  let raw: any;
  try {
    raw = JSON.parse(text);
  } catch (e: any) {
    return error("RAW:[" + text + "] ERR:" + (e?.message || e), 400);
  }
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success)
    return error(JSON.stringify({ msg: parsed.error.issues[0]?.message, raw }), 400);

  const ip = await getClientIp(req);
  if (!rateLimit(`login:${ip}:${parsed.data.identifier}`, 5, 60_000))
    return error("Too many attempts. Please try again in a minute.", 429);

  let result: any;
  try {
    result = await authenticate(parsed.data.identifier, parsed.data.password);
  } catch (e: any) {
    return error(
      `DBG dbUrl=${!!process.env.DATABASE_URL} token=${!!process.env.TURSO_AUTH_TOKEN} err=${e?.message || e}`,
      500
    );
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
