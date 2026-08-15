import { NextRequest } from "next/server";
import { json, error, getReqSession, cleanMessage } from "@/lib/api";
import { listCollections, createCollection } from "@/lib/services/collections";

export async function GET(req: NextRequest) {
  const s = await getReqSession(req);
  if (!s || (s.role !== "admin" && s.role !== "agent"))
    return error("Forbidden", 403);
  const sp = req.nextUrl.searchParams;
  const page = parseInt(sp.get("page") || "1", 10) || 1;
  const result = await listCollections({
    from: sp.get("from") || undefined,
    to: sp.get("to") || undefined,
    agentId:
      s.role === "agent" ? s.sub : sp.get("agentId") || undefined,
    customerId: sp.get("customerId") || undefined,
    paymentMode: sp.get("paymentMode") || undefined,
    search: sp.get("search") || undefined,
    page,
    pageSize: parseInt(sp.get("pageSize") || "50", 10),
  });
  return json({ collections: result.rows, total: result.total });
}

export async function POST(req: NextRequest) {
  const s = await getReqSession(req);
  if (!s || (s.role !== "admin" && s.role !== "agent"))
    return error("Forbidden", 403);
  const body = await req.json().catch(() => ({}));
  try {
    const result = await createCollection(body, {
      type: s.role,
      id: s.sub,
      agentId: s.role === "agent" ? s.sub : undefined,
    });
    return json({ ok: true, ...result }, 201);
  } catch (e: any) {
    return error(cleanMessage(e), 400);
  }
}
