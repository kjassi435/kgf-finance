import { NextRequest } from "next/server";
import { json, error, getReqSession } from "@/lib/api";
import { getReceipt } from "@/lib/services/collections";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const s = await getReqSession(req);
  if (!s) return error("Unauthorized", 401);
  const { id } = await params;
  const data = await getReceipt(id);
  if (!data) return error("Not found", 404);
  // Scope: customer can only see own receipt
  if (s.role === "customer" && data.receipt.customerId !== s.sub)
    return error("Forbidden", 403);
  if (s.role === "agent" && data.receipt.agentId !== s.sub)
    return error("Forbidden", 403);
  return json({ data });
}
