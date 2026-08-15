import { NextRequest } from "next/server";
import { json, error, getReqSession, cleanMessage } from "@/lib/api";
import { listAgents, createAgent } from "@/lib/services/agents";

export async function GET(req: NextRequest) {
  const s = await getReqSession(req);
  if (!s || s.role !== "admin") return error("Forbidden", 403);
  const sp = req.nextUrl.searchParams;
  const rows = await listAgents({ search: sp.get("search") || undefined });
  return json({ agents: rows });
}

export async function POST(req: NextRequest) {
  const s = await getReqSession(req);
  if (!s || s.role !== "admin") return error("Forbidden", 403);
  const body = await req.json().catch(() => ({}));
  try {
    const a = await createAgent(body, { type: "admin", id: s.sub });
    return json({ ok: true, agent: a }, 201);
  } catch (e: any) {
    return error(cleanMessage(e), 400);
  }
}
