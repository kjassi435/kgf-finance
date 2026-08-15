import { NextRequest } from "next/server";
import { json, error, getReqSession, cleanMessage } from "@/lib/api";
import { assignCustomer } from "@/lib/services/agents";
import { assignmentSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  const s = await getReqSession(req);
  if (!s || s.role !== "admin") return error("Forbidden", 403);
  const body = await req.json().catch(() => ({}));
  const parsed = assignmentSchema.safeParse(body);
  if (!parsed.success) return error("Invalid input", 400);
  try {
    const rec = await assignCustomer(
      parsed.data.agentId,
      parsed.data.customerId,
      { type: "admin", id: s.sub },
      parsed.data.active
    );
    return json({ ok: true, assignment: rec });
  } catch (e: any) {
    return error(cleanMessage(e), 400);
  }
}
