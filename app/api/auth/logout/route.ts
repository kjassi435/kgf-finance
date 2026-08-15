import { NextRequest } from "next/server";
import { json } from "@/lib/api";
import { COOKIE_NAME } from "@/lib/auth";
import { getReqSession } from "@/lib/api";
import { writeAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await getReqSession(req);
  const res = json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  if (session) {
    await writeAudit({
      actorType: session.role,
      actorId: session.sub,
      action: "logout",
      entity: "session",
    });
  }
  return res;
}
