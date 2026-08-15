import { NextRequest } from "next/server";
import { json, error, getReqSession, cleanMessage } from "@/lib/api";
import { getAgent, updateAgent, deactivateAgent } from "@/lib/services/agents";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const s = await getReqSession(req);
  if (!s || s.role !== "admin") return error("Forbidden", 403);
  const { id } = await params;
  const a = await getAgent(id);
  if (!a) return error("Not found", 404);
  return json({ agent: a });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const s = await getReqSession(req);
  if (!s || s.role !== "admin") return error("Forbidden", 403);
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    const updated = await updateAgent(id, body, { type: "admin", id: s.sub });
    return json({ ok: true, agent: updated });
  } catch (e: any) {
    return error(cleanMessage(e), 400);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const s = await getReqSession(req);
  if (!s || s.role !== "admin") return error("Forbidden", 403);
  const { id } = await params;
  try {
    await deactivateAgent(id, { type: "admin", id: s.sub });
    return json({ ok: true });
  } catch (e: any) {
    return error(cleanMessage(e), 400);
  }
}
