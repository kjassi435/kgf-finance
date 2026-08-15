import { NextRequest } from "next/server";
import { json, error, getReqSession } from "@/lib/api";
import { listAdmins, createAdmin } from "@/lib/services/admins";
import { adminCreateSchema } from "@/lib/validators";
import { cleanMessage } from "@/lib/api";

export async function GET(req: NextRequest) {
  const s = await getReqSession(req);
  if (!s || s.role !== "admin") return error("Forbidden", 403);
  const rows = await listAdmins();
  return json({ admins: rows.map((a) => ({ ...a, passwordHash: undefined })) });
}

export async function POST(req: NextRequest) {
  const s = await getReqSession(req);
  if (!s || s.role !== "admin") return error("Forbidden", 403);
  const body = await req.json().catch(() => ({}));
  const parsed = adminCreateSchema.safeParse(body);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message || "Invalid input", 400);
  }
  try {
    const a = await createAdmin({
      name: body.name,
      username: body.username,
      email: body.email,
      password: body.password,
      actorId: s.sub,
    });
    return json({ ok: true, admin: { ...a, passwordHash: undefined } }, 201);
  } catch (e: any) {
    return error(cleanMessage(e));
  }
}
