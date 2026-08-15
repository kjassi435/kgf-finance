import { NextRequest } from "next/server";
import { json, error, getReqSession, cleanMessage } from "@/lib/api";
import { listCustomers, createCustomer } from "@/lib/services/customers";

export async function GET(req: NextRequest) {
  const s = await getReqSession(req);
  if (!s || s.role !== "admin") return error("Forbidden", 403);
  const sp = req.nextUrl.searchParams;
  const page = parseInt(sp.get("page") || "1", 10) || 1;
  const result = await listCustomers({
    search: sp.get("search") || undefined,
    agentId: sp.get("agentId") || undefined,
    status: sp.get("status") || undefined,
    page,
    pageSize: parseInt(sp.get("pageSize") || "50", 10),
  });
  return json({ customers: result, total: result.length });
}

export async function POST(req: NextRequest) {
  const s = await getReqSession(req);
  if (!s || s.role !== "admin") return error("Forbidden", 403);
  const body = await req.json().catch(() => ({}));
  try {
    const { customer, rawPassword } = await createCustomer(body, {
      type: "admin",
      id: s.sub,
    });
    return json({ ok: true, customer, password: rawPassword }, 201);
  } catch (e: any) {
    return error(cleanMessage(e), 400);
  }
}
